import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { journalPostBySlugQuery, type JournalPost } from "../lib/queries";
import { FadeIn } from "../components/FadeIn";
import { ShareButton } from "../components/ShareButton";

const SITE_ORIGIN = "https://veza-studios.com";

function titleize(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(
      journalPostBySlugQuery(params.slug),
    );
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE_ORIGIN}/journal/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Article not found — VEZA Journal" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData as { post: JournalPost };
    const title = `${post.title} — VEZA Journal`;
    const description =
      post.excerpt ??
      (post.content
        ? post.content.replace(/\s+/g, " ").slice(0, 155).trim()
        : "Notes from the VEZA atelier — process, people, and places.");
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: post.title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (post.cover_image_url) {
      meta.push({ property: "og:image", content: post.cover_image_url });
      meta.push({ name: "twitter:image", content: post.cover_image_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description,
            image: post.cover_image_url ?? undefined,
            datePublished: post.published_at ?? post.created_at,
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  notFoundComponent: JournalNotFound,
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center text-sm font-light text-charcoal-soft">
      Unable to load this article. Please try again.
    </div>
  ),
  component: JournalEntry,
});

function JournalNotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="label-eyebrow">Not found</p>
      <h1 className="mt-6 font-serif text-5xl text-charcoal">
        {titleize(slug)}
      </h1>
      <p className="mt-6 text-sm font-light text-charcoal-soft">
        This entry has drifted out of the archive.
      </p>
      <Link to="/journal" className="btn-outline-charcoal mt-10">
        Back to the Journal
      </Link>
    </div>
  );
}

function JournalEntry() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(journalPostBySlugQuery(slug));
  if (!post) throw notFound();

  const date = formatDate(post.published_at ?? post.created_at);
  const paragraphs = post.content
    ? post.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <article>
      <header className="border-b border-border/60 bg-warm-white">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <FadeIn>
            <p className="label-eyebrow mb-6">
              {post.category ?? "Journal"}
            </p>
            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight text-charcoal md:text-6xl">
              {post.title}
            </h1>
            {date ? (
              <p className="mt-8 text-xs font-light uppercase tracking-[0.24em] text-charcoal-soft">
                {date}
              </p>
            ) : null}
            {post.excerpt ? (
              <p className="mt-10 mx-auto max-w-2xl font-serif text-xl font-light italic leading-relaxed text-charcoal-soft md:text-2xl">
                {post.excerpt}
              </p>
            ) : null}
          </FadeIn>
        </div>
      </header>

      {post.cover_image_url ? (
        <div className="bg-ivory">
          <div className="mx-auto max-w-5xl px-6 pt-16 md:pt-20">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="aspect-[16/9] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      ) : null}

      <div className="bg-ivory">
        <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
          {paragraphs.length ? (
            <div className="space-y-6 text-base font-light leading-relaxed text-charcoal md:text-lg">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm font-light text-charcoal-soft">
              This entry has no body yet.
            </p>
          )}

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6">
            <Link to="/journal" className="btn-outline-charcoal">
              Back to the Journal
            </Link>
            <ShareButton title={post.title} text={post.excerpt ?? undefined} />
          </div>
        </div>
      </div>
    </article>
  );
}
