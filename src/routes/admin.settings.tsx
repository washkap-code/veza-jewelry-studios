import { AdminOnly } from "../components/AdminOnly";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { paymentSettingsQuery } from "../lib/queries";
import { AuthLoader } from "../components/AuthLoader";
import { AdminField, AdminToggle } from "../components/AdminUI";

export const Route = createFileRoute("/admin/settings")({
  component: () => (<AdminOnly><AdminSettings /></AdminOnly>),
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

      <TeamPanel />
    </div>
  );
}

type TeamMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  is_staff: boolean;
  created_at: string;
};

function TeamPanel() {
  const qc = useQueryClient();
  const [emailLookup, setEmailLookup] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_admin, is_staff, created_at")
        .or("is_admin.eq.true,is_staff.eq.true")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
  });

  const update = useMutation({
    mutationFn: async (args: { id: string; patch: Partial<Pick<TeamMember, "is_admin" | "is_staff">> }) => {
      const { error } = await supabase.from("profiles").update(args.patch).eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "team"] });
      setFeedback("Team updated.");
      setError(null);
      setTimeout(() => setFeedback(null), 2400);
    },
    onError: (e: Error) => setError(e.message),
  });

  const grantStaff = useMutation({
    mutationFn: async (email: string) => {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) throw new Error("Enter an email address.");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", trimmed)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        throw new Error(
          "No account found with that email. Ask them to sign up at /account first, then grant access here.",
        );
      }
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ is_staff: true })
        .eq("id", data.id);
      if (upErr) throw upErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "team"] });
      setEmailLookup("");
      setFeedback("Staff access granted.");
      setError(null);
      setTimeout(() => setFeedback(null), 2400);
    },
    onError: (e: Error) => {
      setError(e.message);
      setFeedback(null);
    },
  });

  return (
    <section className="border border-border/60 bg-warm-white p-8 space-y-6">
      <div>
        <p className="label-eyebrow">Team</p>
        <h3 className="mt-3 font-serif text-xl text-charcoal">Studio access</h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-charcoal-soft">
          Admins have full control of the atelier. Staff can help with the journal,
          the gallery, and processing orders — nothing else.
        </p>
      </div>

      <div className="space-y-3">
        <p className="label-eyebrow">Grant staff access</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <AdminField
            label="Email address"
            value={emailLookup}
            onChange={setEmailLookup}
            placeholder="assistant@example.com"
            className="flex-1"
          />
          <button
            type="button"
            className="btn-outline-charcoal disabled:opacity-60"
            disabled={grantStaff.isPending || !emailLookup.trim()}
            onClick={() => grantStaff.mutate(emailLookup)}
          >
            {grantStaff.isPending ? "Granting" : "Grant staff"}
          </button>
        </div>
        <p className="text-xs font-light text-charcoal-soft">
          The person must have signed up on the site first (via <span className="font-medium text-charcoal">/account</span>).
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm font-light text-charcoal-soft">Loading team…</p>
      ) : !members || members.length === 0 ? (
        <p className="text-sm font-light text-charcoal-soft">No team members yet.</p>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base text-charcoal">
                  {m.full_name ?? "Unnamed"}
                </p>
                <p className="truncate text-xs font-light text-charcoal-soft">{m.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <AdminToggle
                  label="Staff"
                  checked={m.is_staff}
                  onChange={(v) => update.mutate({ id: m.id, patch: { is_staff: v } })}
                />
                <AdminToggle
                  label="Admin"
                  checked={m.is_admin}
                  onChange={(v) => update.mutate({ id: m.id, patch: { is_admin: v } })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-xs font-light text-destructive">{error}</p> : null}
      {feedback ? <p className="text-xs font-light text-teal">{feedback}</p> : null}
    </section>
  );
}
