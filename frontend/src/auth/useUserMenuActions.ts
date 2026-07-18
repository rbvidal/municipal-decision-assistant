import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export interface UserMenuAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

/**
 * Returns the standard user menu actions wired to auth state.
 * Pages pass these to TopNavigation's userActions prop.
 */
export function useUserMenuActions(): UserMenuAction[] {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return [
    { id: "profile", label: "Profil", onClick: handleProfile },
    { id: "logout", label: "Abmelden", onClick: handleLogout, variant: "danger" },
  ];
}
