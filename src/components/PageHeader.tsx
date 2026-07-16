import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { VezaLogo, ChevronGlyph } from "./VezaLogo";
import { CinematicVideo } from "./CinematicVideo";
import { LUXE_EASE } from "../lib/motion";

type Backdrop =
  | { kind: "wash" }
  | { kind: "mark" }
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster?: string; ariaLabel?: string };

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** editorial = tall cinematic block; compact = utility pages (contact/cart). */
  variant?: "editorial" | "compact";
  backdrop?: Backdrop;
}

/**
 * Editorial page header. Renders a quiet brand-toned backdrop, an animated
 * gold hairline under the title, and (for editorial variant) a small scroll
 * cue at the bottom that smooth-scrolls to the section below. Always keeps
 * charcoal text on a light-enough surface for legibility.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  align = "center",
  variant = "editorial",
  backdrop = { kind: "wash" },
}: PageHeaderProps) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const alignment =
    align === "center" ? "text-center items-center" : "text-left items-start";

  const heightClass =
    variant === "editorial"
      ? "min-h-[60vh] py-24 md:min-h-[65vh] md:py-32"
      : "min-h-[36vh] py-20 md:min-h-[40vh] md:py-24";

  const onScrollCue = () => {
    const el = sectionRef.current;
    if (!el) return;
    const bottom = el.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: bottom - 8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden border-b border-border/60 bg-warm-white ${heightClass}`}
    >
      {/* Backdrop layer — always underneath, always light enough for charcoal text. */}
      <Backdrop backdrop={backdrop} />

      <div
        className={`relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col justify-center ${alignment} px-6`}
      >
        <FadeIn>
          {eyebrow ? <p className="label-eyebrow mb-6">{eyebrow}</p> : null}
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-charcoal md:text-7xl">
            {title}
          </h1>
          {/* Animated gold hairline that draws in under the title. */}
          <motion.span
            aria-hidden
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              duration: reduce ? 0 : 1.2,
              delay: reduce ? 0 : 0.5,
              ease: LUXE_EASE,
            }}
            className={`mt-10 block h-px w-16 bg-gold ${
              align === "center" ? "origin-center mx-auto" : "origin-left"
            }`}
          />
          {description ? (
            <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-charcoal-soft md:text-lg">
              {description}
            </p>
          ) : null}
        </FadeIn>
      </div>

      {variant === "editorial" ? (
        <motion.button
          type="button"
          onClick={onScrollCue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : 0.9,
            delay: reduce ? 0 : 1.2,
            ease: LUXE_EASE,
          }}
          aria-label="Scroll to content"
          className="group absolute bottom-6 left-1/2 z-10 -translate-x-1/2 cursor-pointer border-0 bg-transparent p-2"
        >
          <span className="flex flex-col items-center gap-2 text-charcoal-soft transition-colors duration-500 group-hover:text-charcoal">
            <span className="label-eyebrow" style={{ letterSpacing: "0.32em" }}>
              Scroll
            </span>
            <ChevronGlyph
              direction="down"
              className="h-3 w-3 text-gold"
              strokeWidth={6}
            />
          </span>
        </motion.button>
      ) : null}
    </section>
  );
}

/** Backdrop layer — resolved per variant. */
function Backdrop({ backdrop }: { backdrop: Backdrop }) {
  if (backdrop.kind === "wash") {
    // Soft sage-tint → warm-white → ivory wash, with an oversized VEZA mark
    // cropped at the right edge at very low opacity.
    return (
      <>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sage-tint) 0%, var(--color-warm-white) 55%, var(--color-ivory) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-16 hidden md:block"
          style={{ color: "var(--color-teal)", opacity: 0.07 }}
        >
          <VezaLogo variant="mark" className="h-[70vh] w-[70vh]" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-10 block md:hidden"
          style={{ color: "var(--color-teal)", opacity: 0.08 }}
        >
          <VezaLogo variant="mark" className="h-[46vh] w-[46vh]" />
        </div>
      </>
    );
  }

  if (backdrop.kind === "mark") {
    // Warm-white base with an oversized gold chevron cropped bottom-left.
    return (
      <>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, var(--color-warm-white) 0%, var(--color-ivory) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -bottom-16 hidden md:block"
          style={{ color: "var(--color-gold)", opacity: 0.09 }}
        >
          <ChevronGlyph direction="up" className="h-[60vh] w-[60vh]" strokeWidth={4} double />
        </div>
      </>
    );
  }

  if (backdrop.kind === "image") {
    return (
      <>
        <img
          src={backdrop.src}
          alt={backdrop.alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* Ivory duotone veil so charcoal text remains legible. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(247,245,240,0.86) 0%, rgba(247,245,240,0.78) 60%, rgba(247,245,240,0.92) 100%)",
          }}
        />
      </>
    );
  }

  // video
  return (
    <>
      <div className="absolute inset-0">
        <CinematicVideo
          src={backdrop.src}
          poster={backdrop.poster}
          eager={false}
          className="h-full w-full"
          ariaLabel={backdrop.ariaLabel}
          fallbackStyle={{
            background:
              "linear-gradient(135deg, var(--color-sage-tint) 0%, var(--color-warm-white) 55%, var(--color-ivory) 100%)",
          }}
        />
      </div>
      {/* Ivory veil to preserve contrast for charcoal text. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,245,240,0.72) 0%, rgba(247,245,240,0.55) 55%, rgba(247,245,240,0.88) 100%)",
        }}
      />
      {/* Oversized teal chevron mark (above the veil) for brand presence. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-16 hidden md:block"
        style={{ color: "var(--color-teal)", opacity: 0.09 }}
      >
        <VezaLogo variant="mark" className="h-[68vh] w-[68vh]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-8 block md:hidden"
        style={{ color: "var(--color-teal)", opacity: 0.1 }}
      >
        <VezaLogo variant="mark" className="h-[42vh] w-[42vh]" />
      </div>
    </>
  );
}

export default PageHeader;
