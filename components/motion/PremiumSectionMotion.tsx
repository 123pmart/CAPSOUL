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

const reducedVars: MotionVars = {
  position: "relative",
  "--camera-scene-y": "0px",
  "--camera-scene-scale": 1,
  "--camera-scene-opacity": 1,
  "--camera-scene-dim": 0,
  "--camera-scene-haze": 0,
  "--camera-title-y": "0px",
  "--camera-title-scale": 1,
  "--camera-copy-y": "0px",
  "--camera-media-y": "0px",
  "--camera-media-scale": 1,
  "--camera-panel-left-x": "0px",
  "--camera-panel-right-x": "0px",
  "--camera-rail-x": "0px",
  "--camera-rail-scale": 1,
  "--camera-gallery-scale": 1,
  "--camera-archive-y": "0px",
  "--camera-archive-scale": 1,
  "--camera-foreground-lift": "0px",
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
  const isHero = variant === "hero";

  const sceneY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isHero
      ? isMobile ? ["0px", "0px", "-28px"] : ["0px", "-18px", "-94px"]
      : isMobile ? ["34px", "0px", "-28px"] : ["110px", "0px", "-86px"],
  );
  const sceneScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isHero
      ? isMobile ? [1, 1, 0.98] : [1, 0.986, 0.92]
      : isMobile ? [0.965, 1, 0.975] : [0.875, 1, 0.92],
  );
  const sceneOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.78, 1],
    isHero
      ? isMobile ? [1, 1, 1, 0.9] : [1, 1, 0.94, 0.82]
      : isMobile ? [0.82, 1, 1, 0.88] : [0.72, 1, 1, 0.82],
  );
  const sceneDim = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isHero
      ? isMobile ? [0, 0.02, 0.08] : [0, 0.06, 0.18]
      : isMobile ? [0.1, 0, 0.08] : [0.2, 0, 0.16],
  );
  const sceneHaze = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isHero
      ? isMobile ? [0.04, 0.06, 0.14] : [0.08, 0.12, 0.24]
      : isMobile ? [0.14, 0.02, 0.12] : [0.28, 0.04, 0.22],
  );
  const titleY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isHero
      ? isMobile ? ["0px", "0px", "-16px"] : ["0px", "-34px", "-72px"]
      : isMobile ? ["20px", "0px", "-12px"] : ["64px", "0px", "-38px"],
  );
  const titleScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isHero
      ? isMobile ? [1, 1, 0.985] : [1, 0.97, 0.94]
      : isMobile ? [0.985, 1, 0.99] : [0.94, 1, 0.965],
  );
  const copyY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isHero
      ? isMobile ? ["0px", "0px", "-10px"] : ["0px", "-22px", "-46px"]
      : isMobile ? ["12px", "0px", "-8px"] : ["28px", "0px", "-18px"],
  );
  const mediaY = useTransform(
    scrollYProgress,
    [0, 0.52, 1],
    isHero
      ? isMobile ? ["18px", "0px", "-10px"] : ["62px", "0px", "-42px"]
      : isMobile ? ["22px", "0px", "-12px"] : ["76px", "0px", "-38px"],
  );
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 0.52, 1],
    isHero
      ? isMobile ? [0.985, 1, 0.99] : [0.925, 1, 0.955]
      : isMobile ? [0.985, 1, 0.99] : [0.91, 1, 0.955],
  );
  const leftPanelX = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? ["0px", "0px", "0px"] : ["-72px", "0px", "28px"]);
  const rightPanelX = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? ["0px", "0px", "0px"] : ["72px", "0px", "-28px"]);
  const railX = useTransform(scrollYProgress, [0, 0.52, 1], isMobile ? ["0px", "0px", "0px"] : ["124px", "0px", "-48px"]);
  const railScale = useTransform(scrollYProgress, [0, 0.52, 1], isMobile ? [0.985, 1, 0.992] : [0.9, 1, 0.96]);
  const galleryScale = useTransform(scrollYProgress, [0, 0.52, 1], isMobile ? [0.985, 1, 0.992] : [0.88, 1, 0.95]);
  const archiveY = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? ["32px", "0px", "-20px"] : ["124px", "0px", "-56px"]);
  const archiveScale = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [0.97, 1, 0.985] : [0.86, 1, 0.94]);
  const foregroundLift = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? ["8px", "0px", "-8px"] : ["34px", "0px", "-24px"]);

  const style: MotionVars = prefersReducedMotion
    ? reducedVars
    : {
        position: "relative",
        "--camera-scene-y": sceneY,
        "--camera-scene-scale": sceneScale,
        "--camera-scene-opacity": sceneOpacity,
        "--camera-scene-dim": sceneDim,
        "--camera-scene-haze": sceneHaze,
        "--camera-title-y": titleY,
        "--camera-title-scale": titleScale,
        "--camera-copy-y": copyY,
        "--camera-media-y": mediaY,
        "--camera-media-scale": mediaScale,
        "--camera-panel-left-x": leftPanelX,
        "--camera-panel-right-x": rightPanelX,
        "--camera-rail-x": railX,
        "--camera-rail-scale": railScale,
        "--camera-gallery-scale": galleryScale,
        "--camera-archive-y": archiveY,
        "--camera-archive-scale": archiveScale,
        "--camera-foreground-lift": foregroundLift,
      };

  return (
    <motion.div
      ref={ref}
      className={["premium-section-motion", `premium-section-motion-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      data-premium-motion={variant}
      data-camera-scene={variant}
      style={style}
    >
      {children}
    </motion.div>
  );
}
