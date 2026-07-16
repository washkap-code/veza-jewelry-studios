import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { VezaLogo } from "./VezaLogo";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";


const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Shop" },
  { to: "/custom", label: "Custom Jewellery" },
  { to: "/story", label: "Our Story" },
  { to: "/craftsmanship", label: "Craftsmanship" },
  { to: "/gemstones", label: "Gemstones" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { count, openCart } = useCart();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overDark = isHome && !scrolled;
  const showMark = overDark;

  const linkBase =
    "text-[0.72rem] font-light uppercase tracking-[0.24em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const linkTone = overDark
    ? "text-ivory/90 hover:text-gold focus-visible:ring-gold"
    : "text-charcoal/80 hover:text-teal focus-visible:ring-teal";
  const iconTone = overDark
    ? "text-ivory hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    : "text-charcoal hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const badgeBg = overDark ? "bg-gold text-charcoal" : "bg-teal text-ivory";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ease-out ${
        scrolled
          ? "border-b border-border/60 bg-ivory/95 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <Link
          to="/"
          className={`flex items-center gap-3 ${overDark ? "text-ivory" : "text-charcoal"}`}
          aria-label="VEZA — Home"
        >
          {overDark ? (
            <img
              src="/images/brand/veza-logo-gold-on-teal.jpg?v=3"
              alt="VEZA"
              className="h-12 w-auto transition-all duration-700 md:h-14"
            />
          ) : (
            <img
              src="/images/brand/veza-logo-teal-on-white.jpg?v=3"
              alt="VEZA"
              className={`w-auto transition-all duration-700 ${showMark ? "h-12 md:h-14" : "h-9 md:h-10"}`}
              style={{ mixBlendMode: "multiply" }}
            />
          )}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.slice(1).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`${linkBase} ${linkTone}`}
              activeProps={{ className: overDark ? "text-gold" : "text-teal" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={`flex items-center gap-5 ${overDark ? "text-ivory" : "text-charcoal"}`}>
          <button aria-label="Search" className={`transition-colors ${iconTone}`}>
            <Search strokeWidth={1} size={20} />
          </button>
          <Link
            to="/account"
            aria-label={user ? "Account (signed in)" : "Account"}
            className={`relative transition-colors ${iconTone}`}
          >
            <User strokeWidth={1} size={20} />
            {user ? (
              <span
                aria-hidden
                className={`absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ${overDark ? "bg-gold" : "bg-teal"}`}
              />
            ) : null}
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={count > 0 ? `Shopping bag (${count})` : "Shopping bag"}
            className={`relative transition-colors ${iconTone}`}
          >
            <ShoppingBag strokeWidth={1} size={20} />
            {count > 0 ? (
              <span
                aria-hidden
                className={`absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[0.6rem] font-light ${badgeBg}`}
              >
                {count}
              </span>
            ) : null}
          </button>

          <button
            aria-label="Menu"
            className={`lg:hidden ${iconTone}`}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X strokeWidth={1} size={22} /> : <Menu strokeWidth={1} size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-ivory lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-light uppercase tracking-[0.24em] text-charcoal/80"
                activeProps={{ className: "text-teal" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export default Navigation;
