import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  gemstoneBySlugQuery,
  productsByStoneQuery,
  toneForGemstone,
} from "../lib/queries";
import { FadeIn } from "../components/FadeIn";
import { AuthLoader } from "../components/AuthLoader";
import { VezaLogo } from "../components/VezaLogo";
import { ProductCard } from "./collections.$slug";
import { fadeUp, staggerContainer, viewportOnce, LUXE_EASE } from "../lib/motion";

export const Route = createFileRoute("/gemstones/$slug")({
  component: GemstoneDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="label-eyebrow">Not found</p>
      <h1 className="mt-6 font-serif text-5xl text-charcoal">Stone not found</h1>
      <Link to="/gemstones" className="btn-outline-charcoal mt-10">
        The Gemstone Library
      </Link>
    </div>
  ),
});

function GemstoneDetail() {
  const { slug } = Route.useParams();
  const { data: stone, isLoading, error } = useQuery(gemstoneBySlugQuery(slug));
  const { data: products } = useQuery(productsByStoneQuery(stone?.name));

  useEffect(() => {
    if (stone) document.title = `${stone.name} — VEZA Jewelry Studios`;
  }, [stone]);

  if (isLoading) return <AuthLoader minHeight="70vh" />;
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center text-sm font-light text-charcoal-soft">
        Unable to load this stone.
      </div>
    );
  }
  if (!stone) throw notFound();

  const tone = toneForGemstone(stone.slug);

  return (
    <>
      <section
        className="border-b border-border/60"
        style={{
          background: `linear-gradient(180deg, ${tone}55 0%, var(--color-warm-white) 100%)`,
        }}
      >
        <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <FadeIn>
            {stone.origin ? (
              <p className="label-eyebrow mb-6" style={{ color: "var(--color-teal)" }}>
                {stone.origin.split(";")[0]}
              </p>
            ) : null}
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
              {stone.name}
            </h1>
            <div className="mt-10 flex justify-center opacity-30">
              <VezaLogo variant="mark" className="h-14 w-14 text-charcoal" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Spec band */}
      <section className="border-b border-border/60 bg-ivory">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid gap-10 md:grid-cols-3"
          >
            <SpecCol label="Hardness" value={stone.hardness} />
            <SpecCol label="Origin" value={stone.origin} />
            <SpecCol label="Colour Variations" value={stone.color_variations} />
          </motion.div>
        </div>
      </section>

      {/* Body sections */}
      <section className="bg-warm-white">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          {stone.description ? (
            <FadeIn className="mb-16">
              <p className="font-serif text-2xl leading-relaxed text-charcoal md:text-3xl">
                {stone.description}
              </p>
            </FadeIn>
          ) : null}

          {stone.symbolism ? (
            <Section eyebrow="Symbolism" body={stone.symbolism} />
          ) : null}
          {stone.zimbabwe_sourcing ? (
            <Section
              eyebrow="Zimbabwean Sourcing"
              body={stone.zimbabwe_sourcing}
              accent
            />
          ) : null}
          {stone.care_guide ? (
            <Section eyebrow="Care Guide" body={stone.care_guide} />
          ) : null}
        </div>
      </section>

      {products && products.length > 0 ? (
        <section className="border-t border-border/60 bg-ivory">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <FadeIn className="mb-14 text-center">
              <p className="label-eyebrow">Pieces</p>
              <h2 className="mt-6 font-serif text-3xl text-charcoal md:text-4xl">
                Set with {stone.name}.
              </h2>
            </FadeIn>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
            >
              {products.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ) : null}

      <section
        className="border-t border-border/60"
        style={{ backgroundColor: "var(--color-sage)" }}
      >
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
          <FadeIn>
            <p className="label-eyebrow" style={{ color: "rgba(247,245,240,0.7)" }}>
              Custom
            </p>
            <h2 className="mt-6 font-serif text-3xl leading-tight text-ivory md:text-5xl">
              Commission a piece with {stone.name}.
            </h2>
            <div className="mt-10">
              <Link to="/custom" className="btn-outline-ivory">
                Begin a Commission
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

function SpecCol({ label, value }: { label: string; value: string | null }) {
  return (
    <motion.div variants={fadeUp} className="border-t border-gold/60 pt-6">
      <p className="label-eyebrow" style={{ color: "var(--color-teal)" }}>
        {label}
      </p>
      <p
        className="mt-4 font-serif text-xl leading-relaxed text-charcoal md:text-2xl"
        style={{ minHeight: "3rem" }}
      >
        {value ?? "—"}
      </p>
    </motion.div>
  );
}

function Section({
  eyebrow,
  body,
  accent = false,
}: {
  eyebrow: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <FadeIn className="mb-14">
      <p
        className="label-eyebrow"
        style={{ color: accent ? "var(--color-teal)" : undefined }}
      >
        {eyebrow}
      </p>
      <span
        className="mt-4 block h-px w-12"
        style={{ backgroundColor: accent ? "var(--color-gold)" : "var(--color-border)" }}
      />
      <p className="mt-6 text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
        {body}
      </p>
    </FadeIn>
  );
}
