"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function AtmosphereBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0px", "0px"] : ["0px", "-34px"]);

  return (
    <motion.div
      aria-hidden="true"
      className="atmosphere-backdrop"
      style={{ y }}
    >
      <span className="atmosphere-bloom atmosphere-bloom-one" />
      <span className="atmosphere-bloom atmosphere-bloom-two" />
      <span className="atmosphere-bloom atmosphere-bloom-three" />
    </motion.div>
  );
}
