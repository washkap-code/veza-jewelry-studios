import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { FadeIn } from "../components/FadeIn";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { journalPostsQuery } from "../lib/queries";
import { fadeUp, staggerContainer, viewportOnce, LUXE_EASE } from "../lib/motion";

export const Route = createFileRoute("/journal/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(journalPostsQuery),
  head: () => ({
    meta: [
      { title: "Journal — VEZA" },
      {
        name: "description",
        content:
          "Notes from the VEZA atelier — process, people, and places behind our handcrafted Zimbabwean jewellery.",
      },
      { property: "og:title", content: "Journal — VEZA" },
      {
        property: "og:description",
        content:
          "Notes from the VEZA atelier — process, people, and places behind our handcrafted Zimbabwean jewellery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://veza-studios.com/journal" },
    ],
    links: [{ rel: "canonical", href: "https://veza-studios.com/journal" }],
  }),
  component: JournalIndex,
});

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function JournalIndex() {
  const { data: posts } = useSuspenseQuery(journalPostsQuery);

  return (
    <>
      <PageHeader
        eyebrow="Correspondence"
        title="Journal"
        description="Notes from the atelier — process, people, and places."
      />

      <section className="bg-ivory">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          {posts.length === 0 ? (
            <p className="text-center text-sm font-light text-charcoal-soft">
              New entries will appear here soon.
            </p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid gap-x-10 gap-y-16 md:grid-cols-2"
            >
              {posts.map((post) => {
                const date = formatDate(post.published_at ?? post.created_at);
                return (
                  <motion.article key={post.id} variants={fadeUp}>
                    <Link
                      to="/journal/$slug"
                      params={{ slug: post.slug }}
                      className="group block"
                    >
                      <div className="overflow-hidden bg-warm-white">
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 1.2, ease: LUXE_EASE }}
                          className="aspect-[16/10] w-full"
                        >
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <PlaceholderImage aspectClassName="aspect-[16/10]" />
                          )}
                        </motion.div>
                      </div>
                      <FadeIn className="mt-6">
                        <p
                          className="label-eyebrow"
                          style={{ color: "var(--color-teal)" }}
                        >
                          {post.category ?? "Journal"}
                        </p>
                        <h2 className="mt-4 font-serif text-2xl leading-tight text-charcoal md:text-3xl">
                          {post.title}
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-4 text-sm font-light leading-relaxed text-charcoal-soft md:text-base">
                            {post.excerpt}
                          </p>
                        ) : null}
                        {date ? (
                          <p className="mt-6 text-[0.68rem] font-light uppercase tracking-[0.24em] text-charcoal-soft">
                            {date}
                          </p>
                        ) : null}
                        <span className="mt-4 block h-px w-0 bg-gold transition-[width] duration-700 ease-out group-hover:w-16" />
                      </FadeIn>
                    </Link>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
