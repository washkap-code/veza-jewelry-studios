import { motion, useReducedMotion } from "framer-motion";
import { strokeDraw, LUXE_EASE } from "../lib/motion";

/**
 * VEZA logo — 2x2 grid of four geometric outlined glyphs above the wordmark.
 * Path data lives in GLYPHS so it can be swapped for a final asset later
 * without touching layout or animation code.
 */
export const GLYPHS: { id: string; paths: string[] }[] = [
  // Top-left: double chevron pointing DOWN
  {
    id: "chevron-down",
    paths: ["M8,20 L45,60 L82,20", "M24,20 L45,42 L66,20"],
  },
  // Top-right: double chevron pointing LEFT
  {
    id: "chevron-left",
    paths: ["M74,12 L30,45 L74,78", "M74,32 L52,45 L74,58"],
  },
  // Bottom-left: angular Z
  {
    id: "z-mark",
    paths: ["M12,16 H76 L14,74 H80"],
  },
  // Bottom-right: double chevron pointing UP (open bottom)
  {
    id: "chevron-up",
    paths: ["M12,76 L45,16 L78,76", "M28,76 L45,46 L62,76"],
  },
];

const CELL = 90;
const GAP = 18;
const GRID = CELL * 2 + GAP; // 198
const STROKE = 5.5;

type Variant = "mark" | "full" | "wordmark";

interface VezaLogoProps {
  variant?: Variant;
  className?: string;
  animate?: boolean;
  title?: string;
  /** override stroke width */
  strokeWidth?: number;
}

export function VezaLogo({
  variant = "full",
  className,
  animate = false,
  title = "VEZA",
  strokeWidth = STROKE,
}: VezaLogoProps) {
  const reduce = useReducedMotion();
  const shouldAnimate = animate && !reduce;

  const cells = GLYPHS.map((g, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col * (CELL + GAP);
    const y = row * (CELL + GAP);
    return { ...g, x, y, delay: i * 0.18 };
  });

  // Mark viewBox
  const markVB = `0 0 ${GRID} ${GRID}`;
  // Full viewBox includes wordmark row
  const wordmarkGap = 34;
  const wordmarkH = 46;
  const fullH = GRID + wordmarkGap + wordmarkH;
  const fullVB = `0 0 ${GRID} ${fullH}`;

  if (variant === "wordmark") {
    return (
      <svg
        viewBox="0 0 220 46"
        className={className}
        role="img"
        aria-label={title}
        fill="currentColor"
      >
        <title>{title}</title>
        <text
          x="110"
          y="34"
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontWeight={600}
          fontSize="32"
          letterSpacing="10"
        >
          VEZA
        </text>
      </svg>
    );
  }

  const Mark = (
    <g>
      {cells.map((c) =>
        c.paths.map((d, pIdx) => {
          const key = `${c.id}-${pIdx}`;
          const translated = translatePath(d, c.x, c.y);
          if (shouldAnimate) {
            return (
              <motion.path
                key={key}
                d={translated}
                variants={strokeDraw}
                custom={c.delay}
                transition={{
                  pathLength: { duration: 1.6, ease: LUXE_EASE, delay: c.delay + pIdx * 0.12 },
                  opacity: { duration: 0.4, delay: c.delay + pIdx * 0.12 },
                }}
                initial="hidden"
                animate="visible"
              />
            );
          }
          return <path key={key} d={translated} />;
        }),
      )}
    </g>
  );

  if (variant === "mark") {
    return (
      <svg
        viewBox={markVB}
        className={className}
        role="img"
        aria-label={title}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit={8}
      >
        <title>{title}</title>
        {Mark}
      </svg>
    );
  }

  // full
  return (
    <svg
      viewBox={fullVB}
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit={8}
    >
      <title>{title}</title>
      {Mark}
      <g transform={`translate(0, ${GRID + wordmarkGap})`}>
        <text
          x={GRID / 2}
          y={34}
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontWeight={600}
          fontSize="38"
          letterSpacing="12"
          fill="currentColor"
          stroke="none"
        >
          VEZA
        </text>
      </g>
    </svg>
  );
}

/** Simple path translator for our limited command set (M, L, H, V). */
function translatePath(d: string, dx: number, dy: number): string {
  return d.replace(
    /([MLHV])\s*([-\d.,\s]+)/gi,
    (_m, cmd: string, coords: string) => {
      const nums = coords.trim().split(/[,\s]+/).map(Number);
      if (cmd === "M" || cmd === "L") {
        const out: string[] = [];
        for (let i = 0; i < nums.length; i += 2) {
          out.push(`${nums[i] + dx},${nums[i + 1] + dy}`);
        }
        return `${cmd}${out.join(" ")}`;
      }
      if (cmd === "H") {
        return `H${nums.map((n) => n + dx).join(" ")}`;
      }
      if (cmd === "V") {
        return `V${nums.map((n) => n + dy).join(" ")}`;
      }
      return _m;
    },
  );
}

/** Single chevron glyph — useful as a motif/bullet/divider accent. */
export function ChevronGlyph({
  direction = "down",
  className,
  strokeWidth = 5.5,
  double = false,
}: {
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  strokeWidth?: number;
  double?: boolean;
}) {
  const map = {
    down: GLYPHS[0],
    left: GLYPHS[1],
    up: GLYPHS[3],
    right: GLYPHS[1], // reuse left, flipped via transform
  };
  const g = map[direction];
  const paths = double ? g.paths : g.paths.slice(0, 1);
  const flip = direction === "right" ? "scale(-1,1) translate(-90,0)" : undefined;

  return (
    <svg
      viewBox="0 0 90 90"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeMiterlimit={8}
      aria-hidden
    >
      <g transform={flip}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

export default VezaLogo;
