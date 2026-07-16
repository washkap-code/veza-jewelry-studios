import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { paymentSettingsQuery } from "../lib/queries";
import { AuthLoader } from "../components/AuthLoader";
import { AdminField, AdminToggle } from "../components/AdminUI";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(paymentSettingsQuery);
  const [enabled, setEnabled] = useState(false);
  const [pk, setPk] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setEnabled(!!data.payments_enabled);
      setPk(data.stripe_publishable_key ?? "");
      setCurrency(data.currency ?? "USD");
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        id: 1,
        payments_enabled: enabled,
        stripe_publishable_key: pk.trim() || null,
        currency: currency.trim().toUpperCase() || "USD",
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("payment_settings")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment_settings"] });
      setMsg("Payment settings saved.");
      setErr(null);
      setTimeout(() => setMsg(null), 2400);
    },
    onError: (e: Error) => setErr(e.message),
  });

  if (isLoading) return <AuthLoader minHeight="30vh" />;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h2 className="font-serif text-2xl text-charcoal">Settings</h2>
        <p className="mt-2 text-sm font-light text-charcoal-soft">
          Configure how the studio accepts payment. Until card payments are enabled,
          the checkout continues to run as an order request handled personally by the atelier.
        </p>
      </div>

      <section className="border border-border/60 bg-warm-white p-8 space-y-6">
        <div>
          <p className="label-eyebrow">Payments</p>
          <h3 className="mt-3 font-serif text-xl text-charcoal">Card payments (Stripe)</h3>
        </div>

        <AdminToggle
          label="Accept card payments"
          checked={enabled}
          onChange={setEnabled}
        />

        <AdminField
          label="Stripe publishable key (pk_live_… or pk_test_…)"
          value={pk}
          onChange={setPk}
          placeholder="pk_live_..."
        />

        <AdminField
          label="Default currency"
          value={currency}
          onChange={(v) => setCurrency(v.toUpperCase())}
          placeholder="USD"
        />

        <p className="text-xs font-light leading-relaxed text-charcoal-soft">
          Note — the matching <span className="font-medium text-charcoal">STRIPE_SECRET_KEY</span> must
          be added as a backend secret in Supabase → Edge Functions → Secrets before card
          payments will actually process. Until then, saving these values is safe but the checkout
          will still fall back to the order-request flow.
        </p>

        {err ? <p className="text-xs font-light text-destructive">{err}</p> : null}
        {msg ? <p className="text-xs font-light text-teal">{msg}</p> : null}

        <button
          className="btn-outline-charcoal"
          onClick={() => save.mutate()}
          disabled={save.isPending}
        >
          {save.isPending ? "Saving" : "Save settings"}
        </button>
      </section>
    </div>
  );
}
