import { Link } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";
import { VezaLogo } from "../components/VezaLogo";
import type { ReactNode } from "react";

/**
 * Wrap admin-only sub-pages that staff should not access.
 * Shows a "restricted" panel with a link back to the dashboard.
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return <>{children}</>;
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <VezaLogo variant="mark" className="h-8 w-8 text-teal/60" />
      <p className="label-eyebrow mt-8">Admin only</p>
      <h2 className="mt-4 font-serif text-3xl text-charcoal">Not part of your remit.</h2>
      <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-charcoal-soft">
        This section is reserved for the studio owner. Please ask an admin if you
        need something changed here.
      </p>
      <Link to="/admin" className="btn-outline-charcoal mt-10">Back to dashboard</Link>
    </div>
  );
}
