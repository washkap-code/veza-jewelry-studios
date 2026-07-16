import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, MapPin } from "lucide-react";
import { FadeIn } from "../components/FadeIn";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — VEZA Jewelry Studios" },
      { name: "description", content: "Reach the VEZA atelier in Harare, Zimbabwe — by correspondence, appointment or social media." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="In Person"
        title="Contact"
        description="Harare, Zimbabwe. By appointment and correspondence."
        variant="compact"
        backdrop={{ kind: "wash" }}
      />
      <section className="bg-ivory">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-3 md:py-28">
          <FadeIn>
            <div className="flex flex-col items-start">
              <Mail strokeWidth={1} size={22} className="text-teal" />
              <h2 className="mt-6 font-serif text-2xl text-charcoal">Correspondence</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-soft">
                For orders, commissions and press.
              </p>
              <a href="mailto:hello@veza-studios.com" className="mt-4 text-sm font-light text-charcoal underline decoration-teal/40 underline-offset-4 transition-colors duration-500 hover:text-teal">
                hello@veza-studios.com
              </a>
              <a href="tel:+263777602761" className="mt-2 text-sm font-light text-charcoal underline decoration-teal/40 underline-offset-4 transition-colors duration-500 hover:text-teal">
                +263 777 602 761
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="flex flex-col items-start">
              <MapPin strokeWidth={1} size={22} className="text-teal" />
              <h2 className="mt-6 font-serif text-2xl text-charcoal">The Atelier</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-soft">
                Harare, Zimbabwe.<br />Visits by appointment only — write to us to arrange one.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.16}>
            <div className="flex flex-col items-start">
              <Instagram strokeWidth={1} size={22} className="text-teal" />
              <h2 className="mt-6 font-serif text-2xl text-charcoal">Social</h2>
              <div className="mt-3 flex flex-col gap-2 text-sm font-light">
                <a href="https://www.instagram.com/veza_studios" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-charcoal-soft transition-colors duration-500 hover:text-teal">
                  <Instagram strokeWidth={1} size={14} /> @veza_studios
                </a>
                <a href="https://www.facebook.com/people/VEZA-Studios/100087093636802/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-charcoal-soft transition-colors duration-500 hover:text-teal">
                  <Facebook strokeWidth={1} size={14} /> VEZA Studios
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      <section className="border-t border-border/60 bg-warm-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center md:py-24">
          <FadeIn>
            <p className="label-eyebrow">Client care</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal md:text-4xl">
              Shipping, returns and care.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed text-charcoal-soft">
              Every order ships worldwide, fully insured, in our signature packaging.
              Returns are accepted within 14 days on unworn ready-to-wear pieces;
              commissions are made to order and final. For care guidance, see each
              stone's page in the gemstone library.
            </p>
            <Link to="/gemstones" className="btn-outline-charcoal mt-10">Gemstone care guides</Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
