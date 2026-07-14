import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { VezaLogo, ChevronGlyph } from "../components/VezaLogo";
import { FadeIn } from "../components/FadeIn";
import { fadeUp, staggerContainer, LUXE_EASE, viewportOnce } from "../lib/motion";

export const Route = createFileRoute("/")({
  component: Home,
});

const COLLECTIONS = [
  { slug: "mufambi", title: "MUFAMBI", subtitle: "The Traveller" },
  { slug: "earth", title: "Earth Collection", subtitle: "Rooted in landscape" },
  { slug: "heritage", title: "Heritage Collection", subtitle: "Stories in metal" },
];

const GEMSTONES = [
  { slug: "aquamarine", name: "Aquamarine", tone: "#D6E4E1" },
  { slug: "tiger-eye", name: "Tiger Eye", tone: "#C9A46B" },
  { slug: "amethyst", name: "Amethyst", tone: "#B7A6C4" },
  { slug: "mtorolite", name: "Mtorolite", tone: "#8BB7A6" },
];

const JOURNAL = [
  { slug: "sculpted-by-nature", title: "Sculpted by Nature", eyebrow: "Field Notes" },
  { slug: "hands-that-make", title: "The Hands That Make", eyebrow: "Craft" },
];

function Home() {
  const reduce = useReducedMotion();
  return (
    <>
      <Hero reduce={!!reduce} />
      <BrandStatement />
      <FeaturedCollections />
      <SignatureGemstones reduce={!!reduce} />
      <CraftsmanshipBand reduce={!!reduce} />
      <CommissionCTA />
      <JournalPreview />
    </>
  );
}

function Hero({ reduce }: { reduce: boolean }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ivory px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, var(--color-warm-white) 0%, var(--color-ivory) 60%)",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: LUXE_EASE }}
          className="label-eyebrow"
        >
          Contemporary African Luxury — Est. Harare
        </motion.p>

        <div className="mt-10">
          <VezaLogo
            variant="mark"
            animate
            className="mx-auto h-40 w-40 text-teal md:h-56 md:w-56"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: reduce ? 0.1 : 2.2, ease: LUXE_EASE }}
          className="mt-10"
        >
          <VezaLogo
            variant="wordmark"
            className="mx-auto h-10 w-auto text-charcoal md:h-14"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: reduce ? 0.2 : 2.5, ease: LUXE_EASE }}
          className="mx-auto mt-8 max-w-xl font-serif text-xl italic font-light text-charcoal-soft md:text-2xl"
        >
          Jewelry Sculpted by Nature. Crafted by VEZA.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: reduce ? 0.3 : 2.9 }}
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
        transition={{ duration: 1.2, delay: reduce ? 0.4 : 3.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3 text-charcoal-soft">
          <span className="label-eyebrow">Scroll</span>
          <ChevronGlyph direction="down" className="h-4 w-4 text-teal" strokeWidth={6} />
        </div>
      </motion.div>
    </section>
  );
}

function BrandStatement() {
  const lines = [
    "From the granite hills of Zimbabwe to the quiet of our Harare studio,",
    "each VEZA piece is drawn from a place, a stone, a silence —",
    "then shaped slowly by hand.",
    "This is jewelry made to be lived in for a lifetime.",
  ];
  return (
    <section className="border-t border-border/60" style={{ backgroundColor: "var(--color-sage-tint)" }}>
      <div className="mx-auto max-w-4xl px-6 py-28 text-center md:py-36">
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.2, ease: LUXE_EASE }}
          className="mx-auto block h-px w-16 origin-left bg-gold"
        />
        <p className="label-eyebrow mt-8">The House</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-8 space-y-3 font-serif text-2xl leading-relaxed text-charcoal md:text-3xl"
        >
          {lines.map((l, i) => (
            <motion.p key={i} variants={fadeUp}>
              {l}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedCollections() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36">
        <FadeIn className="mb-16 flex flex-col items-center text-center">
          <p className="label-eyebrow">Collections</p>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            Pieces drawn from place.
          </h2>
        </FadeIn>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-10 md:grid-cols-3"
        >
          {COLLECTIONS.map((c) => (
            <motion.div key={c.slug} variants={fadeUp}>
              <CollectionCard {...c} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CollectionCard({ slug, title, subtitle }: { slug: string; title: string; subtitle: string }) {
  return (
    <Link to="/collections/$slug" params={{ slug }} className="group block">
      <div className="relative overflow-hidden bg-warm-white" style={{ aspectRatio: "3 / 4" }}>
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 1.2, ease: LUXE_EASE }}
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(140deg, var(--color-sage-tint) 0%, var(--color-warm-white) 60%, var(--color-ivory) 100%)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <VezaLogo variant="mark" className="h-40 w-40 text-teal" />
          </div>
        </motion.div>
      </div>
      <div className="mt-6">
        <p className="label-eyebrow" style={{ color: "var(--color-teal)" }}>{subtitle}</p>
        <h3 className="mt-3 font-serif text-2xl text-charcoal md:text-3xl">{title}</h3>
        <span className="mt-3 block h-px w-0 bg-teal transition-[width] duration-700 ease-out group-hover:w-16" />
      </div>
    </Link>
  );
}

function SignatureGemstones({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 20, reduce ? 0 : -20]);
  const y2 = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -20, reduce ? 0 : 20]);

  return (
    <section ref={ref} className="border-t border-border/60 bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36">
        <FadeIn className="mb-14 flex flex-col items-center text-center">
          <p className="label-eyebrow">Signature Gemstones</p>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            Stones with a place of origin.
          </h2>
        </FadeIn>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
        >
          {GEMSTONES.map((g, i) => (
            <motion.div key={g.slug} variants={fadeUp} style={{ y: i % 2 === 0 ? y1 : y2 }}>
              <Link to="/gemstones/$slug" params={{ slug: g.slug }} className="group block">
                <div
                  className="aspect-square w-full"
                  style={{
                    background: `radial-gradient(circle at 40% 40%, ${g.tone} 0%, var(--color-warm-white) 80%)`,
                  }}
                />
                <p className="mt-5 text-center font-serif text-lg text-charcoal md:text-xl">
                  {g.name}
                </p>
                <span className="mx-auto mt-2 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-10" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CraftsmanshipBand({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 40, reduce ? 0 : -40]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--color-sage)" }}
    >
      <motion.div
        aria-hidden
        style={{ y }}
        className="pointer-events-none absolute -right-24 -top-24 opacity-[0.09]"
      >
        <ChevronGlyph direction="up" className="h-[36rem] w-[36rem] text-ivory" strokeWidth={2} double />
      </motion.div>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-28 md:grid-cols-2 md:px-10 md:py-36">
        <FadeIn>
          <p className="label-eyebrow" style={{ color: "rgba(247,245,240,0.7)" }}>
            Craftsmanship
          </p>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-ivory md:text-6xl">
            Every piece, shaped by hand in Harare.
          </h2>
          <span className="mt-8 block h-px w-16 bg-gold" />
        </FadeIn>
        <FadeIn delay={0.1} className="flex items-end">
          <p className="text-base font-light leading-relaxed text-ivory/85 md:text-lg">
            Wax, metal, stone. Our jewellers work in a slow, deliberate rhythm —
            drawing on techniques passed through generations of Zimbabwean makers,
            and refining them for a contemporary hand.
          </p>
        </FadeIn>
      </div>

      <div className="relative border-t border-ivory/20">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-10 md:px-10">
          <Link to="/craftsmanship" className="btn-outline-ivory">
            Inside the Atelier
          </Link>
        </div>
      </div>
    </section>
  );
}

function CommissionCTA() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-28 text-center md:py-36">
        <span className="gold-rule" />
        <p className="label-eyebrow mt-8">Custom Commissions</p>
        <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
          A piece drawn for you alone.
        </h2>
        <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
          For milestones, heirlooms, and quiet occasions — we design in
          conversation with you, from first sketch to final polish.
        </p>
        <div className="mt-10">
          <Link to="/custom" className="btn-outline-charcoal">
            Begin Your Commission
          </Link>
        </div>
      </div>
    </section>
  );
}

function JournalPreview() {
  return (
    <section className="border-t border-border/60 bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36">
        <FadeIn className="mb-16 flex items-end justify-between">
          <div>
            <p className="label-eyebrow">Journal</p>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
              Notes from the atelier.
            </h2>
          </div>
          <Link
            to="/journal"
            className="hidden text-[0.72rem] font-light uppercase tracking-[0.24em] text-charcoal transition-colors hover:text-teal md:inline-block"
          >
            All Entries
          </Link>
        </FadeIn>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-10 md:grid-cols-2"
        >
          {JOURNAL.map((j) => (
            <motion.article key={j.slug} variants={fadeUp}>
              <Link to="/journal/$slug" params={{ slug: j.slug }} className="group block">
                <div
                  className="w-full overflow-hidden"
                  style={{ aspectRatio: "4 / 3" }}
                >
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 1.2, ease: LUXE_EASE }}
                    className="h-full w-full"
                    style={{
                      background:
                        "linear-gradient(160deg, var(--color-sage-tint) 0%, var(--color-warm-white) 100%)",
                    }}
                  />
                </div>
                <p className="label-eyebrow mt-6" style={{ color: "var(--color-teal)" }}>
                  {j.eyebrow}
                </p>
                <h3 className="mt-3 font-serif text-2xl text-charcoal md:text-3xl">{j.title}</h3>
                <span className="mt-3 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-16" />
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
