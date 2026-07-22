import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { VezaLogo } from "../components/VezaLogo";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordUpdatedBanner } from "../components/PasswordUpdatedBanner";
import { InstallAppInstructions } from "../components/InstallAppInstructions";
import { consumePasswordUpdated } from "../lib/password-updated-flag";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio Access — VEZA" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StudioLogin,
});

function StudioLogin() {
  const { user, isAdmin, mustChangePassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && isAdmin) navigate({ to: mustChangePassword ? "/change-password" : "/admin", replace: true });
  }, [user, isAdmin, mustChangePassword, loading, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin, must_change_password")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile?.is_admin) {
        await supabase.auth.signOut();
        throw new Error("Admin access only.");
      }

      navigate({ to: profile.must_change_password ? "/change-password" : "/admin", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Access denied.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-charcoal px-6 py-20 text-ivory">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <VezaLogo variant="mark" className="h-10 w-10 text-gold" />
          <p className="mt-8 text-[0.68rem] font-light uppercase tracking-[0.32em] text-ivory/60">
            The Atelier — Internal
          </p>
          <h1 className="mt-4 font-serif text-3xl text-ivory">Studio Access</h1>
          <span className="mt-6 block h-px w-10 bg-gold" />
        </div>

        <form onSubmit={onSubmit} className="mt-12 space-y-6">
          <label className="block">
            <span className="text-[0.68rem] font-light uppercase tracking-[0.24em] text-ivory/60">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="mt-3 block w-full border-b border-ivory/30 bg-transparent py-2 text-sm font-light text-ivory outline-none transition-colors focus:border-gold"
            />
          </label>
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            tone="dark"
          />

          {error ? (
            <p className="text-xs font-light leading-relaxed text-red-300">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-ivory/60 py-3 text-[0.68rem] font-light uppercase tracking-[0.28em] text-ivory transition-colors duration-500 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "One moment" : "Enter"}
          </button>
        </form>

        <div className="mt-10 flex items-center justify-center gap-6 text-center">
          <Link
            to="/"
            className="text-[0.62rem] font-light uppercase tracking-[0.28em] text-ivory/50 transition-colors duration-500 hover:text-gold"
          >
            ← Return home
          </Link>
          <span aria-hidden className="h-3 w-px bg-ivory/20" />
          <Link
            to="/forgot-password"
            className="text-[0.62rem] font-light uppercase tracking-[0.28em] text-ivory/50 transition-colors duration-500 hover:text-gold"
          >
            Forgot password?
          </Link>
        </div>

        <InstallAppInstructions tone="dark" />
      </div>
    </div>
  );
}
