export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message, 422, "VALIDATION_ERROR", fieldErrors);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Nicht autorisiert") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

function mapSpringError(status: number, body: Record<string, unknown>): ApiError {
  const message = (body.message as string) ?? (body.error as string) ?? `HTTP ${status}`;
  const code = body.code as string | undefined;
  const errors = body.errors as Record<string, string> | undefined;

  switch (status) {
    case 401:
      return new UnauthorizedError(message);
    case 422:
      return new ValidationError(message, errors ?? {});
    case 403:
      return new ApiError(message, 403, "FORBIDDEN");
    case 404:
      return new ApiError(message, 404, "NOT_FOUND");
    case 409:
      return new ApiError(message, 409, "CONFLICT");
    case 500:
      return new ApiError(message, 500, "SERVER_ERROR");
    default:
      return new ApiError(message, status, code);
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private _onUnauthorized?: () => void;

  constructor(baseUrl: string, options?: { timeout?: number; onUnauthorized?: () => void }) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = options?.timeout ?? 30_000;
    this._onUnauthorized = options?.onUnauthorized;
  }

  /** Sets a callback to invoke on 401 responses. */
  set onUnauthorized(cb: (() => void) | undefined) {
    this._onUnauthorized = cb;
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (config.params) {
      Object.entries(config.params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    const token = inMemoryToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? this.defaultTimeout);
    const signal = config.signal ?? controller.signal;

    try {
      const response = await fetch(url.toString(), {
        method: config.method ?? "GET",
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal,
        credentials: "same-origin",
      });

      if (response.status === 401 && this._onUnauthorized) {
        this._onUnauthorized();
      }

      if (!response.ok) {
        let errorBody: Record<string, unknown> = {};
        try {
          errorBody = await response.json();
        } catch {
          /* no body */
        }
        throw mapSpringError(response.status, errorBody);
      }

      if (response.status === 204) return undefined as T;
      return response.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if ((err as Error).name === "AbortError") {
        throw new ApiError("Anfrage abgebrochen", 0, "ABORTED");
      }
      throw new ApiError((err as Error).message ?? "Netzwerkfehler", 0, "NETWORK_ERROR");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  /**
   * Server-Sent Events streaming request.
   * Parses SSE lines ("data: {...}") and invokes onEvent for each.
   * Uses the same auth, error handling, and timeout as other methods.
   */
  async stream<T>(
    path: string,
    onEvent: (data: T) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const url = new URL(`${this.baseUrl}${path}`);
    const headers: Record<string, string> = {};
    const token = inMemoryToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);
    const effectiveSignal = signal ?? controller.signal;

    try {
      const response = await fetch(url.toString(), { headers, signal: effectiveSignal });

      if (response.status === 401 && this._onUnauthorized) {
        this._onUnauthorized();
      }

      if (!response.ok) {
        let errorBody: Record<string, unknown> = {};
        try { errorBody = await response.json(); } catch { /* no body */ }
        throw mapSpringError(response.status, errorBody);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new ApiError("Streaming wird nicht unterstützt", 0, "STREAM_UNSUPPORTED");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              onEvent(JSON.parse(line.slice(6)));
            } catch {
              /* skip unparseable chunks */
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if ((err as Error).name === "AbortError") {
        throw new ApiError("Stream abgebrochen", 0, "ABORTED");
      }
      throw new ApiError((err as Error).message ?? "Stream-Fehler", 0, "STREAM_ERROR");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Retries a request up to `retries` times with exponential backoff.
   * Only retries on network errors and 5xx responses.
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    backoffMs: number = 1000,
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === retries) throw err;
        if (err instanceof ApiError) {
          if (err.status >= 500 || err.code === "NETWORK_ERROR" || err.code === "ABORTED") {
            await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt)));
            continue;
          }
          throw err;
        }
        throw err;
      }
    }
    throw new ApiError("Max retries exceeded", 0, "RETRY_EXHAUSTED");
  }

  async upload<T>(path: string, file: File, onProgress?: (pct: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    const token = inMemoryToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${this.baseUrl}${path}`);
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(xhr.responseText as unknown as T);
          }
        } else {
          let body: Record<string, unknown> = {};
          try {
            body = JSON.parse(xhr.responseText);
          } catch {
            /* no body */
          }
          reject(mapSpringError(xhr.status, body));
        }
      };

      xhr.onerror = () => reject(new ApiError("Upload fehlgeschlagen", 0, "UPLOAD_ERROR"));
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient(
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  { timeout: 30_000 },
);

/** Registers a callback invoked when any API request receives a 401 response. */
export function onUnauthorized(callback: () => void): void {
  apiClient.onUnauthorized = callback;
}

/** Attempts a silent token refresh. Returns true if successful. */
export async function trySilentRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
    const response = await fetch(`${baseUrl}/api/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) {
      localStorage.removeItem("refreshToken");
      return false;
    }

    const data = await response.json();
    setAuthToken(data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return true;
  } catch {
    return false;
  }
}
