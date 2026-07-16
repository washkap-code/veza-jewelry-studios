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
    eyebrow: "The Name",
    title: "VEZA — to carve.",
    body: "In Shona, veza means 'to carve.' It is the word for the patient work of shaping stone by hand — the same work our artisans do each day in Harare, on stones drawn from Zimbabwe's own earth.",
  },
  {
    eyebrow: "Who We Are",
    title: "A women-led jewellery house, rooted in Zimbabwe.",
    body: "VEZA is a women-led fine jewellery house born from deep reverence for Zimbabwe, its heritage and its treasures. We bridge the raw beauty of the earth with the refinement of the studio — creating pieces that carry a story worth wearing.",
  },
  {
    eyebrow: "Our Philosophy",
    title: "Fine jewellery, honestly made.",
    body: "Every VEZA piece is quiet in speech and considered in form. We refuse decoration for its own sake. The stone always leads; the metal serves it; the human hand finishes it. Nothing more.",
  },
  {
    eyebrow: "Provenance",
    title: "Sourced, cut and set at home.",
    body: "Our gemstones are ethically hand-selected from Zimbabwe's own deposits. Our metals are authentically local. Our labour is 100% Zimbabwean, empowering master artisans and returning value to the country whose ground gives us these stones.",
  },
  {
    eyebrow: "Sustainability",
    title: "Taken with care, returned with pride.",
    body: "Small production runs. Recycled metals where they exist. Stones sourced with respect for the people who mine them and the earth that holds them. We work in a way we can defend to the next generation.",
  },
  {
    eyebrow: "Our Legacy",
    title: "We don't just make jewellery — we carve a legacy.",
    body: "VEZA exists to show what Zimbabwean talent can hold against any atelier in the world. Every piece we finish is a small act of national confidence, carried out into the world by the person who wears it.",
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
