"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type PremiumSectionVariant = "hero" | "archive" | "experience" | "process" | "preserve" | "inquire";

type PremiumSectionMotionProps = {
  children: ReactNode;
  className?: string;
  variant: PremiumSectionVariant;
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 48,
    rotateX: 3,
    scale: 0.985,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.07,
    },
  },
} as const;

export function PremiumSectionMotion({
  children,
  className = "",
  variant,
}: PremiumSectionMotionProps) {
  return (
    <motion.div
      className={["premium-section-motion", `premium-section-motion-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      data-premium-motion={variant}
      initial="hidden"
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      variants={sectionVariants}
      viewport={{ once: true, margin: "-12%" }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}
