import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { AuditRow } from "../lib/audit";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

async function count(table: string, filter?: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

function AdminDashboard() {
  const { isAdmin, profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0];

  const { data } = useQuery({
    queryKey: ["admin", "dashboard", isAdmin ? "admin" : "staff"],
    queryFn: async () => {
      const [products, published, orders, pendingOrders, commissions, journal, gallery] = await Promise.all([
        isAdmin ? count("products") : Promise.resolve(0),
        isAdmin ? count("products", (q) => q.eq("published", true)) : Promise.resolve(0),
        count("orders"),
        count("orders", (q) => q.eq("status", "pending")),
        isAdmin ? count("custom_requests", (q) => q.eq("status", "new")) : Promise.resolve(0),
        count("journal_posts"),
        count("gallery_images"),
      ]);
      return { products, published, orders, pendingOrders, commissions, journal, gallery };
    },
  });

  const adminCards = [
    { label: "Products", value: data?.products, sub: `${data?.published ?? "—"} published`, to: "/admin/products" as const },
    { label: "Orders", value: data?.orders, sub: `${data?.pendingOrders ?? "—"} pending`, to: "/admin/orders" as const },
    { label: "New commissions", value: data?.commissions, sub: "awaiting reply", to: "/admin/commissions" as const },
    { label: "Journal posts", value: data?.journal, sub: "drafts & published", to: "/admin/journal" as const },
  ];
  const staffCards = [
    { label: "Orders", value: data?.orders, sub: `${data?.pendingOrders ?? "—"} pending`, to: "/admin/orders" as const },
    { label: "Journal posts", value: data?.journal, sub: "add & edit posts", to: "/admin/journal" as const },
    { label: "Gallery", value: data?.gallery, sub: "images uploaded", to: "/admin/gallery" as const },
  ];
  const cards = isAdmin ? adminCards : staffCards;

  return (
    <div className="space-y-8" data-testid="admin-dashboard" data-role={isAdmin ? "admin" : "staff"}>
      {!isAdmin ? (
        <div>
          <p className="label-eyebrow">Staff — Studio Team</p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal">
            {firstName ? `Welcome, ${firstName}.` : "Welcome to the atelier."}
          </h2>
          <p className="mt-2 text-sm font-light text-charcoal-soft">
            Add journal posts, upload gallery images, and process orders below.
          </p>
        </div>
      ) : (
        <NewsletterReminderBanner />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group border border-border/60 bg-warm-white p-8 transition-colors duration-500 hover:border-teal/50"
          >
            <p className="label-eyebrow">{c.label}</p>
            <p className="mt-4 font-serif text-5xl text-charcoal">{c.value ?? "—"}</p>
            <p className="mt-2 text-xs font-light text-charcoal-soft">{c.sub}</p>
          </Link>
        ))}
      </div>

      {isAdmin ? <RecentAudit /> : null}

      {isAdmin ? (
        <a
          href="/guides/veza-studio-manual.pdf"
          download
          className="flex flex-wrap items-center justify-between gap-4 border border-gold/40 bg-warm-white p-6 transition-colors duration-500 hover:border-teal/50"
        >
          <div>
            <p className="label-eyebrow text-gold">Studio Manual</p>
            <p className="mt-2 font-serif text-2xl text-charcoal">VEZA — Studio Manual</p>
            <p className="mt-1 text-xs font-light text-charcoal-soft">
              Everything Ms. Chiganze needs — signing in, collections, products, gallery, orders, newsletter, calendar, payments.
            </p>
          </div>
          <span className="text-[0.7rem] font-light uppercase tracking-[0.22em] text-teal">Download PDF ↓</span>
        </a>
      ) : null}
    </div>
  );
}

function RecentAudit() {
  const { data, isError } = useQuery({
    queryKey: ["admin", "audit", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
  });

  if (isError) {
    return (
      <div className="border border-border/60 bg-warm-white p-6">
        <p className="label-eyebrow">Recent activity</p>
        <p className="mt-3 text-xs font-light text-charcoal-soft">
          Audit log unavailable. Run <code className="font-mono">docs/migrations/audit_log.sql</code> in the SQL editor to enable it.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border/60 bg-warm-white p-6">
      <div className="flex items-baseline justify-between">
        <p className="label-eyebrow">Recent activity</p>
        <span className="text-[0.62rem] font-light uppercase tracking-[0.22em] text-charcoal-soft/70">Staff & admin actions</span>
      </div>
      {!data || data.length === 0 ? (
        <p className="mt-4 text-xs font-light text-charcoal-soft">No activity recorded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/40">
          {data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="font-serif text-sm text-charcoal">
                  <span className="text-teal">{r.actor_role}</span>{" "}
                  {r.actor_email ?? r.actor_id.slice(0, 8)} — {r.action}
                </p>
                {r.meta ? (
                  <p className="mt-0.5 truncate text-[0.68rem] font-light text-charcoal-soft/80">
                    {formatMeta(r.meta)}
                  </p>
                ) : null}
              </div>
              <span className="text-[0.62rem] font-light uppercase tracking-[0.18em] text-charcoal-soft/60">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatMeta(meta: Record<string, unknown>): string {
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ");
}

function NewsletterReminderBanner() {
  const { data: lastSent } = useQuery({
    queryKey: ["admin", "last-newsletter-sent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletters")
        .select("sent_at, subject")
        .eq("status", "sent")
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as { sent_at: string | null; subject: string | null } | null;
    },
  });
  const days = lastSent?.sent_at
    ? Math.floor((Date.now() - new Date(lastSent.sent_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  if (days < 30) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-gold/50 bg-gold/5 p-5">
      <div>
        <p className="label-eyebrow text-gold">Monthly letter due</p>
        <p className="mt-2 text-sm font-light text-charcoal">
          {lastSent?.sent_at
            ? `It's been ${days} days since your last letter. Time to write to the list.`
            : "You haven't sent a letter yet. The list is waiting."}
        </p>
      </div>
      <Link to="/admin/newsletter" className="btn-outline-charcoal">Compose letter</Link>
    </div>
  );
}

