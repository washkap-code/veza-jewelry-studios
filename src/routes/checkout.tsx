import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FadeIn } from "../components/FadeIn";
import { VezaLogo } from "../components/VezaLogo";
import { useAuth } from "../lib/auth";
import { useCart, formatPrice } from "../lib/cart";
import { supabase } from "../lib/supabase";
import { paymentSettingsQuery } from "../lib/queries";
import { notifyAdmins } from "../lib/notifications";
import { LUXE_EASE } from "../lib/motion";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — VEZA Jewelry Studios" },
      { name: "description", content: "Complete your VEZA order — worldwide insured delivery from our Harare atelier." },
    ],
  }),
  component: CheckoutPage,
});

interface Address {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
}

const EMPTY_ADDRESS: Address = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  phone: "",
};

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { data: paymentSettings } = useQuery(paymentSettingsQuery);
  const cardPaymentsOn =
    !!paymentSettings?.payments_enabled &&
    !!paymentSettings?.stripe_publishable_key;

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [giftMessage, setGiftMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const shipping = 0; // Complimentary insured worldwide shipping
  const total = subtotal + shipping;

  function set<K extends keyof Address>(key: K, value: string) {
    setAddress((a) => ({ ...a, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (!address.fullName.trim() || !address.line1.trim() || !address.city.trim() || !address.country.trim()) {
      setError("Please complete your name, address, city and country.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          subtotal,
          shipping,
          total,
          currency: items[0]?.currency ?? "USD",
          shipping_address: address,
          gift_message: giftMessage.trim() || null,
        })
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          quantity: i.quantity,
          unit_price: i.price,
        })),
      );
      if (itemsErr) throw itemsErr;

      // Notify admins of the new order (best-effort)
      await notifyAdmins({
        kind: "order.new",
        title: `New order — ${formatPrice(total, items[0]?.currency ?? "USD")}`,
        message: `${address.fullName.trim()} · ${items.reduce((n, i) => n + i.quantity, 0)} item(s)`,
        link: "/admin/orders",
        meta: { order_id: order.id, total, currency: items[0]?.currency ?? "USD" },
      });

      // If card payments are enabled and a Stripe publishable key is set,
      // try to create a Stripe Checkout session. If the edge function reports
      // dormant/missing secret key, we gracefully fall back to the current
      // order-request confirmation state (order still exists in DB).
      if (cardPaymentsOn) {
        try {
          const currency = items[0]?.currency ?? "USD";
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const { data: session, error: fnErr } = await supabase.functions.invoke(
            "create-checkout-session",
            {
              body: {
                order_id: order.id,
                success_url: `${origin}/account?order=${order.id}`,
                cancel_url: `${origin}/checkout`,
                items: items.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  unit_amount: Math.round(Number(i.price) * 100),
                  currency,
                })),
              },
            },
          );
          if (!fnErr && session && typeof session === "object" && "url" in session && session.url) {
            window.location.href = session.url as string;
            return;
          }
          // Otherwise fall through to the order-request confirmation.
        } catch {
          /* fall through */
        }
      }

      setOrderRef(order.id.slice(0, 8).toUpperCase());
      clear();
    } catch {
      setError("Something interrupted our craft. Your order was not placed — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderRef) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: LUXE_EASE }}
          className="w-full border border-border/60 bg-warm-white px-8 py-14 text-center md:px-12"
        >
          <VezaLogo variant="mark" className="mx-auto h-10 w-10 text-teal" />
          <p className="label-eyebrow mt-8">Order {orderRef}</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            With gratitude.
          </h1>
          <p className="mt-6 text-sm font-light leading-relaxed text-charcoal-soft">
            Your order has been received by the atelier. We will be in touch shortly to
            arrange payment and confirm delivery details. Each piece is prepared and
            packaged by hand in Harare.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link to="/account" className="btn-outline-charcoal">View your orders</Link>
            <Link
              to="/collections"
              className="label-eyebrow text-charcoal-soft transition-colors duration-500 hover:text-teal"
            >
              Continue exploring
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <VezaLogo variant="mark" className="h-8 w-8 text-teal/60" />
        <h1 className="mt-8 font-serif text-4xl text-charcoal">Your bag is empty.</h1>
        <Link to="/collections" className="btn-outline-charcoal mt-10">Explore collections</Link>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <VezaLogo variant="mark" className="h-8 w-8 text-teal/60" />
        <p className="label-eyebrow mt-8">Almost there</p>
        <h1 className="mt-4 font-serif text-4xl text-charcoal">Sign in to complete your order.</h1>
        <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-charcoal-soft">
          An account lets you follow your order from our hands to yours.
        </p>
        <button onClick={() => navigate({ to: "/account" })} className="btn-outline-charcoal mt-10">
          Sign in or create account
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <FadeIn>
        <p className="label-eyebrow">Complete</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-charcoal md:text-6xl">Checkout</h1>
        <span className="gold-rule mt-8" />
      </FadeIn>

      <div className="mt-14 grid gap-16 lg:grid-cols-[1fr_380px]">
        <FadeIn delay={0.1}>
          <form onSubmit={onSubmit} className="space-y-10">
            <section>
              <h2 className="label-eyebrow">Delivery address</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <CheckoutField label="Full name" value={address.fullName} onChange={(v) => set("fullName", v)} autoComplete="name" required className="md:col-span-2" defaultHint={profile?.full_name ?? undefined} />
                <CheckoutField label="Address line 1" value={address.line1} onChange={(v) => set("line1", v)} autoComplete="address-line1" required className="md:col-span-2" />
                <CheckoutField label="Address line 2 (optional)" value={address.line2} onChange={(v) => set("line2", v)} autoComplete="address-line2" className="md:col-span-2" />
                <CheckoutField label="City" value={address.city} onChange={(v) => set("city", v)} autoComplete="address-level2" required />
                <CheckoutField label="Region / State" value={address.region} onChange={(v) => set("region", v)} autoComplete="address-level1" />
                <CheckoutField label="Postal code" value={address.postalCode} onChange={(v) => set("postalCode", v)} autoComplete="postal-code" />
                <CheckoutField label="Country" value={address.country} onChange={(v) => set("country", v)} autoComplete="country-name" required />
                <CheckoutField label="Phone" value={address.phone} onChange={(v) => set("phone", v)} autoComplete="tel" type="tel" className="md:col-span-2" />
              </div>
            </section>

            <section>
              <h2 className="label-eyebrow">Gift message (optional)</h2>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                rows={3}
                placeholder="A few words, written by hand on a VEZA card."
                className="mt-4 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 placeholder:text-charcoal-soft/50 focus:border-teal"
              />
            </section>

            <section className="border border-border/60 bg-warm-white p-6">
              <h2 className="label-eyebrow">Payment</h2>
              {cardPaymentsOn ? (
                <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-soft">
                  You will be taken to our secure card payment partner to complete
                  your order. Every VEZA piece ships worldwide, fully insured, in our
                  signature gift packaging.
                </p>
              ) : (
                <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-soft">
                  This is an order request. After you submit, our atelier will contact
                  you personally to arrange payment and confirm your delivery date. Every
                  VEZA piece ships worldwide, fully insured, in our signature gift packaging.
                </p>
              )}
            </section>

            {error ? <p className="text-xs font-light leading-relaxed text-destructive">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn-outline-charcoal w-full disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {submitting
                ? cardPaymentsOn ? "Redirecting to payment" : "Placing your order"
                : cardPaymentsOn ? "Continue to payment" : "Place order"}
            </button>
          </form>
        </FadeIn>

        <FadeIn delay={0.2}>
          <aside className="border border-border/60 bg-warm-white p-8">
            <h2 className="label-eyebrow">Your selection</h2>
            <ul className="mt-6 divide-y divide-border/60">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-14 shrink-0 overflow-hidden bg-muted">
                    {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base text-charcoal">{i.name}</p>
                    <p className="mt-1 text-xs font-light text-charcoal-soft">Qty {i.quantity}</p>
                  </div>
                  <p className="text-sm font-light text-charcoal">{formatPrice(i.price * i.quantity, i.currency)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-border/60 pt-6 text-sm font-light">
              <div className="flex justify-between text-charcoal-soft">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal, items[0]?.currency)}</dd>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <dt>Shipping</dt>
                <dd>Complimentary</dd>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-3 text-base text-charcoal">
                <dt>Total</dt>
                <dd>{formatPrice(total, items[0]?.currency)}</dd>
              </div>
            </dl>
          </aside>
        </FadeIn>
      </div>
    </div>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
  autoComplete,
  required,
  type = "text",
  className = "",
  defaultHint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  type?: string;
  className?: string;
  defaultHint?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        placeholder={defaultHint}
        className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 placeholder:text-charcoal-soft/50 focus:border-teal"
      />
    </label>
  );
}
