import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface CinematicVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** How eagerly to load. Hero = "metadata"; below-the-fold = "none" (default). */
  eager?: boolean;
  /** Optional overlay tone rendered over the video for legibility. */
  overlayClassName?: string;
  ariaLabel?: string;
  /** When true, video/poster is object-cover (default). */
  cover?: boolean;
  /** Slow subtle scale drift to make short loops feel seamless. */
  drift?: boolean;
  /** Optional inline style for the no-poster fallback layer (overrides default light gradient). */
  fallbackStyle?: React.CSSProperties;
}

/**
 * Editorial cinematic background video.
 * - Muted, looped, playsInline, no audio ever.
 * - Lazy-loads below the fold via IntersectionObserver.
 * - Respects prefers-reduced-motion (shows still poster instead).
 * - Fades in on `loadeddata`.
 */
export function CinematicVideo({
  src,
  poster,
  className = "",
  eager = false,
  overlayClassName,
  ariaLabel,
  cover = true,
  drift = true,
  fallbackStyle,
}: CinematicVideoProps) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(eager);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (eager || inView) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, inView]);

  const fit = cover ? "object-cover" : "object-contain";

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      aria-label={ariaLabel}
    >
      {/* Poster / still fallback layer — always underneath. */}
      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full ${fit}`}
          loading="lazy"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={
            fallbackStyle ?? {
              background:
                "linear-gradient(160deg, var(--color-sage-tint) 0%, var(--color-warm-white) 60%, var(--color-ivory) 100%)",
            }
          }
        />
      )}

      {!reduce && inView ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload={eager ? "metadata" : "none"}
          onLoadedData={() => setLoaded(true)}
          aria-hidden
          className={`absolute inset-0 h-full w-full ${fit} transition-opacity duration-[1400ms] ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          } ${drift ? "cinematic-drift" : ""}`}
        />
      ) : null}

      {overlayClassName ? (
        <div aria-hidden className={`absolute inset-0 ${overlayClassName}`} />
      ) : null}
    </div>
  );
}

export default CinematicVideo;
