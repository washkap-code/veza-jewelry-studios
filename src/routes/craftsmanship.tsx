import { createFileRoute, Link } from "@tanstack/react-router";
import { FadeIn } from "../components/FadeIn";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/craftsmanship")({
  head: () => ({
    meta: [
      { title: "Craftsmanship — VEZA Jewelry Studios" },
      { name: "description", content: "From raw Zimbabwean gemstone to finished heirloom — the VEZA making process, by hand in Harare." },
    ],
  }),
  component: CraftsmanshipPage,
});

const PROCESS = [
  { n: "01", title: "Sourcing", body: "Rough stones are selected from trusted Zimbabwean sources — judged in daylight for colour, clarity and character before they ever enter the atelier." },
  { n: "02", title: "Stone cutting", body: "Each stone is studied, marked and cut to reveal its best self. A single stone may wait weeks for the right decision — the cut is permanent, so patience is the first tool." },
  { n: "03", title: "Design sketches", body: "Forms are drawn by hand around the finished stone, echoing the geometry of the VEZA mark — strong, minimal, deliberate." },
  { n: "04", title: "Metalwork", body: "Sterling silver and gold are cast, forged and chased into the sketched form. Joints are soldered, surfaces refined, edges softened by hand." },
  { n: "05", title: "Setting & polishing", body: "The stone meets its mount. Settings are closed by hand under magnification; polishing passes through successive grades until the metal holds light like water." },
  { n: "06", title: "Finishing & packaging", body: "Every piece is inspected, hallmarked, documented and placed in VEZA's signature packaging — ready to begin its life as an heirloom." },
];

function CraftsmanshipPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Hand"
        title="Craftsmanship"
        description="Sand-cast, chased and finished by hand in our Harare atelier. This is how a stone becomes an heirloom."
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <FadeIn>
            <p className="label-eyebrow">The process</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal md:text-5xl">
              Six acts of patience.
            </h2>
            <span className="gold-rule mt-8" />
          </FadeIn>
          <ol className="mt-14">
            {PROCESS.map((s, idx) => (
              <FadeIn key={s.n} delay={idx * 0.05}>
                <li className="grid gap-4 border-t border-border/60 py-8 md:grid-cols-[80px_240px_1fr] md:gap-8">
                  <span className="font-serif text-2xl text-gold">{s.n}</span>
                  <h3 className="font-serif text-2xl text-charcoal">{s.title}</h3>
                  <p className="text-sm font-light leading-relaxed text-charcoal-soft">{s.body}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>
      <section className="border-t border-border/60 bg-sage-tint">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center md:py-24">
          <FadeIn>
            <h2 className="font-serif text-3xl leading-tight text-charcoal md:text-4xl">
              Commission a piece made this way.
            </h2>
            <Link to="/custom" className="btn-outline-charcoal mt-10">Begin Your Commission</Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
