import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase, type Order, type Profile } from "../lib/supabase";
import { AuthLoader } from "../components/AuthLoader";
import { AdminEmpty, StatusBadge } from "../components/AdminUI";
import { formatPrice } from "../lib/cart";
import { useAuth } from "../lib/auth";
import { logAudit } from "../lib/audit";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "confirmed", "in production", "shipped", "delivered", "cancelled"];
const ADMIN_ONLY_STATUSES = new Set(["cancelled"]);

type OrderRow = Order & {
  shipping_address: Record<string, string> | null;
  gift_message: string | null;
};

type ItemRow = { id: string; order_id: string; quantity: number; unit_price: number; product: { name: string } | null };

function AdminOrders() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const role: "admin" | "staff" = isAdmin ? "admin" : "staff";
  const [open, setOpen] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (orders ?? []) as OrderRow[];
      const userIds = [...new Set(rows.map((o) => o.user_id))];
      let profiles: Profile[] = [];
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("*").in("id", userIds);
        profiles = (profs ?? []) as Profile[];
      }
      const { data: items } = await supabase
        .from("order_items")
        .select("id, order_id, quantity, unit_price, product:products(name)");
      return {
        orders: rows,
        profiles: new Map(profiles.map((p) => [p.id, p])),
        items: ((items ?? []) as unknown as ItemRow[]),
      };
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  if (!data) return <AuthLoader minHeight="30vh" />;
  if (data.orders.length === 0) return <AdminEmpty>No orders yet.</AdminEmpty>;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-charcoal">Orders</h2>
      <ul className="divide-y divide-border/60 border-t border-border/60">
        {data.orders.map((o) => {
          const profile = data.profiles.get(o.user_id);
          const items = data.items.filter((i) => i.order_id === o.id);
          const expanded = open === o.id;
          return (
            <li key={o.id} className="py-5">
              <button className="flex w-full flex-wrap items-center gap-4 text-left" onClick={() => setOpen(expanded ? null : o.id)}>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg text-charcoal">
                    {profile?.full_name || profile?.email || "Customer"} · {o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs font-light text-charcoal-soft">
                    {new Date(o.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    {" · "}{items.reduce((n, i) => n + i.quantity, 0)} item(s)
                  </p>
                </div>
                <p className="font-serif text-xl text-charcoal">{formatPrice(Number(o.total), o.currency)}</p>
                <StatusBadge status={o.status} />
              </button>
              {expanded ? (
                <div className="mt-5 grid gap-6 border-t border-border/40 pt-5 md:grid-cols-2">
                  <div>
                    <p className="label-eyebrow">Items</p>
                    <ul className="mt-3 space-y-2 text-sm font-light text-charcoal">
                      {items.map((i) => (
                        <li key={i.id} className="flex justify-between gap-4">
                          <span>{i.product?.name ?? "Item"} × {i.quantity}</span>
                          <span>{formatPrice(Number(i.unit_price) * i.quantity, o.currency)}</span>
                        </li>
                      ))}
                    </ul>
                    {o.gift_message ? (
                      <p className="mt-4 text-xs font-light italic text-charcoal-soft">Gift note: "{o.gift_message}"</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="label-eyebrow">Delivery</p>
                    {o.shipping_address ? (
                      <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-soft">
                        {[o.shipping_address.fullName, o.shipping_address.line1, o.shipping_address.line2, o.shipping_address.city, o.shipping_address.region, o.shipping_address.postalCode, o.shipping_address.country, o.shipping_address.phone].filter(Boolean).join(", ")}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm font-light text-charcoal-soft">No address recorded.</p>
                    )}
                    <p className="label-eyebrow mt-5">Contact</p>
                    <p className="mt-2 text-sm font-light text-charcoal-soft">{profile?.email ?? "—"} {profile?.phone ? `· ${profile.phone}` : ""}</p>
                    <p className="label-eyebrow mt-5">Status</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          disabled={setStatus.isPending || s === o.status}
                          onClick={() => setStatus.mutate({ id: o.id, status: s })}
                          className={`border px-3 py-1.5 text-[0.65rem] font-light uppercase tracking-[0.18em] transition-colors duration-500 ${s === o.status ? "border-teal text-teal" : "border-border text-charcoal-soft hover:border-teal hover:text-teal"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
