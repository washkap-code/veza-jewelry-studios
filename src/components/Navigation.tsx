import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { VezaLogo } from "./VezaLogo";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";


const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/story", label: "Story" },
  { to: "/craftsmanship", label: "Craftsmanship" },
  { to: "/gemstones", label: "Gemstones" },
  { to: "/journal", label: "Journal" },
  { to: "/custom", label: "Custom Pieces" },
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

  const showMark = isHome && !scrolled;

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
          className="flex items-center gap-3 text-charcoal"
          aria-label="VEZA — Home"
        >
          {showMark ? (
            <VezaLogo variant="mark" className="h-7 w-7 text-teal transition-opacity duration-700" />
          ) : null}
          <VezaLogo variant="wordmark" className="h-5 w-auto md:h-6" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.slice(1).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[0.72rem] font-light uppercase tracking-[0.24em] text-charcoal/80 transition-colors duration-500 hover:text-teal"
              activeProps={{ className: "text-teal" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-charcoal">
          <button aria-label="Search" className="transition-colors hover:text-teal">
            <Search strokeWidth={1} size={20} />
          </button>
          <Link
            to="/account"
            aria-label={user ? "Account (signed in)" : "Account"}
            className="relative transition-colors hover:text-teal"
          >
            <User strokeWidth={1} size={20} />
            {user ? (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-teal"
              />
            ) : null}
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={count > 0 ? `Shopping bag (${count})` : "Shopping bag"}
            className="relative transition-colors hover:text-teal"
          >
            <ShoppingBag strokeWidth={1} size={20} />
            {count > 0 ? (
              <span
                aria-hidden
                className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-teal px-1 text-[0.6rem] font-light text-ivory"
              >
                {count}
              </span>
            ) : null}
          </button>

          <button
            aria-label="Menu"
            className="lg:hidden"
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
