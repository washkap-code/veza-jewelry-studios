import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";
import { AuthLoader } from "./AuthLoader";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/account", replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) return <AuthLoader />;
  return <>{children}</>;
}

export default ProtectedRoute;
