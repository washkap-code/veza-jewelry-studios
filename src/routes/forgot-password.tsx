import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { FadeIn } from "../components/FadeIn";
import { VezaLogo } from "../components/VezaLogo";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — VEZA Jewelry Studios" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;
      const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something interrupted our craft.");
    } finally {
      setSubmitting(false);
    }
  }

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
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-charcoal-soft">
              Enter the email tied to your account. We'll send a secure link to set a new password.
            </p>
          </div>

          {sent ? (
            <p className="mt-10 text-center text-sm font-light leading-relaxed text-teal">
              If an account exists for that email, a reset link is on its way.
              Please check your inbox (and spam folder).
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-10 space-y-6">
              <label className="block">
                <span className="label-eyebrow">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal"
                />
              </label>
              {error ? (
                <p className="text-xs font-light text-destructive">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="btn-outline-charcoal w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending" : "Send reset link"}
              </button>
            </form>
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
