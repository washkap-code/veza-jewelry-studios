import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

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
  const { data } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [products, published, orders, pendingOrders, commissions, journal] = await Promise.all([
        count("products"),
        count("products", (q) => q.eq("published", true)),
        count("orders"),
        count("orders", (q) => q.eq("status", "pending")),
        count("custom_requests", (q) => q.eq("status", "new")),
        count("journal_posts"),
      ]);
      return { products, published, orders, pendingOrders, commissions, journal };
    },
  });

  const cards = [
    { label: "Products", value: data?.products, sub: `${data?.published ?? "—"} published`, to: "/admin/products" },
    { label: "Orders", value: data?.orders, sub: `${data?.pendingOrders ?? "—"} pending`, to: "/admin/orders" },
    { label: "New commissions", value: data?.commissions, sub: "awaiting reply", to: "/admin/commissions" },
    { label: "Journal posts", value: data?.journal, sub: "drafts & published", to: "/admin/journal" },
  ];

  return (
    <div className="space-y-8">
      <NewsletterReminderBanner />
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
    </div>
  );
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

