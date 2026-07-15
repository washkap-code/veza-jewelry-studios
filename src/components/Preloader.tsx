import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const SESSION_KEY = "veza:preloader-shown";
const DURATION_MS = 2600;

export function Preloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = window.setTimeout(() => setVisible(false), DURATION_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="veza-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory"
          aria-hidden
        >
          <img
            src="/images/brand/veza-logo-reveal.gif"
            alt=""
            className="h-64 w-auto md:h-96"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Preloader;
