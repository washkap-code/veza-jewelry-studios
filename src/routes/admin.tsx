import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthLoader } from "../components/AuthLoader";
import { VezaLogo } from "../components/VezaLogo";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — VEZA Jewelry Studios" }],
  }),
  component: AdminLayout,
});

const ALL_LINKS = [
  { to: "/admin", label: "Dashboard", exact: true, staff: true },
  { to: "/admin/products", label: "Products", staff: false },
  { to: "/admin/collections", label: "Collections", staff: false },
  { to: "/admin/gemstones", label: "Gemstones", staff: false },
  { to: "/admin/gallery", label: "Gallery", staff: true },
  { to: "/admin/orders", label: "Orders", staff: true },
  { to: "/admin/journal", label: "Journal", staff: true },
  { to: "/admin/commissions", label: "Commissions", staff: false },
  { to: "/admin/newsletter", label: "Newsletter", staff: false },
  { to: "/admin/calendar", label: "Calendar", staff: false },
  { to: "/admin/settings", label: "Settings", staff: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, isStaff, mustChangePassword, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/account", replace: true });
    else if (mustChangePassword) navigate({ to: "/change-password", replace: true });
  }, [loading, user, mustChangePassword, navigate]);

  if (loading || !user || mustChangePassword) return <AuthLoader minHeight="70vh" showHomeLink />;

  const hasAccess = isAdmin || isStaff;
  const LINKS = isAdmin ? ALL_LINKS : ALL_LINKS.filter((l) => l.staff);

  if (!hasAccess) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <VezaLogo variant="mark" className="h-8 w-8 text-teal/60" />
        <p className="label-eyebrow mt-8">Restricted</p>
        <h1 className="mt-4 font-serif text-4xl text-charcoal">The atelier only.</h1>
        <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-charcoal-soft">
          This area is reserved for VEZA staff. If you believe you should have access, please
          contact the studio.
        </p>
        <Link to="/" className="btn-outline-charcoal mt-10">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="label-eyebrow">The Atelier — Internal</p>
          <h1 className="mt-3 font-serif text-4xl text-charcoal md:text-5xl">Admin</h1>
        </div>
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[200px_1fr]">
        <nav
          data-testid="admin-sidebar"
          data-role={isAdmin ? "admin" : "staff"}
          className="flex flex-row flex-wrap gap-x-6 gap-y-2 border-b border-border/60 pb-4 lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6"
        >
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`admin-nav-${l.label.toLowerCase()}`}
              activeOptions={{ exact: !!("exact" in l && l.exact) }}
              className="py-1.5 text-[0.72rem] font-light uppercase tracking-[0.22em] text-charcoal/60 transition-colors duration-500 hover:text-charcoal"
              activeProps={{ className: "text-teal" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
