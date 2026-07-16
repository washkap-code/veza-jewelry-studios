import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { VezaLogo } from "./VezaLogo";

export function AuthLoader({
  minHeight = "60vh",
  showHomeLink = false,
  tone = "light",
}: {
  minHeight?: string;
  showHomeLink?: boolean;
  tone?: "light" | "dark";
}) {
  const reduce = useReducedMotion();
  const linkTone =
    tone === "dark"
      ? "text-ivory/50 hover:text-gold"
      : "text-charcoal-soft/70 hover:text-teal";
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-10"
      style={{ minHeight }}
      role="status"
      aria-label="Loading"
    >
      <motion.div
        initial={{ opacity: 0.35 }}
        animate={reduce ? { opacity: 0.6 } : { opacity: [0.35, 0.85, 0.35] }}
        transition={{
          duration: 2.4,
          repeat: reduce ? 0 : Infinity,
          ease: [0.22, 0.61, 0.36, 1],
        }}
      >
        <VezaLogo variant="mark" className={`h-10 w-10 ${tone === "dark" ? "text-gold" : "text-teal"}`} />
      </motion.div>
      {showHomeLink ? (
        <Link
          to="/"
          className={`text-[0.62rem] font-light uppercase tracking-[0.28em] transition-colors duration-500 ${linkTone}`}
        >
          ← Return home
        </Link>
      ) : null}
    </div>
  );
}

export default AuthLoader;
