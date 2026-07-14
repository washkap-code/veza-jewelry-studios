import { FadeIn } from "./FadeIn";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function PageHeader({ eyebrow, title, description, align = "center" }: PageHeaderProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <section className="border-b border-border/60 bg-warm-white">
      <div className={`mx-auto flex max-w-4xl flex-col ${alignment} px-6 py-24 md:py-32`}>
        <FadeIn>
          {eyebrow ? <p className="label-eyebrow mb-6">{eyebrow}</p> : null}
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
              {description}
            </p>
          ) : null}
        </FadeIn>
      </div>
    </section>
  );
}

export default PageHeader;
