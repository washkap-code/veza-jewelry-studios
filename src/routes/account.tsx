import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { FadeIn } from "../components/FadeIn";
import { AuthLoader } from "../components/AuthLoader";
import { PasswordInput } from "../components/PasswordInput";
import { VezaLogo } from "../components/VezaLogo";
import { InstallAppInstructions } from "../components/InstallAppInstructions";
import { useAuth } from "../lib/auth";
import { supabase, type Order, type Product, type Profile } from "../lib/supabase";
import { LUXE_EASE } from "../lib/motion";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-ivory">
        <AuthLoader minHeight="80vh" showHomeLink />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-ivory">
      <AnimatePresence mode="wait" initial={false}>
        {user ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXE_EASE }}
          >
            <Dashboard />
          </motion.div>
        ) : (
          <motion.div
            key="auth-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXE_EASE }}
          >
            <AuthCard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Auth card                                 */
/* -------------------------------------------------------------------------- */

type Mode = "signin" | "signup";

function AuthCard() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignIn = mode === "signin";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Please choose a password of at least eight characters.");
      return;
    }
    if (!isSignIn && fullName.trim().length < 2) {
      setError("Please share the name we should engrave on your account.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignIn) {
        await signIn(trimmedEmail, password);
      } else {
        await signUp(trimmedEmail, password, fullName.trim());
        setNotice(
          "Your account is being prepared. Please check your inbox to confirm your email.",
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something interrupted our craft.";
      setError(polishAuthError(message));
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
            <p className="label-eyebrow mt-8">
              {isSignIn ? "The Atelier" : "New to VEZA"}
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <span className="gold-rule mt-6" />
          </div>

          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            {!isSignIn ? (
              <Field
                label="Full name"
                type="text"
                value={fullName}
                onChange={setFullName}
                autoComplete="name"
                required
              />
            ) : null}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              required
            />

            {error ? (
              <p className="text-xs font-light leading-relaxed text-destructive">{error}</p>
            ) : null}
            {notice ? (
              <p className="text-xs font-light leading-relaxed text-teal">{notice}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn-outline-charcoal w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "One moment"
                : isSignIn
                  ? "Enter the atelier"
                  : "Begin your account"}
            </button>

            {isSignIn ? (
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-[0.62rem] font-light uppercase tracking-[0.22em] text-charcoal-soft/70 transition-colors duration-500 hover:text-teal"
                >
                  Forgot password?
                </Link>
              </div>
            ) : null}
          </form>

          <div className="mt-10 text-center">
            <button
              type="button"
              className="label-eyebrow text-charcoal transition-colors duration-500 hover:text-teal"
              onClick={() => {
                setMode(isSignIn ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
            >
              {isSignIn ? "Create an account" : "I already have an account"}
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-center">
            <Link
              to="/"
              className="text-[0.62rem] font-light uppercase tracking-[0.22em] text-charcoal-soft/70 transition-colors duration-500 hover:text-teal"
            >
              ← Return home
            </Link>
            <span aria-hidden className="h-3 w-px bg-border" />
            <Link
              to="/studio"
              className="text-[0.62rem] font-light uppercase tracking-[0.22em] text-charcoal-soft/50 transition-colors duration-500 hover:text-teal"
            >
              Studio access
            </Link>
          </div>
          <InstallAppInstructions />
        </div>
      </FadeIn>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal"
      />
    </label>
  );
}

function polishAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Those credentials do not match our records.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account already exists for that email. Please sign in.";
  if (m.includes("email not confirmed")) return "Please confirm your email to continue.";
  if (m.includes("password")) return "Please choose a stronger password.";
  return msg;
}

/* -------------------------------------------------------------------------- */
/*                                 Dashboard                                  */
/* -------------------------------------------------------------------------- */

function Dashboard() {
  const { user, profile } = useAuth();
  const greeting = useMemo(() => {
    const name = profile?.full_name?.split(" ")[0];
    return name ? `Welcome, ${name}.` : "Welcome.";
  }, [profile?.full_name]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <FadeIn>
        <p className="label-eyebrow">Your Atelier</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-charcoal md:text-6xl">
          {greeting}
        </h1>
        <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-charcoal-soft">
          {user?.email}
        </p>
        <span className="gold-rule mt-8" />
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12">
        <Tabs.Root defaultValue="orders">
          <Tabs.List
            className="flex flex-wrap gap-8 border-b border-border/60"
            aria-label="Account sections"
          >
            {[
              { v: "orders", l: "Orders" },
              { v: "wishlist", l: "Wishlist" },
              { v: "profile", l: "Profile" },
            ].map((t) => (
              <Tabs.Trigger
                key={t.v}
                value={t.v}
                className="label-eyebrow -mb-px border-b border-transparent pb-4 text-charcoal/60 outline-none transition-colors duration-500 hover:text-charcoal data-[state=active]:border-teal data-[state=active]:text-charcoal"
              >
                {t.l}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="orders" className="pt-12 outline-none">
            <OrdersPanel />
          </Tabs.Content>
          <Tabs.Content value="wishlist" className="pt-12 outline-none">
            <WishlistPanel />
          </Tabs.Content>
          <Tabs.Content value="profile" className="pt-12 outline-none">
            <ProfilePanel />
          </Tabs.Content>
        </Tabs.Root>

        <a
          href="/guides/veza-client-guide.pdf"
          download
          className="mt-16 flex flex-wrap items-center justify-between gap-4 border border-gold/40 bg-warm-white p-6 transition-colors duration-500 hover:border-teal/50"
        >
          <div>
            <p className="label-eyebrow text-gold">A quiet guide</p>
            <p className="mt-2 font-serif text-2xl text-charcoal">VEZA — Client Guide</p>
            <p className="mt-1 text-xs font-light text-charcoal-soft">
              Account, browsing, ordering, couriers, tracking, and requesting a bespoke commission.
            </p>
          </div>
          <span className="text-[0.7rem] font-light uppercase tracking-[0.22em] text-teal">Download PDF ↓</span>
        </a>
      </FadeIn>
    </div>
  );
}

/* --------------------------------- Orders --------------------------------- */

function OrdersPanel() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("orders")
      .select("id, user_id, status, subtotal, shipping, total, currency, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setOrders((data as Order[] | null) ?? []);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (orders === null) return <AuthLoader minHeight="30vh" />;
  if (orders.length === 0) return <EmptyState title="Your collection awaits." />;

  return (
    <ul className="divide-y divide-border/60">
      {orders.map((o) => (
        <li
          key={o.id}
          className="flex flex-wrap items-baseline justify-between gap-4 py-6"
        >
          <div>
            <p className="label-eyebrow">Order · {o.id.slice(0, 8)}</p>
            <p className="mt-2 font-serif text-2xl text-charcoal">
              {formatMoney(o.total, o.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-light uppercase tracking-[0.24em] text-teal">
              {o.status}
            </p>
            <p className="mt-2 text-xs font-light text-charcoal-soft">
              {new Date(o.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------- Wishlist -------------------------------- */

type WishlistRow = { id: string; product: Product | null };

function WishlistPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("wishlists")
      .select(
        "id, product:products(id, collection_id, name, slug, description, price, currency, images, published)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        const rows = (data as unknown as WishlistRow[] | null) ?? [];
        setItems(rows);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (items === null) return <AuthLoader minHeight="30vh" />;
  if (items.length === 0)
    return (
      <EmptyState
        title="Nothing saved yet."
        action={
          <Link to="/collections" className="btn-outline-charcoal mt-8">
            Browse collections
          </Link>
        }
      />
    );

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
      {items.map((w) => {
        const p = w.product;
        if (!p) return null;
        const img = p.images?.[0]?.url;
        return (
          <Link
            key={w.id}
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="group block"
          >
            <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
              {img ? (
                <img
                  src={img}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                />
              ) : null}
            </div>
            <p className="mt-4 font-serif text-lg text-charcoal">{p.name}</p>
            <p className="mt-1 text-xs font-light text-charcoal-soft">
              {formatMoney(p.price, p.currency)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

/* --------------------------------- Profile -------------------------------- */

function ProfilePanel() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile?.full_name, profile?.phone]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setError("We couldn't save your details just now. Please try again.");
      return;
    }
    setSaved(true);
    await refreshProfile();
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <form onSubmit={onSave} className="max-w-xl space-y-8">
      <div>
        <span className="label-eyebrow">Email</span>
        <p className="mt-3 border-b border-border py-3 text-sm font-light text-charcoal-soft">
          {user?.email}
        </p>
      </div>
      <Field label="Full name" type="text" value={fullName} onChange={setFullName} />
      <Field label="Phone" type="tel" value={phone} onChange={setPhone} />

      {error ? <p className="text-xs font-light text-destructive">{error}</p> : null}
      {saved ? <p className="text-xs font-light text-teal">Saved.</p> : null}

      <div className="flex flex-wrap items-center gap-6 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="btn-outline-charcoal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => signOut()}
          className="label-eyebrow text-charcoal-soft transition-colors duration-500 hover:text-teal"
        >
          Sign out
        </button>
      </div>
    </form>
  );
}

/* --------------------------------- Shared --------------------------------- */

function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <VezaLogo variant="mark" className="h-8 w-8 text-teal/60" />
      <p className="mt-8 font-serif text-3xl text-charcoal">{title}</p>
      {action}
    </div>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

// Keep types referenced to avoid unused-import lint noise
export type { Profile };
