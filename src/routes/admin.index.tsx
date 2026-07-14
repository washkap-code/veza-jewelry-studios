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
  );
}
