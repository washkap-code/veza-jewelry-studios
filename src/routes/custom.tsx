import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "../components/FadeIn";
import { PageHeader } from "../components/PageHeader";
import { VezaLogo } from "../components/VezaLogo";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { notifyAdmins } from "../lib/notifications";
import { LUXE_EASE } from "../lib/motion";

export const Route = createFileRoute("/custom")({
  head: () => ({
    meta: [
      { title: "Custom Pieces — VEZA Jewelry Studios" },
      { name: "description", content: "Commission a bespoke VEZA piece — your stone, your story, sculpted by hand in Harare, Zimbabwe." },
    ],
  }),
  component: CustomPage,
});

const STEPS = [
  { n: "01", title: "Consultation", body: "We begin with a conversation — your story, your occasion, your budget. By correspondence or in person in Harare." },
  { n: "02", title: "Stone selection", body: "We source and present natural stones for your piece — aquamarine, mtorolite, tiger eye and beyond — each chosen for character and clarity." },
  { n: "03", title: "Design sketches", body: "Our designers draw your piece by hand. You refine the form with us until it is unmistakably yours." },
  { n: "04", title: "Production", body: "The piece is cut, cast, set and finished in our atelier — slowly, by hand, with photographs shared along the way." },
  { n: "05", title: "Delivery", body: "Your commission arrives fully insured, in VEZA's signature packaging, with its story documented." },
];

const GEMSTONE_OPTIONS = ["Aquamarine", "Mtorolite", "Tiger Eye", "Amethyst", "Quartz", "Carnelian", "Undecided — advise me"];
const METAL_OPTIONS = ["925 Sterling Silver", "9ct Gold", "18ct Gold", "Mixed metals", "Undecided — advise me"];
const BUDGET_OPTIONS = ["Under $500", "$500 – $1,000", "$1,000 – $2,500", "$2,500 – $5,000", "Above $5,000"];

function CustomPage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gemstone, setGemstone] = useState("");
  const [metal, setMetal] = useState("");
  const [budget, setBudget] = useState("");
  const [occasion, setOccasion] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const finalName = name.trim() || profile?.full_name?.trim() || "";
    const finalEmail = email.trim() || user?.email || "";
    if (!finalName || !/^\S+@\S+\.\S+$/.test(finalEmail)) {
      setError("Please share your name and a valid email so we can reach you.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Tell us a little more about the piece you have in mind.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from("custom_requests").insert({
        user_id: user?.id ?? null,
        name: finalName,
        email: finalEmail,
        gemstone_preference: gemstone || null,
        metal_preference: metal || null,
        budget_range: budget || null,
        occasion: occasion.trim() || null,
        description: description.trim(),
        status: "new",
      });
      if (err) throw err;
      await notifyAdmins({
        kind: "commission.new",
        title: `New commission from ${finalName}`,
        message: description.trim().slice(0, 140),
        link: "/admin/commissions",
        meta: { email: finalEmail, gemstone, metal, budget, occasion },
      });
      setDone(true);
    } catch {
      setError("Something interrupted our craft. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="By Commission"
        title="Custom Pieces"
        description="Bespoke commissions, imagined with you and drawn to a single hand. One stone, one story, one piece."
        backdrop={{
          kind: "video",
          src: "/videos/commission.mp4",
          ariaLabel: "A jeweller sketching a commission in the VEZA atelier",
        }}
      />

      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <FadeIn>
            <p className="label-eyebrow">The journey</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal md:text-5xl">
              From conversation to heirloom.
            </h2>
            <span className="gold-rule mt-8" />
          </FadeIn>
          <ol className="mt-14 space-y-0">
            {STEPS.map((s, idx) => (
              <FadeIn key={s.n} delay={idx * 0.06}>
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

      <section className="border-t border-border/60 bg-warm-white">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
          <FadeIn>
            <p className="label-eyebrow">Cut & Shape</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal md:text-5xl">
              Define your cut and shape.
            </h2>
            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-charcoal-soft">
              How a stone is cut shapes how it wears. A short field guide to the cuts we hand-work most often at the VEZA atelier — a starting point for your commission conversation.
            </p>
            <span className="gold-rule mt-8" />
          </FadeIn>
          <div className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Pear", note: "A soft teardrop — flattering on shorter, wider fingers and hands." },
              { title: "Round", note: "The most versatile of cuts and a timeless classic — a stone that suits nearly everyone." },
              { title: "Emerald", note: "Long, slender and rectangular — elegant on longer fingers." },
              { title: "Cushion", note: "Softly rounded corners — a quietly romantic silhouette." },
              { title: "Baguette", note: "Elongated and linear — creates the illusion of length in a ring." },
              { title: "Cabochon", note: "Rounded and polished, without facets. Best for opaque coloured stones — round, loaf or pear shapes." },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.05}>
                <article className="border-t border-border/60 pt-6">
                  <p className="label-eyebrow" style={{ color: "var(--color-teal)" }}>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-serif text-2xl text-charcoal">{c.title}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-soft">{c.note}</p>
                </article>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <p className="mt-14 max-w-3xl text-sm font-light italic leading-relaxed text-charcoal-soft">
              To speak with the atelier directly about your commission, write to{" "}
              <a className="text-teal" href="mailto:hello@veza-studios.com">hello@veza-studios.com</a>{" "}
              or call{" "}
              <a className="text-teal" href="tel:+263777602761">+263 777 602 761</a>.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-border/60 bg-warm-white">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: LUXE_EASE }}
              className="text-center"
            >
              <VezaLogo variant="mark" className="mx-auto h-10 w-10 text-teal" />
              <h2 className="mt-8 font-serif text-4xl text-charcoal">Your commission begins.</h2>
              <p className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-charcoal-soft">
                Thank you. Our atelier has received your request and will write to you
                within two working days to begin the consultation.
              </p>
            </motion.div>
          ) : (
            <>
              <FadeIn className="text-center">
                <p className="label-eyebrow">Begin</p>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal md:text-5xl">
                  Begin your commission.
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <form onSubmit={onSubmit} className="mt-12 space-y-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <FormField label="Full name" value={name} onChange={setName} placeholder={profile?.full_name ?? undefined} autoComplete="name" />
                    <FormField label="Email" value={email} onChange={setEmail} placeholder={user?.email ?? undefined} autoComplete="email" type="email" />
                    <SelectField label="Gemstone" value={gemstone} onChange={setGemstone} options={GEMSTONE_OPTIONS} />
                    <SelectField label="Metal" value={metal} onChange={setMetal} options={METAL_OPTIONS} />
                    <SelectField label="Budget" value={budget} onChange={setBudget} options={BUDGET_OPTIONS} />
                    <FormField label="Occasion" value={occasion} onChange={setOccasion} placeholder="Engagement, anniversary, heirloom…" />
                  </div>
                  <label className="block">
                    <span className="label-eyebrow">The piece you imagine</span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      required
                      placeholder="Describe the piece — its form, its feeling, who it is for. Links to inspiration are welcome."
                      className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 placeholder:text-charcoal-soft/50 focus:border-teal"
                    />
                  </label>
                  {error ? <p className="text-xs font-light leading-relaxed text-destructive">{error}</p> : null}
                  <div className="text-center">
                    <button type="submit" disabled={submitting} className="btn-outline-charcoal disabled:cursor-not-allowed disabled:opacity-60">
                      {submitting ? "Sending" : "Begin Your Commission"}
                    </button>
                  </div>
                </form>
              </FadeIn>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function FormField({
  label, value, onChange, placeholder, autoComplete, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-3 block w-full border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 placeholder:text-charcoal-soft/50 focus:border-teal"
      />
    </label>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 block w-full appearance-none border-b border-border bg-transparent py-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
