import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";
import { VezaLogo } from "../components/VezaLogo";

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
  const { user, isAdmin, signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && isAdmin) navigate({ to: "/admin", replace: true });
    else if (user && !isAdmin) navigate({ to: "/account", replace: true });
  }, [user, isAdmin, loading, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
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
          <label className="block">
            <span className="text-[0.68rem] font-light uppercase tracking-[0.24em] text-ivory/60">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-3 block w-full border-b border-ivory/30 bg-transparent py-2 text-sm font-light text-ivory outline-none transition-colors focus:border-gold"
            />
          </label>

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
      </div>
    </div>
  );
}
