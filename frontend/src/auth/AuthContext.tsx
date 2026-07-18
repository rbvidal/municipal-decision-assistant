import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { setAuthToken, apiClient, onUnauthorized, trySilentRefresh } from "../api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
  initials: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function userFromResponse(data: { id: string; email: string; displayName: string; roles: string[] }): AuthUser {
  return {
    id: data.id,
    name: data.displayName,
    email: data.email,
    department: data.roles?.join(", ") ?? "",
    initials: deriveInitials(data.displayName),
    role: data.roles?.[0] ?? "USER",
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try silent token refresh on mount
  useEffect(() => {
    const init = async () => {
      const hasRefreshToken = !!localStorage.getItem("refreshToken");
      if (hasRefreshToken) {
        const ok = await trySilentRefresh();
        if (ok) {
          try {
            const me = await apiClient.get<{
              id: string; email: string; displayName: string; roles: string[];
            }>("/api/auth/me");
            setUser(userFromResponse(me));
          } catch {
            setAuthToken(null);
            localStorage.removeItem("refreshToken");
          }
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // Wire 401 interceptor to logout
  useEffect(() => {
    onUnauthorized(() => {
      setAuthToken(null);
      localStorage.removeItem("refreshToken");
      setUser(null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const tokens = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        userId: string;
        email: string;
        displayName?: string;
        roles: string[];
      }>("/api/auth/login", { email, password });

      setAuthToken(tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      // Fetch current user details
      try {
        const me = await apiClient.get<{
          id: string;
          email: string;
          displayName: string;
          roles: string[];
        }>("/api/auth/me");
        setUser(userFromResponse(me));
      } catch {
        // Fallback: use data from login response
        setUser({
          id: tokens.userId,
          name: tokens.displayName ?? email,
          email: tokens.email,
          department: tokens.roles?.join(", ") ?? "",
          initials: deriveInitials(tokens.displayName ?? email),
          role: tokens.roles?.[0] ?? "USER",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      apiClient.post("/api/auth/logout", { refreshToken }).catch(() => {});
      localStorage.removeItem("refreshToken");
    }
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
