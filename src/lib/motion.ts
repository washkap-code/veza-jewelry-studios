import type { Variants, Transition } from "framer-motion";

export const LUXE_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export const baseTransition: Transition = {
  duration: 1,
  ease: LUXE_EASE,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: LUXE_EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const strokeDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.6, ease: LUXE_EASE },
      opacity: { duration: 0.4, ease: "linear" },
    },
  },
};

export const slowScaleHover = {
  initial: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 1.2, ease: LUXE_EASE } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: LUXE_EASE } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: LUXE_EASE } },
};

export const viewportOnce = { once: true, margin: "-80px" } as const;
