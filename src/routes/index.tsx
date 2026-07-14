import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FadeIn } from "../components/FadeIn";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ivory px-6">
        {/* Subtle radial warmth, no gradient banding */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, var(--color-warm-white) 0%, var(--color-ivory) 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
            className="label-eyebrow"
          >
            Contemporary African Luxury — Est. Harare
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-10 font-serif text-[22vw] font-light leading-none tracking-[0.02em] text-charcoal md:text-[14rem]"
          >
            VEZA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            className="mx-auto mt-8 max-w-xl font-serif text-xl italic font-light text-charcoal-soft md:text-2xl"
          >
            Jewelry Sculpted by Nature. Crafted by VEZA.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-14"
          >
            <Link to="/collections" className="btn-outline-charcoal">
              Explore Collection
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-3 text-charcoal-soft">
            <span className="label-eyebrow">Scroll</span>
            <span className="block h-10 w-px bg-charcoal-soft/60" />
          </div>
        </motion.div>
      </section>

      <FadeIn as="section" className="border-t border-border/60 bg-warm-white">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-28 md:grid-cols-2 md:py-36">
          <div>
            <p className="label-eyebrow">The House</p>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
              An atelier where landscape becomes ornament.
            </h2>
          </div>
          <div className="flex items-center">
            <p className="text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
              From the granite hills of Zimbabwe to the quiet of our Harare studio,
              each VEZA piece is drawn from a place, a stone, a silence — then shaped
              slowly by hand. This is jewelry made to be lived in for a lifetime.
            </p>
          </div>
        </div>
      </FadeIn>
    </>
  );
}
