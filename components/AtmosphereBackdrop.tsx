"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AtmosphereBackdrop() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="atmosphere-backdrop"
    >
      <span className="atmosphere-layer atmosphere-layer-frost" />
      <span className="atmosphere-layer atmosphere-layer-mineral" />
      <span className="atmosphere-layer atmosphere-layer-vignette" />
      <motion.span
        className="atmosphere-layer atmosphere-layer-ambient"
        animate={prefersReducedMotion ? undefined : {
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          opacity: [0.55, 0.72, 0.55],
        }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="atmosphere-orb atmosphere-orb-1"
        animate={prefersReducedMotion ? undefined : {
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.12, 0.94, 1],
          opacity: [0.18, 0.28, 0.14, 0.18],
        }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="atmosphere-orb atmosphere-orb-2"
        animate={prefersReducedMotion ? undefined : {
          x: [0, -50, 30, 0],
          y: [0, 40, -25, 0],
          scale: [1, 0.88, 1.08, 1],
          opacity: [0.12, 0.22, 0.1, 0.12],
        }}
        transition={{ duration: 28, ease: "easeInOut", repeat: Infinity, delay: 4 }}
      />
      <motion.div
        className="atmosphere-orb atmosphere-orb-3"
        animate={prefersReducedMotion ? undefined : {
          x: [0, 25, -35, 0],
          y: [0, -20, 35, 0],
          opacity: [0.08, 0.16, 0.06, 0.08],
        }}
        transition={{ duration: 34, ease: "easeInOut", repeat: Infinity, delay: 8 }}
      />
    </div>
  );
}
