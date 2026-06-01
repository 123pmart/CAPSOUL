"use client";

import type { ReactNode } from "react";

type PremiumSectionVariant = "hero" | "archive" | "experience" | "process" | "preserve" | "inquire";

type PremiumSectionMotionProps = {
  children: ReactNode;
  className?: string;
  variant: PremiumSectionVariant;
};

export function PremiumSectionMotion({
  children,
  className = "",
  variant,
}: PremiumSectionMotionProps) {
  return (
    <div
      className={["premium-section-motion", `premium-section-motion-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      data-premium-motion={variant}
    >
      {children}
    </div>
  );
}
