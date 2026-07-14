import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart, formatPrice } from "../lib/cart";
import { LUXE_EASE } from "../lib/motion";
import { VezaLogo } from "./VezaLogo";
import { useEffect } from "react";

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="cart-root"
          className="fixed inset-0 z-[60]"
          initial={{ pointerEvents: "none" }}
          animate={{ pointerEvents: "auto" }}
          exit={{ pointerEvents: "none" }}
        >
          <motion.div
            className="absolute inset-0 bg-charcoal/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: LUXE_EASE }}
            onClick={closeCart}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: LUXE_EASE }}
            role="dialog"
            aria-label="Shopping bag"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-6 py-5">
              <p className="label-eyebrow">Shopping Bag</p>
              <button
                aria-label="Close cart"
                onClick={closeCart}
                className="text-charcoal transition-colors hover:text-teal"
              >
                <X strokeWidth={1} size={22} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <VezaLogo variant="mark" className="h-10 w-10 text-teal opacity-40" />
                  <p className="mt-6 font-serif text-2xl text-charcoal">Your bag is empty.</p>
                  <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-charcoal-soft">
                    Explore the archive and add pieces that speak to you.
                  </p>
                  <Link
                    to="/collections"
                    onClick={closeCart}
                    className="btn-outline-charcoal mt-10"
                  >
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <ul className="space-y-8">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-5">
                      <div
                        className="h-24 w-20 shrink-0 overflow-hidden"
                        style={{
                          background: item.image
                            ? undefined
                            : "linear-gradient(140deg, var(--color-sage-tint) 0%, var(--color-warm-white) 100%)",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center opacity-20">
                            <VezaLogo variant="mark" className="h-8 w-8 text-teal" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <Link
                          to="/product/$slug"
                          params={{ slug: item.slug }}
                          onClick={closeCart}
                          className="font-serif text-lg text-charcoal transition-colors hover:text-teal"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm font-light text-charcoal-soft">
                          {formatPrice(item.price, item.currency)}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 border border-border/70 px-2 py-1">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="text-charcoal-soft transition-colors hover:text-teal"
                            >
                              <Minus strokeWidth={1} size={14} />
                            </button>
                            <span className="min-w-[1.5rem] text-center text-sm font-light">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Increase quantity"
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
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 ? (
              <footer className="border-t border-border/60 px-6 py-6">
                <div className="flex items-baseline justify-between">
                  <p className="label-eyebrow">Subtotal</p>
                  <p className="font-serif text-2xl text-charcoal">
                    {formatPrice(subtotal, items[0]?.currency ?? "USD")}
                  </p>
                </div>
                <p className="mt-2 text-xs font-light text-charcoal-soft">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="btn-outline-charcoal w-full"
                  >
                    Checkout
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="text-center text-[0.72rem] font-light uppercase tracking-[0.24em] text-charcoal-soft transition-colors hover:text-teal"
                  >
                    View Bag
                  </Link>
                </div>
              </footer>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CartDrawer;
