import { type Page } from "@playwright/test";

const DEFAULT_ALLOW = [
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /google-font/i,
  /favicon/i,
  /third-party/i,
  // Vite dev-mode source preloading (ERR_ABORTED on .tsx/.ts source files)
  /net::ERR_ABORTED.*\.tsx/i,
  /net::ERR_ABORTED.*\.ts\b/i,
  /net::ERR_ABORTED.*hot-update/i,
  /net::ERR_ABORTED.*\.css\?/i,
  // Token refresh — race conditions cause 409 (already used) and 401 (expired)
  // These appear both as console errors ("Failed to load resource") and as response status codes
  /Failed to load resource.*409/i,
  /Failed to load resource.*401/i,
  /api\/auth\/refresh/i,
  // Qdrant OPTIONS preflight can cause CORS warnings in dev
  /qdrant.*CORS/i,
  /qdrant.*403/i,
];

export interface ConsoleErrorEntry {
  type: "error" | "warning" | "failed-request" | "unhandled-rejection";
  message: string;
  url?: string;
}

/**
 * Track console/network errors. `assertNoErrors()` fails if any are found,
 * unless they match one of the allow patterns.
 */
export function trackConsoleErrors(page: Page) {
  const errors: ConsoleErrorEntry[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push({ type: "error", message: msg.text(), url: msg.location().url });
    }
  });

  page.on("pageerror", (err) => {
    errors.push({ type: "error", message: err.message });
  });

  page.on("requestfailed", (req) => {
    const failure = req.failure();
    if (failure) {
      errors.push({
        type: "failed-request",
        message: `${req.method()} ${req.url()} — ${failure.errorText}`,
        url: req.url(),
      });
    }
  });

  return {
    getErrors: () => [...errors],
    clearErrors: () => { errors.length = 0; },
    assertNoErrors: (extraAllow: RegExp[] = []) => {
      const allowed = [...DEFAULT_ALLOW, ...extraAllow];
      const filtered = errors.filter(
        (e) => !allowed.some((p) => p.test(e.message) || p.test(e.url ?? "")),
      );
      if (filtered.length > 0) {
        const details = filtered
          .map((e) => `[${e.type}] ${e.message}${e.url ? ` (${e.url})` : ""}`)
          .join("\n  ");
        throw new Error(`Browser errors:\n  ${details}`);
      }
    },
  };
}
