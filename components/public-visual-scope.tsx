"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";

function AmbientBackground() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const bloomOneY = useTransform(scrollYProgress, [0, 1], ["0vh", "-7vh"]);
  const bloomTwoY = useTransform(scrollYProgress, [0, 1], ["0vh", "5vh"]);
  const bloomThreeX = useTransform(scrollYProgress, [0, 1], ["0vw", "5vw"]);
  const bloomThreeY = useTransform(scrollYProgress, [0, 1], ["0vh", "-4vh"]);

  const ambientTransition = {
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className="ambient-background" aria-hidden="true">
      <motion.span
        className="ambient-blob ambient-blob-one"
        style={reduceMotion ? undefined : { y: bloomOneY }}
        animate={reduceMotion ? undefined : {
          opacity: [0.3, 0.5, 0.34],
          scale: [1, 1.08, 1.02],
          x: ["0%", "4%", "-2%"],
        }}
        transition={{ ...ambientTransition, duration: 24 }}
      />
      <motion.span
        className="ambient-blob ambient-blob-two"
        style={reduceMotion ? undefined : { y: bloomTwoY }}
        animate={reduceMotion ? undefined : {
          opacity: [0.24, 0.44, 0.3],
          scale: [1.02, 0.96, 1.08],
          x: ["0%", "-4%", "3%"],
        }}
        transition={{ ...ambientTransition, duration: 29 }}
      />
      <motion.span
        className="ambient-blob ambient-blob-three"
        style={reduceMotion ? undefined : { x: bloomThreeX, y: bloomThreeY }}
        animate={reduceMotion ? undefined : {
          opacity: [0.18, 0.36, 0.22],
          scale: [0.96, 1.05, 1],
        }}
        transition={{ ...ambientTransition, duration: 32 }}
      />
    </div>
  );
}

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <div className="admin-visual-scope">{children}</div>;
  }

  return (
    <div className="public-visual-scope">
      <div className="film-grain" aria-hidden="true" />
      <AmbientBackground />
      {children}
    </div>
  );
}
