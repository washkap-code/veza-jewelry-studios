import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { collectionsQuery } from "../lib/queries";
import { FadeIn } from "../components/FadeIn";
import { PageHeader } from "../components/PageHeader";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { AuthLoader } from "../components/AuthLoader";
import { LUXE_EASE } from "../lib/motion";
import type { Collection } from "../lib/supabase";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — VEZA Jewelry Studios" },
      {
        name: "description",
        content:
          "Sculptural editions drawn from the landscapes of southern Africa — MUFAMBI, Earth, Water, Heritage and Men's.",
      },
      { property: "og:title", content: "Collections — VEZA Jewelry Studios" },
      {
        property: "og:description",
        content: "Sculptural editions drawn from the landscapes of southern Africa.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data, isLoading, error } = useQuery(collectionsQuery);

  return (
    <>
      <PageHeader
        eyebrow="The Archive"
        title="Collections"
        description="Five bodies of work, each drawn from a place. Sculptural editions made slowly by hand in our Harare atelier."
        backdrop={{ kind: "mark" }}
      />



      {isLoading ? (
        <AuthLoader minHeight="50vh" />
      ) : error ? (
        <div className="mx-auto max-w-2xl px-6 py-24 text-center text-sm font-light text-charcoal-soft">
          The archive could not be loaded. Please try again.
        </div>
      ) : (
        <div className="bg-ivory">
          {(data ?? []).map((c, i) => (
            <CollectionRow key={c.id} collection={c} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

function CollectionRow({ collection, index }: { collection: Collection; index: number }) {
  const reverse = index % 2 === 1;
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-10 md:py-28 lg:gap-24">
        <FadeIn
          className={`${reverse ? "md:order-2" : ""}`}
          y={32}
          duration={1}
        >
          <Link
            to="/collections/$slug"
            params={{ slug: collection.slug }}
            className="group block"
          >
            <div className="overflow-hidden">
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 1.4, ease: LUXE_EASE }}
              >
                {collection.hero_image_url ? (
                  <img
                    src={collection.hero_image_url}
                    alt={collection.name}
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <PlaceholderImage aspectClassName="aspect-[4/5]" glyphClassName="h-48 w-48 text-teal" />
                )}
              </motion.div>
            </div>
          </Link>
        </FadeIn>

        <FadeIn
          className={`flex flex-col justify-center ${reverse ? "md:order-1" : ""}`}
          delay={0.1}
          y={24}
        >
          <p className="label-eyebrow" style={{ color: "var(--color-teal)" }}>
            Collection {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-6xl">
            {collection.name}
          </h2>
          <span className="mt-6 block h-px w-16 bg-gold" />
          {collection.description ? (
            <p className="mt-8 max-w-lg text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
              {collection.description}
            </p>
          ) : null}
          <Link
            to="/collections/$slug"
            params={{ slug: collection.slug }}
            className="group mt-10 inline-flex w-fit flex-col text-[0.72rem] font-light uppercase tracking-[0.28em] text-charcoal transition-colors duration-500 hover:text-teal"
          >
            Explore
            <span className="mt-2 block h-px w-16 origin-left bg-teal transition-transform duration-700 ease-out group-hover:scale-x-150" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
