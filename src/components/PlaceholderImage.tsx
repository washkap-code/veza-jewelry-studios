import { VezaLogo } from "./VezaLogo";

interface PlaceholderImageProps {
  className?: string;
  aspectClassName?: string;
  tone?: string;
  glyphClassName?: string;
}

/**
 * Editorial placeholder block used until real photography is uploaded.
 * Sage/ivory gradient with a low-opacity VEZA glyph mark.
 */
export function PlaceholderImage({
  className = "",
  aspectClassName = "aspect-[4/5]",
  tone,
  glyphClassName = "h-1/3 w-1/3 text-teal",
}: PlaceholderImageProps) {
  const bg = tone
    ? `radial-gradient(circle at 40% 40%, ${tone} 0%, var(--color-warm-white) 85%)`
    : "linear-gradient(140deg, var(--color-sage-tint) 0%, var(--color-warm-white) 60%, var(--color-ivory) 100%)";
  return (
    <div
      className={`${aspectClassName} relative w-full overflow-hidden ${className}`}
      style={{ background: bg }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14]">
        <VezaLogo variant="mark" className={glyphClassName} />
      </div>
    </div>
  );
}

export default PlaceholderImage;
