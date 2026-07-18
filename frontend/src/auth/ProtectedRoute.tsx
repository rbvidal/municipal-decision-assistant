import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { LoadingOverlay } from "../components/interaction";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Auth guard. Redirects unauthenticated users to /login,
 * preserving the intended destination as a query parameter.
 * Shows a full-screen loader while auth state is being determined.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = React.memo(({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingOverlay visible message="Authentifizierung..." blocking />;
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = "ProtectedRoute";
