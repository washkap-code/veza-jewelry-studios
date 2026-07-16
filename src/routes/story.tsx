import { createFileRoute, Link } from "@tanstack/react-router";
import { FadeIn } from "../components/FadeIn";
import { PageHeader } from "../components/PageHeader";
import { VezaLogo } from "../components/VezaLogo";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Story — VEZA Jewelry Studios" },
      { name: "description", content: "The story of VEZA — a contemporary African luxury jewelry design house rooted in Zimbabwe." },
    ],
  }),
  component: StoryPage,
});

const SECTIONS = [
  {
    eyebrow: "The Founder",
    title: "Born of stone and patience.",
    body: "VEZA began with a single conviction: that the stones of Zimbabwe deserve to be seen not as raw export, but as finished art. What started as a fascination with gemstones — their geology, their light, their quiet permanence — became a design house devoted to transforming natural stone into modern heirlooms.",
  },
  {
    eyebrow: "Philosophy",
    title: "Luxury without excess.",
    body: "We believe luxury is not abundance but intention. Every VEZA piece begins as a natural stone and earns its final form slowly — through sculpture, craftsmanship and restraint. Nothing decorative for its own sake; nothing that does not serve the stone.",
  },
  {
    eyebrow: "Zimbabwean Inspiration",
    title: "A landscape worn close.",
    body: "The balancing granite of Epworth, the green seam of the Great Dyke, the still surface of Kariba at dawn — Zimbabwe's landscapes are our first drawings. Our geometry echoes them: strong forms, honest materials, natural beauty elevated through human hands.",
  },
  {
    eyebrow: "Sustainability",
    title: "Taken with care, returned with pride.",
    body: "We source stones responsibly and work with local cutters and smiths, keeping value and skill within Zimbabwe. Small production runs, recycled metals where possible, and pieces built to outlive their first owner — this is our quiet sustainability.",
  },
  {
    eyebrow: "Vision",
    title: "African luxury, on its own terms.",
    body: "VEZA exists to show what Zimbabwean talent can hold against any atelier in the world. Our vision is a house whose name is spoken alongside the great design houses — and whose pieces carry home wherever they travel.",
  },
];

function StoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Origins"
        title="Our Story"
        description="A jewelry house rooted in Zimbabwe — quietly modern, patiently made."
        backdrop={{ kind: "wash" }}
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          {SECTIONS.map((s, i) => (
            <FadeIn key={s.eyebrow} delay={i * 0.05}>
              <article className={`grid gap-6 py-14 md:grid-cols-[220px_1fr] md:gap-12 ${i > 0 ? "border-t border-border/60" : ""}`}>
                <p className="label-eyebrow pt-2">{s.eyebrow}</p>
                <div>
                  <h2 className="font-serif text-3xl leading-tight text-charcoal md:text-4xl">{s.title}</h2>
                  <p className="mt-5 text-base font-light leading-relaxed text-charcoal-soft">{s.body}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
      <section className="border-t border-border/60 bg-warm-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center md:py-24">
          <FadeIn>
            <VezaLogo variant="mark" className="mx-auto h-9 w-9 text-teal" />
            <h2 className="mt-8 font-serif text-3xl leading-tight text-charcoal md:text-4xl">
              The rest of the story is written by hand.
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              <Link to="/craftsmanship" className="btn-outline-charcoal">Our craftsmanship</Link>
              <Link to="/collections" className="label-eyebrow text-charcoal-soft transition-colors duration-500 hover:text-teal">
                Explore collections
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
