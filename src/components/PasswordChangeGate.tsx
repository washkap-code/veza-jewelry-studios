import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

const ALLOWED_PATHS = new Set(["/change-password", "/reset-password"]);

export function PasswordChangeGate() {
  const { user, mustChangePassword, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading || !user || !mustChangePassword) return;
    if (ALLOWED_PATHS.has(pathname)) return;
    navigate({ to: "/change-password", replace: true });
  }, [loading, user, mustChangePassword, pathname, navigate]);

  return null;
}

export default PasswordChangeGate;
