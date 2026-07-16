import { AdminOnly } from "../components/AdminOnly";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthLoader } from "../components/AuthLoader";
import { AdminEmpty, StatusBadge } from "../components/AdminUI";

export const Route = createFileRoute("/admin/commissions")({
  component: AdminCommissions,
});

type CommissionRow = {
  id: string;
  name: string;
  email: string;
  gemstone_preference: string | null;
  metal_preference: string | null;
  budget_range: string | null;
  occasion: string | null;
  description: string | null;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "in consultation", "quoted", "in production", "completed", "declined"];

function AdminCommissions() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);

  const { data: rows } = useQuery({
    queryKey: ["admin", "commissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_requests")
        .select("id, name, email, gemstone_preference, metal_preference, budget_range, occasion, description, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CommissionRow[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("custom_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "commissions"] }),
  });

  if (!rows) return <AuthLoader minHeight="30vh" />;
  if (rows.length === 0) return <AdminEmpty>No commission requests yet.</AdminEmpty>;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-charcoal">Commissions</h2>
      <ul className="divide-y divide-border/60 border-t border-border/60">
        {rows.map((r) => {
          const expanded = open === r.id;
          return (
            <li key={r.id} className="py-5">
              <button className="flex w-full flex-wrap items-center gap-4 text-left" onClick={() => setOpen(expanded ? null : r.id)}>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg text-charcoal">{r.name}</p>
                  <p className="mt-1 text-xs font-light text-charcoal-soft">
                    {r.gemstone_preference ?? "Stone TBD"} · {r.budget_range ?? "Budget TBD"} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </button>
              {expanded ? (
                <div className="mt-5 space-y-4 border-t border-border/40 pt-5">
                  <p className="text-sm font-light leading-relaxed text-charcoal">{r.description}</p>
                  <p className="text-xs font-light text-charcoal-soft">
                    {r.email}{r.metal_preference ? ` · ${r.metal_preference}` : ""}{r.occasion ? ` · ${r.occasion}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={setStatus.isPending || s === r.status}
                        onClick={() => setStatus.mutate({ id: r.id, status: s })}
                        className={`border px-3 py-1.5 text-[0.65rem] font-light uppercase tracking-[0.18em] transition-colors duration-500 ${s === r.status ? "border-teal text-teal" : "border-border text-charcoal-soft hover:border-teal hover:text-teal"}`}
                      >
                        {s}
                      </button>
                    ))}
                    <a href={`mailto:${r.email}?subject=Your VEZA commission`} className="border border-charcoal px-3 py-1.5 text-[0.65rem] font-light uppercase tracking-[0.18em] text-charcoal transition-colors duration-500 hover:border-teal hover:text-teal">
                      Reply by email
                    </a>
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
