import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { FadeIn } from "../components/FadeIn";
import { AuthLoader } from "../components/AuthLoader";
import { VezaLogo } from "../components/VezaLogo";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/change-password")({
  head: () => ({
    meta: [{ title: "Change password — VEZA Jewelry Studios" }],
  }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const { user, profile, loading, isAdmin, mustChangePassword, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/account", replace: true });
  }, [loading, user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw1.length < 10) return setErr("Please choose a password of at least ten characters.");
    if (pw1 !== pw2) return setErr("The two passwords do not match.");
    setSubmitting(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: pw1 });
      if (updateErr) throw updateErr;
      if (profile?.id) {
        const { error: flagErr } = await supabase
          .from("profiles")
          .update({ must_change_password: false })
          .eq("id", profile.id);
        if (flagErr) throw flagErr;
      }
      await refreshProfile();
      setOk(true);
      setTimeout(() => navigate({ to: isAdmin ? "/admin" : "/account", replace: true }), 900);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something interrupted our craft.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return <AuthLoader minHeight="70vh" showHomeLink />;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg items-center px-6 py-20">
      <FadeIn className="w-full">
        <div className="border border-border/60 bg-warm-white px-8 py-12 md:px-12 md:py-14">
          <div className="flex flex-col items-center text-center">
            <VezaLogo variant="mark" className="h-10 w-10 text-teal" />
            <p className="label-eyebrow mt-8">The Atelier</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
              {mustChangePassword ? "Please set your password" : "Change your password"}
            </h1>
            <span className="gold-rule mt-6" />
            {mustChangePassword ? (
              <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-charcoal-soft">
                For your security, please replace the temporary password before entering the studio.
              </p>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            <label className="block">
              <span className="label-eyebrow">New password</span>
              <input
                type="password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                autoComplete="new-password"
                required
                className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal"
              />
            </label>
            <label className="block">
              <span className="label-eyebrow">Confirm new password</span>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                required
                className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal"
              />
            </label>
            {err ? <p className="text-xs font-light text-destructive">{err}</p> : null}
            {ok ? <p className="text-xs font-light text-teal">Password set. Welcome.</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="btn-outline-charcoal w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving" : "Set password"}
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
