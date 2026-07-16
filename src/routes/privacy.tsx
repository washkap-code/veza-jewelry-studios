import { createFileRoute, Link } from "@tanstack/react-router";
import { FadeIn } from "../components/FadeIn";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VEZA Jewelry Studios" },
      { name: "description", content: "How VEZA Jewelry Studios collects, uses and protects your personal data." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use and protect the information you share with us."
        variant="compact"
        backdrop={{ kind: "wash" }}
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <FadeIn>
            <p className="label-eyebrow">Draft — subject to review</p>
            <p className="mt-4 text-xs font-light leading-relaxed text-charcoal-soft">
              This document is a working draft prepared by VEZA Jewelry Studios and should be reviewed
              by a qualified legal adviser before formal publication. Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}.
            </p>
          </FadeIn>
          <div className="prose mt-12 max-w-none space-y-8 text-base font-light leading-relaxed text-charcoal md:text-[1.05rem]">
            <Section title="1. Who we are">
              VEZA Jewelry Studios ("VEZA", "we", "us") is a fine jewellery house based in Harare, Zimbabwe.
              We can be reached at <a className="text-teal" href="mailto:hello@veza-studios.com">hello@veza-studios.com</a> or on <a className="text-teal" href="tel:+263777602761">+263 777 602 761</a>.
            </Section>
            <Section title="2. What we collect">
              <ul className="list-disc space-y-2 pl-6">
                <li><em>Account details:</em> name, email address, phone number, and password (stored hashed).</li>
                <li><em>Order details:</em> billing and shipping address, order contents, payment reference (we do not store full card numbers — payment is handled by our processor).</li>
                <li><em>Bespoke commissions:</em> the descriptive information you share about the piece you are commissioning.</li>
                <li><em>Correspondence:</em> messages you send us by email, WhatsApp or the site's forms.</li>
                <li><em>Site analytics:</em> anonymous pages visited, device type, and referrer — used to improve the site.</li>
              </ul>
            </Section>
            <Section title="3. How we use it">
              To take and fulfil your order, respond to your commission enquiry, arrange international shipping and customs paperwork, provide customer support, prevent fraud, and — with your permission — send occasional atelier updates.
            </Section>
            <Section title="4. Sharing with third parties">
              We share only what is necessary with couriers (DHL, FedEx, UPS, Aramex, EMS/Zimpost) to ship your order, with our payment processor to take payment, and with technology providers who host the site. We do not sell your data.
            </Section>
            <Section title="5. International transfer">
              We ship internationally from Zimbabwe. Your data may be processed in any country where we or our service providers operate. We take reasonable steps to protect it wherever it is held.
            </Section>
            <Section title="6. Retention">
              We keep order records for as long as required to service warranties and to meet legal and tax obligations. Marketing preferences are kept until you unsubscribe.
            </Section>
            <Section title="7. Your rights">
              You may request access to, correction of, or deletion of your personal data by writing to <a className="text-teal" href="mailto:hello@veza-studios.com">hello@veza-studios.com</a>. You may unsubscribe from marketing at any time.
            </Section>
            <Section title="8. Cookies">
              We use a small number of functional cookies (to keep you signed in and to remember your cart) and privacy-respecting analytics. We do not use advertising trackers.
            </Section>
            <Section title="9. Changes">
              We may update this policy from time to time. The effective date above will change when we do.
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
