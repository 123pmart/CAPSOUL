"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type PremiumSectionVariant = "hero" | "archive" | "experience" | "process" | "preserve" | "inquire";

type PremiumSectionMotionProps = {
  children: ReactNode;
  className?: string;
  variant: PremiumSectionVariant;
};

type MotionVars = CSSProperties &
  Record<string, string | number | MotionValue<string> | MotionValue<number>>;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function useCardVars(progress: MotionValue<number>, index: number, isMobile: boolean) {
  const start = isMobile ? 0.06 + index * 0.065 : 0.06 + index * 0.085;
  const end = isMobile ? start + 0.24 : start + 0.28;
  const y = useTransform(progress, [start, end], isMobile ? ["34px", "0px"] : ["72px", "0px"]);
  const opacity = useTransform(progress, [start, end], [0.04, 1]);
  const scale = useTransform(progress, [start, end], isMobile ? [0.975, 1] : [0.92, 1]);

  return { y, opacity, scale };
}

const reducedVars: MotionVars = {
  position: "relative",
  "--pm-section-y": "0px",
  "--pm-section-opacity": 1,
  "--pm-section-scale": 1,
  "--pm-title-y": "0px",
  "--pm-title-opacity": 1,
  "--pm-hero-y": "0px",
  "--pm-hero-opacity": 1,
  "--pm-hero-scale": 1,
  "--pm-media-y": "0px",
  "--pm-media-opacity": 1,
  "--pm-media-scale": 1,
  "--pm-left-x": "0px",
  "--pm-right-x": "0px",
  "--pm-row-x": "0px",
  "--pm-archive-y": "0px",
  "--pm-archive-opacity": 1,
  "--pm-archive-scale": 1,
  "--pm-gallery-scale": 1,
  "--pm-card-x-0": "0px",
  "--pm-card-x-1": "0px",
  "--pm-card-x-2": "0px",
  "--pm-card-x-3": "0px",
  "--pm-card-x-4": "0px",
  "--pm-card-y-0": "0px",
  "--pm-card-y-1": "0px",
  "--pm-card-y-2": "0px",
  "--pm-card-y-3": "0px",
  "--pm-card-y-4": "0px",
  "--pm-card-opacity-0": 1,
  "--pm-card-opacity-1": 1,
  "--pm-card-opacity-2": 1,
  "--pm-card-opacity-3": 1,
  "--pm-card-opacity-4": 1,
  "--pm-card-scale-0": 1,
  "--pm-card-scale-1": 1,
  "--pm-card-scale-2": 1,
  "--pm-card-scale-3": 1,
  "--pm-card-scale-4": 1,
};

export function PremiumSectionMotion({
  children,
  className = "",
  variant,
}: PremiumSectionMotionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const sectionY = useTransform(scrollYProgress, [0, 0.4], isMobile ? ["34px", "0px"] : ["76px", "0px"]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.34], [0.12, 1]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.42], isMobile ? [0.985, 1] : [0.94, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.38], isMobile ? ["26px", "0px"] : ["56px", "0px"]);

  const heroY = useTransform(scrollYProgress, [0.34, 0.74], isMobile ? ["0px", "0px"] : ["0px", "-46px"]);
  const heroOpacity = useTransform(scrollYProgress, [0.34, 0.74], isMobile ? [1, 1] : [1, 0.92]);
  const heroScale = useTransform(scrollYProgress, [0.34, 0.74], isMobile ? [1, 1] : [1, 0.972]);
  const mediaY = useTransform(scrollYProgress, [0.06, 0.44], isMobile ? ["38px", "0px"] : ["82px", "0px"]);
  const mediaOpacity = useTransform(scrollYProgress, [0.06, 0.38], [0.12, 1]);
  const mediaScale = useTransform(scrollYProgress, [0.06, 0.44], isMobile ? [0.98, 1] : [0.94, 1]);

  const archiveY = useTransform(scrollYProgress, [0, 0.44], isMobile ? ["38px", "0px"] : ["92px", "0px"]);
  const archiveOpacity = useTransform(scrollYProgress, [0, 0.36], [0.18, 1]);
  const archiveScale = useTransform(scrollYProgress, [0, 0.44], isMobile ? [0.98, 1] : [0.91, 1]);

  const leftX = useTransform(scrollYProgress, [0.06, 0.42], isMobile ? ["0px", "0px"] : ["-64px", "0px"]);
  const rightX = useTransform(scrollYProgress, [0.06, 0.42], isMobile ? ["0px", "0px"] : ["64px", "0px"]);
  const rowX = useTransform(scrollYProgress, [0.04, 0.42], isMobile ? ["0px", "0px"] : ["72px", "0px"]);
  const galleryScale = useTransform(scrollYProgress, [0.06, 0.42], isMobile ? [0.98, 1] : [0.92, 1]);

  const card0 = useCardVars(scrollYProgress, 0, isMobile);
  const card1 = useCardVars(scrollYProgress, 1, isMobile);
  const card2 = useCardVars(scrollYProgress, 2, isMobile);
  const card3 = useCardVars(scrollYProgress, 3, isMobile);
  const card4 = useCardVars(scrollYProgress, 4, isMobile);

  const cardX0 = useTransform(scrollYProgress, [0.08, 0.36], isMobile ? ["0px", "0px"] : ["-86px", "0px"]);
  const cardX1 = useTransform(scrollYProgress, [0.15, 0.39], ["0px", "0px"]);
  const cardX2 = useTransform(scrollYProgress, [0.22, 0.46], ["0px", "0px"]);
  const cardX3 = useTransform(scrollYProgress, [0.29, 0.57], isMobile ? ["0px", "0px"] : ["44px", "0px"]);
  const cardX4 = useTransform(scrollYProgress, [0.36, 0.64], isMobile ? ["0px", "0px"] : ["86px", "0px"]);

  const style: MotionVars = prefersReducedMotion
    ? reducedVars
    : {
        position: "relative",
        "--pm-section-y": sectionY,
        "--pm-section-opacity": sectionOpacity,
        "--pm-section-scale": sectionScale,
        "--pm-title-y": titleY,
        "--pm-title-opacity": 1,
        "--pm-hero-y": heroY,
        "--pm-hero-opacity": heroOpacity,
        "--pm-hero-scale": heroScale,
        "--pm-media-y": mediaY,
        "--pm-media-opacity": mediaOpacity,
        "--pm-media-scale": mediaScale,
        "--pm-left-x": leftX,
        "--pm-right-x": rightX,
        "--pm-row-x": rowX,
        "--pm-archive-y": archiveY,
        "--pm-archive-opacity": archiveOpacity,
        "--pm-archive-scale": archiveScale,
        "--pm-gallery-scale": galleryScale,
        "--pm-card-x-0": cardX0,
        "--pm-card-x-1": cardX1,
        "--pm-card-x-2": cardX2,
        "--pm-card-x-3": cardX3,
        "--pm-card-x-4": cardX4,
        "--pm-card-y-0": card0.y,
        "--pm-card-y-1": card1.y,
        "--pm-card-y-2": card2.y,
        "--pm-card-y-3": card3.y,
        "--pm-card-y-4": card4.y,
        "--pm-card-opacity-0": card0.opacity,
        "--pm-card-opacity-1": card1.opacity,
        "--pm-card-opacity-2": card2.opacity,
        "--pm-card-opacity-3": card3.opacity,
        "--pm-card-opacity-4": card4.opacity,
        "--pm-card-scale-0": card0.scale,
        "--pm-card-scale-1": card1.scale,
        "--pm-card-scale-2": card2.scale,
        "--pm-card-scale-3": card3.scale,
        "--pm-card-scale-4": card4.scale,
      };

  return (
    <motion.div
      ref={ref}
      className={["premium-section-motion", `premium-section-motion-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      data-premium-motion={variant}
      style={style}
    >
      {children}
    </motion.div>
  );
}
