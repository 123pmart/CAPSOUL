"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function AtmosphereBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const ambientY = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : -60]);
  const frostY = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : -30]);
  const mineralY = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : -15]);

  return (
    <div
      aria-hidden="true"
      className="atmosphere-backdrop"
    >
      <motion.span className="atmosphere-layer atmosphere-layer-ambient" style={{ y: ambientY }} />
      <motion.span className="atmosphere-layer atmosphere-layer-frost" style={{ y: frostY }} />
      <motion.span className="atmosphere-layer atmosphere-layer-mineral" style={{ y: mineralY }} />
      <span className="atmosphere-layer atmosphere-layer-grain" />
      <span className="atmosphere-layer atmosphere-layer-vignette" />
    </div>
  );
}
