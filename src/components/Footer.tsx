import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";
import { VezaLogo } from "./VezaLogo";
import { CinematicVideo } from "./CinematicVideo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-warm-white">
      <div className="relative overflow-hidden border-b border-border/60 bg-charcoal">
        <CinematicVideo
          src="/videos/closing.mp4"
          className="absolute inset-0"
          overlayClassName="bg-charcoal/40"
          ariaLabel="Abstract teal and gold light"
        />
        <div className="relative flex items-center justify-center px-6 py-20 md:py-28">
          <img
            src="/images/brand/veza-logo-gold-on-teal.jpg?v=3"
            alt="VEZA"
            className="h-24 w-auto md:h-32"
            style={{ mixBlendMode: "screen", filter: "brightness(1.15)" }}
          />
        </div>
      </div>

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
                <a href="mailto:hello@veza-studios.com" className="hover:text-teal transition-colors">
                  hello@veza-studios.com
                </a>
              </p>
              <p>
                <a href="tel:+263777602761" className="hover:text-teal transition-colors">
                  +263 777 602 761
                </a>
              </p>
            </address>
            <div className="mt-6 flex items-center gap-4 text-charcoal">
              <a
                href="https://www.instagram.com/veza_studios"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-colors hover:text-teal"
              >
                <Instagram strokeWidth={1} size={18} />
              </a>
              <a
                href="https://www.facebook.com/people/VEZA-Studios/100087093636802/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition-colors hover:text-teal"
              >
                <Facebook strokeWidth={1} size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="label-eyebrow">Client Care</p>
            <ul className="mt-4 space-y-3 text-sm font-light text-charcoal-soft">
              <li><Link to="/custom" className="transition-colors hover:text-teal">Custom Commissions</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-teal">Shipping & Returns</Link></li>
              <li><Link to="/privacy" className="transition-colors hover:text-teal">Privacy Policy</Link></li>
              <li><Link to="/terms" className="transition-colors hover:text-teal">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-xs font-light tracking-wide text-charcoal-soft md:flex-row md:items-center">
          <p>© {year} VEZA Jewelry Studios. All rights reserved.</p>
          <p className="hidden tracking-[0.22em] uppercase md:block">Sculpted in Harare</p>
          <div className="flex items-center gap-6">
            <Link
              to="/studio"
              className="text-[0.65rem] font-light uppercase tracking-[0.22em] text-charcoal-soft/60 transition-colors duration-500 hover:text-teal"
            >
              Studio access
            </Link>
            <a
              href="https://jonomi.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="font-light tracking-wide text-charcoal-soft transition-colors duration-500 hover:text-teal"
            >
              Built by Jonomi Digital Studios
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
