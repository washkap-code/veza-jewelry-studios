import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";
import { VezaLogo } from "./VezaLogo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="label-eyebrow">Correspondence</p>
            <h3 className="mt-4 font-serif text-3xl leading-tight text-charcoal md:text-4xl">
              Receive our seasonal letter.
            </h3>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-charcoal-soft">
              Private previews, atelier notes, and stories from the workshop — delivered occasionally.
            </p>
            <form
              className="mt-8 flex max-w-md items-center border-b border-charcoal/40 pb-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                aria-label="Email address"
                className="w-full bg-transparent py-2 text-sm font-light tracking-wide text-charcoal outline-none placeholder:text-charcoal-soft/60"
              />
              <button
                type="submit"
                className="ml-4 shrink-0 text-[0.68rem] font-light uppercase tracking-[0.28em] text-charcoal transition-colors duration-500 hover:text-teal"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div>
            <VezaLogo variant="mark" className="h-10 w-10 text-teal" />
            <p className="label-eyebrow mt-6">Atelier</p>
            <address className="mt-4 space-y-2 text-sm font-light not-italic leading-relaxed text-charcoal-soft">
              <p>VEZA Jewelry Studios</p>
              <p>Harare, Zimbabwe</p>
              <p>
                <a href="mailto:hello@veza.studio" className="hover:text-teal transition-colors">
                  hello@veza.studio
                </a>
              </p>
            </address>
            <div className="mt-6 flex items-center gap-4 text-charcoal">
              <a href="#" aria-label="Instagram" className="transition-colors hover:text-teal">
                <Instagram strokeWidth={1} size={18} />
              </a>
              <a href="#" aria-label="Facebook" className="transition-colors hover:text-teal">
                <Facebook strokeWidth={1} size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="label-eyebrow">Client Care</p>
            <ul className="mt-4 space-y-3 text-sm font-light text-charcoal-soft">
              <li><Link to="/contact" className="transition-colors hover:text-teal">Shipping</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-teal">Returns</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-teal">Privacy</Link></li>
              <li><Link to="/custom" className="transition-colors hover:text-teal">Custom Commissions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-xs font-light tracking-wide text-charcoal-soft md:flex-row md:items-center">
          <p>© {year} VEZA Jewelry Studios. All rights reserved.</p>
          <p className="tracking-[0.22em] uppercase">Sculpted in Harare</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
