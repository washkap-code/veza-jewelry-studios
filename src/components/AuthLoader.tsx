import { motion, useReducedMotion } from "framer-motion";
import { VezaLogo } from "./VezaLogo";

export function AuthLoader({ minHeight = "60vh" }: { minHeight?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      className="flex w-full items-center justify-center"
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
        <VezaLogo variant="mark" className="h-10 w-10 text-teal" />
      </motion.div>
    </div>
  );
}

export default AuthLoader;
