import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FadeIn } from "../components/FadeIn";
import { AuthLoader } from "../components/AuthLoader";
import { PasswordInput } from "../components/PasswordInput";
import { VezaLogo } from "../components/VezaLogo";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — VEZA Jewelry Studios" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasRecoveryIntent = useMemo(() => {
    if (typeof window === "undefined") return false;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const search = new URLSearchParams(window.location.search);
    return hash.get("type") === "recovery" || search.get("type") === "recovery";
  }, []);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (session && hasRecoveryIntent)) {
        setReady(true);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setReady(!!data.session && hasRecoveryIntent);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [hasRecoveryIntent]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw1.length < 10) return setErr("Please choose a password of at least ten characters.");
    if (pw1 !== pw2) return setErr("The two passwords do not match.");
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setOk(true);
      setTimeout(() => navigate({ to: "/account", replace: true }), 900);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something interrupted our craft.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <AuthLoader minHeight="70vh" showHomeLink />;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg items-center px-6 py-20">
      <FadeIn className="w-full">
        <div className="border border-border/60 bg-warm-white px-8 py-12 md:px-12 md:py-14">
          <div className="flex flex-col items-center text-center">
            <VezaLogo variant="mark" className="h-10 w-10 text-teal" />
            <p className="label-eyebrow mt-8">The Atelier</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
              Reset your password
            </h1>
            <span className="gold-rule mt-6" />
          </div>

          {ready ? (
            <form onSubmit={onSubmit} className="mt-10 space-y-6">
              <PasswordInput
                label="New password"
                value={pw1}
                onChange={setPw1}
                autoComplete="new-password"
                required
              />
              <PasswordInput
                label="Confirm new password"
                value={pw2}
                onChange={setPw2}
                autoComplete="new-password"
                required
              />
              {err ? <p className="text-xs font-light text-destructive">{err}</p> : null}
              {ok ? <p className="text-xs font-light text-teal">Password reset. Welcome.</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="btn-outline-charcoal w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving" : "Set new password"}
              </button>
            </form>
          ) : (
            <div className="mt-10 text-center">
              <p className="text-sm font-light leading-relaxed text-charcoal-soft">
                This reset link is missing or has expired. Please request a fresh link.
              </p>
              <Link to="/forgot-password" className="btn-outline-charcoal mt-8 inline-flex">
                Send a new link
              </Link>
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-6 text-center">
            <Link
              to="/"
              className="text-[0.62rem] font-light uppercase tracking-[0.22em] text-charcoal-soft/70 transition-colors duration-500 hover:text-teal"
            >
              ← Return home
            </Link>
            <span aria-hidden className="h-3 w-px bg-border" />
            <Link
              to="/account"
              className="text-[0.62rem] font-light uppercase tracking-[0.22em] text-charcoal-soft/50 transition-colors duration-500 hover:text-teal"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}