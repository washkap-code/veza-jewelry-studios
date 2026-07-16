import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronGlyph } from "../components/VezaLogo";
import { FadeIn } from "../components/FadeIn";
import { CinematicVideo } from "../components/CinematicVideo";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { fadeUp, staggerContainer, LUXE_EASE, viewportOnce } from "../lib/motion";
import { featuredProductsQuery, collectionsQuery, gemstonesQuery, toneForGemstone } from "../lib/queries";
import { formatPrice } from "../lib/cart";
import type { Product, Gemstone, Collection } from "../lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VEZA — Handcrafted Zimbabwean Jewellery" },
      {
        name: "description",
        content:
          "Handcrafted custom jewellery in semi-precious stones, made in Zimbabwe. Discover VEZA collections, bespoke commissions, and the atelier behind each piece.",
      },
      { property: "og:title", content: "VEZA — Handcrafted Zimbabwean Jewellery" },
      {
        property: "og:description",
        content:
          "Jewellery with a story beneath the surface. Semi-precious stones, hand-finished in Harare.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  { n: "01", label: "Share your idea", body: "Tell us the moment, the material, the feeling." },
  { n: "02", label: "Choose your stones", body: "Together we select the stone and its setting." },
  { n: "03", label: "VEZA creates your piece", body: "Hand-drawn, hand-set, made only for you." },
];

function Home() {
  const reduce = useReducedMotion();
  return (
    <>
      <Hero reduce={!!reduce} />
      <Manifesto reduce={!!reduce} />
      <FeaturedCollection />
      <Craftsmanship />
      <Bespoke />
      <StoneStrip />
      <SocialStrip />
    </>
  );
}

/* ---------------------------------------------------------------- Hero */

function Hero({ reduce }: { reduce: boolean }) {
  // Resilience: on reduced-motion (and as an inline-style safety net) render text
  // fully opaque so a stalled JS/framer-motion pipeline can never leave it invisible.
  const staticVisible = { opacity: 1, y: 0 };
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-charcoal">
      <CinematicVideo
        src="/videos/hero.mp4"
        eager
        className="absolute inset-0"
        fallbackStyle={{
          background:
            "radial-gradient(120% 90% at 30% 20%, #1f4a3f 0%, #163a33 40%, #0f1f1c 75%, #0a0a09 100%)",
        }}
        overlayClassName="bg-gradient-to-b from-charcoal/40 via-charcoal/20 to-charcoal/70"
        ariaLabel="Macro film of gemstones and gold in the VEZA studio"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start px-6 pb-32 pt-40 text-ivory md:px-10 md:pb-40 md:pt-48">
        <motion.p
          initial={reduce ? staticVisible : { opacity: 0, y: 12 }}
          animate={staticVisible}
          transition={{ duration: 0.9, ease: LUXE_EASE, delay: reduce ? 0 : 0.2 }}
          className="label-eyebrow"
          style={{ color: "rgba(247,245,240,0.75)" }}
        >
          VEZA — Harare, Zimbabwe
        </motion.p>

        <motion.h1
          initial={reduce ? staticVisible : { opacity: 0, y: 24 }}
          animate={staticVisible}
          transition={{ duration: 1.2, ease: LUXE_EASE, delay: reduce ? 0 : 0.35 }}
          className="mt-8 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-ivory md:text-7xl"
        >
          Jewellery with a story
          <br />
          beneath the surface.
        </motion.h1>

        <motion.p
          initial={reduce ? staticVisible : { opacity: 0, y: 16 }}
          animate={staticVisible}
          transition={{ duration: 1.0, ease: LUXE_EASE, delay: reduce ? 0 : 0.75 }}
          className="mt-8 max-w-xl text-base font-light leading-relaxed text-ivory/85 md:text-lg"
        >
          Handcrafted custom jewellery in semi-precious stones, made in Zimbabwe.
        </motion.p>

        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: reduce ? 0 : 1.1 }}
          className="mt-12 flex flex-wrap items-center gap-5"
        >
          <Link to="/collections" className="btn-outline-ivory">
            Explore the collection
          </Link>
          <Link
            to="/custom"
            className="text-[0.72rem] font-light uppercase tracking-[0.28em] text-ivory/90 underline-offset-8 transition-colors duration-500 hover:text-gold hover:underline"
          >
            Create your piece
          </Link>
        </motion.div>
      </div>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: reduce ? 0 : 1.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3 text-ivory/70">
          <span className="label-eyebrow" style={{ color: "rgba(247,245,240,0.7)" }}>
            Scroll
          </span>
          <ChevronGlyph direction="down" className="h-4 w-4 text-gold" strokeWidth={6} />
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------- Manifesto */

function Manifesto({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 40, reduce ? 0 : -40]);

  return (
    <section
      ref={ref}
      className="border-t border-border/60"
      style={{ backgroundColor: "var(--color-warm-white)" }}
    >
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-[1.05fr_0.95fr] md:gap-24 md:px-10 md:py-40">
        <FadeIn className="flex flex-col justify-center">
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 1.2, ease: LUXE_EASE }}
            className="block h-px w-16 origin-left bg-gold"
          />
          <p className="label-eyebrow mt-8">The House</p>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] text-charcoal md:text-6xl">
            Made to be treasured.
          </h2>
          <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
            VEZA works only in natural stones — aquamarine drawn from the Zambezi
            escarpment, mtorolite from the Great Dyke, quartz and tiger eye from
            the granite hills. Every piece is drawn slowly, set by hand, and
            shaped around the person who will wear it.
          </p>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
            Nothing is mass produced. Nothing is rushed.
          </p>
        </FadeIn>

        <motion.div style={{ y }} className="relative">
          <CinematicVideo
            src="/videos/stones.mp4"
            className="aspect-[4/5] w-full shadow-[0_40px_80px_-40px_rgba(43,43,40,0.35)]"
            ariaLabel="Sculptural stones rotating slowly on ivory"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- Featured collection */

function FeaturedCollection() {
  const products = useQuery(featuredProductsQuery);
  const collections = useQuery(collectionsQuery);

  const hasProducts = (products.data?.length ?? 0) > 0;

  return (
    <section className="border-t border-border/60 bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
        <FadeIn className="mb-16 flex flex-col items-center text-center">
          <span className="gold-rule" />
          <p className="label-eyebrow mt-8">The Collection</p>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            Pieces drawn from place.
          </h2>
        </FadeIn>

        {hasProducts ? (
          <ProductGrid products={products.data!} />
        ) : (
          <CollectionGrid collections={collections.data ?? []} loading={collections.isLoading} />
        )}

        <FadeIn className="mt-20 flex justify-center">
          <Link to="/collections" className="btn-outline-charcoal">
            View collection
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((p) => {
        const img = p.images?.[0];
        return (
          <motion.div key={p.id} variants={fadeUp}>
            <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
              <div className="overflow-hidden bg-warm-white">
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 1.2, ease: LUXE_EASE }}
                  className="aspect-[4/5] w-full"
                >
                  {img?.url ? (
                    <img
                      src={img.url}
                      alt={img.alt ?? p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlaceholderImage aspectClassName="aspect-[4/5]" />
                  )}
                </motion.div>
              </div>
              <div className="mt-6 flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-xl text-charcoal md:text-2xl">{p.name}</h3>
                <p className="whitespace-nowrap text-xs font-light tracking-[0.18em] text-charcoal-soft">
                  {formatPrice(p.price, p.currency)}
                </p>
              </div>
              {p.stone ? (
                <p className="mt-2 label-eyebrow" style={{ color: "var(--color-teal)" }}>
                  {p.stone}
                </p>
              ) : null}
              <span className="mt-3 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-16" />
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function CollectionGrid({ collections, loading }: { collections: Collection[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-10 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <PlaceholderImage key={i} aspectClassName="aspect-[3/4]" />
        ))}
      </div>
    );
  }
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="grid gap-10 md:grid-cols-3"
    >
      {collections.slice(0, 3).map((c) => (
        <motion.div key={c.id} variants={fadeUp}>
          <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block">
            <div className="overflow-hidden bg-warm-white">
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 1.2, ease: LUXE_EASE }}
                className="aspect-[3/4] w-full"
              >
                {c.hero_image_url ? (
                  <img
                    src={c.hero_image_url}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderImage aspectClassName="aspect-[3/4]" />
                )}
              </motion.div>
            </div>
            <p className="label-eyebrow mt-6" style={{ color: "var(--color-teal)" }}>
              Collection
            </p>
            <h3 className="mt-3 font-serif text-2xl text-charcoal md:text-3xl">{c.name}</h3>
            <span className="mt-3 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-16" />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* --------------------------------------------------------- Craftsmanship */

function Craftsmanship() {
  return (
    <section className="border-t border-border/60" style={{ backgroundColor: "var(--color-sage-tint)" }}>
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-2 md:gap-20 md:px-10 md:py-40">
        <FadeIn className="order-2 flex flex-col justify-center md:order-1">
          <p className="label-eyebrow">Craftsmanship</p>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] text-charcoal md:text-6xl">
            From earth to adornment.
          </h2>
          <span className="mt-8 block h-px w-16 bg-gold" />
          <p className="mt-8 max-w-md text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
            Every VEZA piece is individually considered — sketched, cast in wax,
            set with a stone chosen for its own quiet character, then hand-finished
            in our Harare atelier.
          </p>
          <div className="mt-10">
            <Link to="/craftsmanship" className="btn-outline-charcoal">
              Inside the atelier
            </Link>
          </div>
        </FadeIn>

        <FadeIn className="order-1 md:order-2">
          <CinematicVideo
            src="/videos/craftsmanship.mp4"
            className="aspect-[4/5] w-full shadow-[0_40px_80px_-40px_rgba(43,43,40,0.35)]"
            ariaLabel="Jeweller's hands setting a stone in soft daylight"
          />
        </FadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Bespoke */

function Bespoke() {
  return (
    <section className="relative overflow-hidden bg-charcoal">
      <CinematicVideo
        src="/videos/commission.mp4"
        className="absolute inset-0"
        overlayClassName="bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-charcoal/30"
        ariaLabel="A gold pendant slowly assembling"
      />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-28 text-ivory md:grid-cols-[1fr_1fr] md:gap-24 md:px-10 md:py-40">
        <FadeIn>
          <p className="label-eyebrow" style={{ color: "rgba(247,245,240,0.7)" }}>
            Bespoke
          </p>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] text-ivory md:text-6xl">
            A piece made
            <br />
            entirely yours.
          </h2>
          <span className="mt-8 block h-px w-16 bg-gold" />
          <p className="mt-8 max-w-md text-base font-light leading-relaxed text-ivory/80 md:text-lg">
            For a milestone, an heirloom, or a quiet occasion — we design in
            conversation with you, from first sketch to final polish.
          </p>
          <div className="mt-10">
            <Link to="/custom" className="btn-outline-ivory">
              Begin a custom request
            </Link>
          </div>
        </FadeIn>

        <motion.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col justify-center gap-8 md:gap-10"
        >
          {STEPS.map((s) => (
            <motion.li key={s.n} variants={fadeUp} className="border-t border-ivory/25 pt-6">
              <div className="flex items-baseline gap-6">
                <span className="font-serif text-2xl text-gold md:text-3xl">{s.n}</span>
                <div>
                  <p className="label-eyebrow" style={{ color: "rgba(247,245,240,0.7)" }}>
                    {s.label}
                  </p>
                  <p className="mt-3 font-serif text-xl text-ivory md:text-2xl">{s.body}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Stone strip */

function StoneStrip() {
  const gemstones = useQuery(gemstonesQuery);
  const items = gemstones.data ?? [];

  return (
    <section className="border-t border-border/60 bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 pt-28 md:px-10 md:pt-40">
        <FadeIn className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-eyebrow">Stone Library</p>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
              Stones with a place of origin.
            </h2>
          </div>
          <Link
            to="/gemstones"
            className="mt-6 self-start text-[0.72rem] font-light uppercase tracking-[0.28em] text-charcoal transition-colors duration-500 hover:text-teal md:mt-0"
          >
            The full library
          </Link>
        </FadeIn>
      </div>

      <div className="scrollbar-none w-full overflow-x-auto pb-28 md:pb-40">
        <div className="flex gap-6 px-6 md:gap-8 md:px-10">
          {(items.length ? items : Array.from({ length: 4 })).map((raw, i) => {
            const g = raw as Gemstone | undefined;
            const tone = g ? toneForGemstone(g.slug) : "#E4E1D9";
            const img = g?.images?.[0]?.url ?? gemstoneFallbackImage(g?.slug);
            return (
              <motion.div
                key={g?.id ?? i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, ease: LUXE_EASE, delay: i * 0.08 }}
                className="flex-shrink-0"
              >
                {g ? (
                  <Link to="/gemstones/$slug" params={{ slug: g.slug }} className="group block w-[72vw] max-w-[360px] md:w-[26rem]">
                    <div className="overflow-hidden">
                      <div
                        className="aspect-[4/5] w-full"
                        style={{
                          background: `radial-gradient(circle at 40% 40%, ${tone} 0%, var(--color-warm-white) 85%)`,
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={g.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                          />
                        ) : null}
                      </div>
                    </div>
                    <p className="label-eyebrow mt-6" style={{ color: "var(--color-teal)" }}>
                      {g.origin ?? "Zimbabwe"}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl text-charcoal">{g.name}</h3>
                    <span className="mt-3 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-16" />
                  </Link>
                ) : (
                  <div className="w-[72vw] max-w-[360px] md:w-[26rem]">
                    <PlaceholderImage aspectClassName="aspect-[4/5]" tone={tone} />
                  </div>
                )}
              </motion.div>
            );
          })}
          <div className="w-4 flex-shrink-0 md:w-10" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function gemstoneFallbackImage(slug: string | undefined): string | undefined {
  if (slug === "aquamarine") return "/images/gemstones/aquamarine-education.jpg";
  if (slug === "mtorolite") return "/images/gemstones/mtorolite-rough.jpg";
  return undefined;
}

/* ------------------------------------------------------------ Social */

function SocialStrip() {
  const tiles = [
    "/images/gemstones/aquamarine-education.jpg",
    "/images/gemstones/mtorolite-rough.jpg",
    "/images/brand/veza-logo-gold-on-teal.jpg",
    "/images/gemstones/aquamarine-education.jpg",
  ];
  return (
    <section className="border-t border-border/60 bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <FadeIn className="mb-14 flex flex-col items-center text-center">
          <p className="label-eyebrow">Follow the atelier</p>
          <h2 className="mt-6 font-serif text-3xl leading-tight text-charcoal md:text-4xl">
            @veza_studios
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {tiles.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/veza_studios"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="VEZA on Instagram"
              className="group relative block overflow-hidden"
            >
              <div className="aspect-square w-full overflow-hidden bg-warm-white">
                <img
                  src={src}
                  alt="VEZA on Instagram"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
                />
              </div>
              <span className="absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/15" />
            </a>
          ))}
        </div>

        <FadeIn className="mt-12 flex justify-center">
          <a
            href="https://instagram.com/veza_studios"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-charcoal"
          >
            Follow on Instagram
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
