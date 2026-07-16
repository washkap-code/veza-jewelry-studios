import { createFileRoute, Link } from "@tanstack/react-router";
import { FadeIn } from "../components/FadeIn";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — VEZA Jewelry Studios" },
      { name: "description", content: "The terms on which VEZA Jewelry Studios sells and ships jewellery internationally." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        description="The terms on which we sell ready-to-wear pieces and take bespoke commissions."
        variant="compact"
        backdrop={{ kind: "wash" }}
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <FadeIn>
            <p className="label-eyebrow">Draft — subject to review</p>
            <p className="mt-4 text-xs font-light leading-relaxed text-charcoal-soft">
              A working draft prepared by VEZA Jewelry Studios; please have qualified counsel review before formal publication.
            </p>
          </FadeIn>
          <div className="prose mt-12 max-w-none space-y-8 text-base font-light leading-relaxed text-charcoal md:text-[1.05rem]">
            <Section title="1. Who is selling">
              These terms are between you (the buyer) and VEZA Jewelry Studios, a fine jewellery house based in Harare, Zimbabwe.
            </Section>
            <Section title="2. Products & pricing">
              All prices are in United States Dollars (USD) unless stated otherwise. Prices exclude import duties, taxes and courier fees at destination, which are the buyer's responsibility. Every piece is described in good faith; natural stones vary slightly in colour and inclusion from example photography.
            </Section>
            <Section title="3. Bespoke commissions">
              Bespoke pieces are made to order. A 50% non-refundable deposit is required to secure production; the balance is due before dispatch. Bespoke pieces cannot be returned except in the case of a genuine defect attributable to VEZA. Design changes after production has begun may incur additional charges.
            </Section>
            <Section title="4. Payment">
              Payment is taken via our payment processor at checkout, or by bank transfer / mobile money on request. We do not receive or store your full card details.
            </Section>
            <Section title="5. Shipping">
              We ship worldwide from Harare, Zimbabwe with DHL, FedEx, UPS, Aramex or EMS/Zimpost. Delivery times shown are estimates from courier tariffs and are not guaranteed. Import duties and taxes are the buyer's responsibility.
            </Section>
            <Section title="6. Title & risk">
              Risk passes to the buyer once the parcel is handed to the courier; title passes on payment in full. Please retain the courier tracking number provided in your dispatch notice.
            </Section>
            <Section title="7. Returns">
              Ready-to-wear pieces may be returned within 14 days of delivery if unworn and in original packaging. The buyer covers return shipping and insurance. Bespoke commissions and altered pieces cannot be returned. Refunds are processed within 14 days of receipt of the returned piece.
            </Section>
            <Section title="8. Warranty & care">
              We warrant our work against manufacturing defect for 12 months from delivery. This does not cover ordinary wear, damage, loss, or changes in stone caused by chemicals or impact. Please follow the care guidance on each stone's page.
            </Section>
            <Section title="9. Limitation of liability">
              To the extent permitted by law, our liability is limited to the value of the piece purchased. We are not liable for indirect or consequential loss.
            </Section>
            <Section title="10. Governing law">
              These terms are governed by the laws of Zimbabwe. Disputes shall be resolved in the courts of Harare, unless another forum is agreed in writing.
            </Section>
            <Section title="11. Contact">
              Correspondence: <a className="text-teal" href="mailto:hello@veza-studios.com">hello@veza-studios.com</a> · <a className="text-teal" href="tel:+263777602761">+263 777 602 761</a>.
            </Section>
          </div>
          <div className="mt-16 text-center">
            <Link to="/contact" className="btn-outline-charcoal">Contact us with questions</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-charcoal">{title}</h2>
      <div className="mt-3 text-charcoal-soft">{children}</div>
    </div>
  );
}
