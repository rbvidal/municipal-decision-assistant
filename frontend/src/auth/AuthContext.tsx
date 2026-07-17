import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { setAuthToken } from '../api';

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

const MOCK_USER: AuthUser = {
  id: 'u1',
  name: 'Sabine Müller',
  email: 's.mueller@verwaltung.de',
  department: 'Bauaufsicht',
  initials: 'SM',
  role: 'Sachbearbeiter',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (_email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setAuthToken('mock-token');
    setUser(MOCK_USER);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
