"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function EditorialBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0px", "0px"] : ["0px", "-56px"]);

  return (
    <motion.div
      aria-hidden="true"
      className="editorial-backdrop"
      style={{ y }}
    >
      <div className="editorial-backdrop-sheet editorial-backdrop-sheet-one">
        <span className="editorial-backdrop-headline">Archive</span>
        <span className="editorial-backdrop-rule" />
        <span className="editorial-backdrop-columns" />
      </div>
      <div className="editorial-backdrop-sheet editorial-backdrop-sheet-two">
        <span className="editorial-backdrop-headline">Memory</span>
        <span className="editorial-backdrop-rule" />
        <span className="editorial-backdrop-columns" />
      </div>
      <div className="editorial-backdrop-sheet editorial-backdrop-sheet-three">
        <span className="editorial-backdrop-headline">Presence</span>
        <span className="editorial-backdrop-rule" />
        <span className="editorial-backdrop-columns" />
      </div>
    </motion.div>
  );
}
