import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { gemstonesQuery, toneForGemstone } from "../lib/queries";
import { FadeIn } from "../components/FadeIn";
import { AuthLoader } from "../components/AuthLoader";
import { fadeUp, staggerContainer, viewportOnce, LUXE_EASE } from "../lib/motion";
import { VezaLogo } from "../components/VezaLogo";

export const Route = createFileRoute("/gemstones/")({
  head: () => ({
    meta: [
      { title: "Gemstones — VEZA Jewelry Studios" },
      {
        name: "description",
        content:
          "An education in stone. Ethically sourced gemstones from Zimbabwe and across the African continent.",
      },
      { property: "og:title", content: "The Gemstone Library — VEZA" },
      {
        property: "og:description",
        content: "An education in stone. Zimbabwe's earth, elevated.",
      },
    ],
  }),
  component: GemstonesPage,
});

function GemstonesPage() {
  const { data, isLoading, error } = useQuery(gemstonesQuery);

  return (
    <>
      <section className="border-b border-border/60 bg-warm-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center md:py-32">
          <FadeIn>
            <p className="label-eyebrow mb-6">The Earth</p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
              The Gemstone Library
            </h1>
            <span className="gold-rule mx-auto mt-10" />
            <p className="mt-10 mx-auto max-w-2xl font-serif text-xl font-light italic leading-relaxed text-charcoal-soft md:text-2xl">
              An education in stone. Zimbabwe's earth, elevated.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          {isLoading ? (
            <AuthLoader minHeight="40vh" />
          ) : error ? (
            <p className="py-24 text-center text-sm font-light text-charcoal-soft">
              Unable to load the library.
            </p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
            >
              {(data ?? []).map((g) => {
                const tone = toneForGemstone(g.slug);
                return (
                  <motion.div key={g.id} variants={fadeUp}>
                    <Link
                      to="/gemstones/$slug"
                      params={{ slug: g.slug }}
                      className="group block"
                    >
                      <div className="overflow-hidden">
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 1.4, ease: LUXE_EASE }}
                          className="relative aspect-[4/5] w-full"
                          style={{
                            background: `radial-gradient(circle at 40% 40%, ${tone} 0%, var(--color-warm-white) 85%)`,
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-[0.12]">
                            <VezaLogo variant="mark" className="h-24 w-24 text-charcoal" />
                          </div>
                        </motion.div>
                      </div>
                      <div className="mt-6">
                        <p className="label-eyebrow" style={{ color: "var(--color-teal)" }}>
                          {g.origin?.split(";")[0] ?? "Origin"}
                        </p>
                        <h3 className="mt-3 font-serif text-2xl text-charcoal md:text-3xl">
                          {g.name}
                        </h3>
                        {g.symbolism ? (
                          <p className="mt-3 line-clamp-2 text-sm font-light leading-relaxed text-charcoal-soft">
                            {g.symbolism}
                          </p>
                        ) : null}
                        <span className="mt-4 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-16" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
