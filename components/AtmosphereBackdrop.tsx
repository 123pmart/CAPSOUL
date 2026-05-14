"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function AtmosphereBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0px", "0px"] : ["0px", "-58px"]);
  const x = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0px", "0px"] : ["0px", "18px"]);

  return (
    <motion.div
      aria-hidden="true"
      className="atmosphere-backdrop"
      style={{ x, y }}
    >
      <span className="atmosphere-bloom atmosphere-bloom-one" />
      <span className="atmosphere-bloom atmosphere-bloom-two" />
      <span className="atmosphere-bloom atmosphere-bloom-three" />
      <span className="atmosphere-panel atmosphere-panel-one" />
      <span className="atmosphere-panel atmosphere-panel-two" />
      <span className="atmosphere-panel atmosphere-panel-three" />
      <span className="atmosphere-sweep atmosphere-sweep-one" />
    </motion.div>
  );
}
