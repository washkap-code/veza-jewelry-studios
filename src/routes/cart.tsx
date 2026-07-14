import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "../components/FadeIn";
import { useCart, formatPrice } from "../lib/cart";
import { VezaLogo } from "../components/VezaLogo";
import { LUXE_EASE } from "../lib/motion";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Shopping Bag — VEZA Jewelry Studios" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const currency = items[0]?.currency ?? "USD";

  return (
    <>
      <section className="border-b border-border/60 bg-warm-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
          <FadeIn>
            <p className="label-eyebrow mb-6">Selection</p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-charcoal md:text-6xl">
              Shopping Bag
            </h1>
          </FadeIn>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          {items.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <VezaLogo variant="mark" className="h-12 w-12 text-teal opacity-40" />
              <h2 className="mt-8 font-serif text-3xl text-charcoal">Your bag is empty.</h2>
              <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-charcoal-soft">
                Begin your archive with a piece that will last a lifetime.
              </p>
              <Link to="/collections" className="btn-outline-charcoal mt-10">
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
              <ul className="divide-y divide-border/60 border-y border-border/60">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-6 py-8">
                    <div className="h-32 w-24 shrink-0 overflow-hidden bg-warm-white">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 1.2, ease: LUXE_EASE }}
                          className="flex h-full w-full items-center justify-center opacity-20"
                          style={{
                            background:
                              "linear-gradient(140deg, var(--color-sage-tint) 0%, var(--color-warm-white) 100%)",
                          }}
                        >
                          <VezaLogo variant="mark" className="h-10 w-10 text-teal" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <Link
                        to="/product/$slug"
                        params={{ slug: item.slug }}
                        className="font-serif text-2xl text-charcoal transition-colors hover:text-teal"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-2 text-sm font-light text-charcoal-soft">
                        {formatPrice(item.price, item.currency)}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-6">
                        <div className="flex items-center gap-3 border border-border/70 px-2 py-1">
                          <button
                            aria-label="Decrease"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-charcoal-soft transition-colors hover:text-teal"
                          >
                            <Minus strokeWidth={1} size={14} />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-charcoal-soft transition-colors hover:text-teal"
                          >
                            <Plus strokeWidth={1} size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[0.7rem] font-light uppercase tracking-[0.22em] text-charcoal-soft transition-colors hover:text-teal"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="hidden text-right font-serif text-lg text-charcoal sm:block">
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="h-fit border border-border/60 bg-warm-white p-8">
                <p className="label-eyebrow">Order Summary</p>
                <div className="mt-8 flex items-baseline justify-between border-b border-border/60 pb-4">
                  <span className="text-sm font-light text-charcoal-soft">Subtotal</span>
                  <span className="font-serif text-xl text-charcoal">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-sm font-light text-charcoal-soft">Shipping</span>
                  <span className="text-sm font-light text-charcoal-soft">
                    Calculated at checkout
                  </span>
                </div>
                <div className="mt-10">
                  <Link to="/checkout" className="btn-outline-charcoal w-full">
                    Checkout
                  </Link>
                </div>
                <p className="mt-6 text-xs font-light leading-relaxed text-charcoal-soft">
                  Every piece is packaged in VEZA's signature gift box and shipped
                  worldwide, fully insured.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
