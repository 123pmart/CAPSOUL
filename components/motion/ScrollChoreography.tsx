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

type ScrollChoreographyVariant = "hero" | "archive" | "standard" | "gallery" | "inquire";

type ScrollChoreographyProps = {
  children: ReactNode;
  className?: string;
  variant: ScrollChoreographyVariant;
};

type ChoreographyStyle = CSSProperties &
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

function useStaggeredCardMotion(
  progress: MotionValue<number>,
  index: number,
  isMobile: boolean,
) {
  const start = isMobile ? 0.05 + index * 0.07 : 0.06 + index * 0.05;
  const end = isMobile ? start + 0.22 : 0.24 + index * 0.06;
  const y = useTransform(progress, [start, end], isMobile ? ["58px", "0px"] : ["112px", "0px"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const scale = useTransform(progress, [start, end], isMobile ? [0.94, 1] : [0.9, 1]);

  return { y, opacity, scale };
}

export function ScrollChoreography({
  children,
  className = "",
  variant,
}: ScrollChoreographyProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0.36, 0.62], isMobile ? ["0px", "-42px"] : ["0px", "-104px"]);
  const heroScale = useTransform(scrollYProgress, [0.36, 0.62], isMobile ? [1, 0.965] : [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0.36, 0.62], isMobile ? [1, 0.82] : [1, 0.58]);

  const mediaY = useTransform(scrollYProgress, [0.22, 0.58], isMobile ? ["54px", "0px"] : ["132px", "0px"]);
  const mediaScale = useTransform(scrollYProgress, [0.22, 0.58], isMobile ? [0.96, 1] : [0.86, 1]);
  const mediaOpacity = useTransform(scrollYProgress, [0.22, 0.58], isMobile ? [0.5, 1] : [0.12, 1]);

  const panelY = useTransform(scrollYProgress, [0, 0.5], isMobile ? ["42px", "0px"] : ["112px", "0px"]);
  const panelScale = useTransform(scrollYProgress, [0, 0.5], isMobile ? [0.965, 1] : [0.88, 1]);

  const sectionY = useTransform(scrollYProgress, [0, 0.46], isMobile ? ["42px", "0px"] : ["92px", "0px"]);
  const titleY = useTransform(scrollYProgress, [0, 0.42, 0.84], isMobile ? ["38px", "0px", "0px"] : ["96px", "0px", "-34px"]);
  const rowX = useTransform(scrollYProgress, [0, 0.48], isMobile ? ["36px", "0px"] : ["124px", "0px"]);
  const leftX = useTransform(scrollYProgress, [0.06, 0.5], isMobile ? ["-22px", "0px"] : ["-96px", "0px"]);
  const rightX = useTransform(scrollYProgress, [0.06, 0.5], isMobile ? ["22px", "0px"] : ["96px", "0px"]);
  const standardScale = useTransform(scrollYProgress, [0, 0.48], isMobile ? [0.965, 1] : [0.9, 1]);
  const standardOpacity = useTransform(scrollYProgress, [0, 0.48], isMobile ? [0.52, 1] : [0.18, 1]);
  const galleryScale = useTransform(scrollYProgress, [0, 0.5], isMobile ? [0.96, 1] : [0.88, 1]);
  const galleryCardX1 = useTransform(scrollYProgress, [0.1, 0.44], isMobile ? ["0px", "0px"] : ["-92px", "0px"]);
  const galleryCardX2 = useTransform(scrollYProgress, [0.18, 0.52], isMobile ? ["0px", "0px"] : ["58px", "0px"]);
  const galleryCardX3 = useTransform(scrollYProgress, [0.26, 0.6], isMobile ? ["0px", "0px"] : ["102px", "0px"]);

  const card0 = useStaggeredCardMotion(scrollYProgress, 0, isMobile);
  const card1 = useStaggeredCardMotion(scrollYProgress, 1, isMobile);
  const card2 = useStaggeredCardMotion(scrollYProgress, 2, isMobile);
  const card3 = useStaggeredCardMotion(scrollYProgress, 3, isMobile);
  const card4 = useStaggeredCardMotion(scrollYProgress, 4, isMobile);
  const card5 = useStaggeredCardMotion(scrollYProgress, 5, isMobile);
  const reducedStyle: ChoreographyStyle = {
    "--scene-hero-y": "0px",
    "--scene-hero-scale": 1,
    "--scene-hero-opacity": 1,
    "--scene-media-y": "0px",
    "--scene-media-scale": 1,
    "--scene-media-opacity": 1,
    "--scene-panel-y": "0px",
    "--scene-panel-scale": 1,
    "--scene-section-y": "0px",
    "--scene-title-y": "0px",
    "--scene-row-x": "0px",
    "--scene-left-x": "0px",
    "--scene-right-x": "0px",
    "--scene-standard-scale": 1,
    "--scene-standard-opacity": 1,
    "--scene-gallery-scale": 1,
    "--scene-card-y-0": "0px",
    "--scene-card-y-1": "0px",
    "--scene-card-y-2": "0px",
    "--scene-card-y-3": "0px",
    "--scene-card-y-4": "0px",
    "--scene-card-y-5": "0px",
    "--scene-card-opacity-0": 1,
    "--scene-card-opacity-1": 1,
    "--scene-card-opacity-2": 1,
    "--scene-card-opacity-3": 1,
    "--scene-card-opacity-4": 1,
    "--scene-card-opacity-5": 1,
    "--scene-card-scale-0": 1,
    "--scene-card-scale-1": 1,
    "--scene-card-scale-2": 1,
    "--scene-card-scale-3": 1,
    "--scene-card-scale-4": 1,
    "--scene-card-scale-5": 1,
    "--gallery-card-x-1": "0px",
    "--gallery-card-x-2": "0px",
    "--gallery-card-x-3": "0px",
  };

  const style: ChoreographyStyle = prefersReducedMotion
    ? reducedStyle
    : {
        "--scene-hero-y": heroY,
        "--scene-hero-scale": heroScale,
        "--scene-hero-opacity": heroOpacity,
        "--scene-media-y": mediaY,
        "--scene-media-scale": mediaScale,
        "--scene-media-opacity": mediaOpacity,
        "--scene-panel-y": panelY,
        "--scene-panel-scale": panelScale,
        "--scene-section-y": sectionY,
        "--scene-title-y": titleY,
        "--scene-row-x": rowX,
        "--scene-left-x": leftX,
        "--scene-right-x": rightX,
        "--scene-standard-scale": standardScale,
        "--scene-standard-opacity": standardOpacity,
        "--scene-gallery-scale": galleryScale,
        "--scene-card-y-0": card0.y,
        "--scene-card-y-1": card1.y,
        "--scene-card-y-2": card2.y,
        "--scene-card-y-3": card3.y,
        "--scene-card-y-4": card4.y,
        "--scene-card-y-5": card5.y,
        "--scene-card-opacity-0": card0.opacity,
        "--scene-card-opacity-1": card1.opacity,
        "--scene-card-opacity-2": card2.opacity,
        "--scene-card-opacity-3": card3.opacity,
        "--scene-card-opacity-4": card4.opacity,
        "--scene-card-opacity-5": card5.opacity,
        "--scene-card-scale-0": card0.scale,
        "--scene-card-scale-1": card1.scale,
        "--scene-card-scale-2": card2.scale,
        "--scene-card-scale-3": card3.scale,
        "--scene-card-scale-4": card4.scale,
        "--scene-card-scale-5": card5.scale,
        "--gallery-card-x-1": galleryCardX1,
        "--gallery-card-x-2": galleryCardX2,
        "--gallery-card-x-3": galleryCardX3,
      };

  return (
    <motion.div
      className={["scroll-choreography", `scroll-choreography-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      data-scroll-choreography={variant}
      ref={ref}
      style={style}
    >
      <div className="scroll-choreography-stage">
        {children}
      </div>
    </motion.div>
  );
}
