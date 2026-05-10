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

type ScrollChoreographyVariant = "hero" | "archive" | "standard" | "process" | "gallery" | "inquire";

type ScrollChoreographyProps = {
  children: ReactNode;
  className?: string;
  variant: ScrollChoreographyVariant;
};

type ChoreographyStyle = CSSProperties &
  Record<string, string | number | MotionValue<string> | MotionValue<number>>;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );

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
  const start = 0.1 + index * 0.04;
  const end = 0.3 + index * 0.04;
  const y = useTransform(progress, [start, end], isMobile ? ["48px", "0px"] : ["70px", "0px"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const scale = useTransform(progress, [start, end], isMobile ? [0.96, 1] : [0.94, 1]);

  return { y, opacity, scale };
}

function useProcessCardMotion(
  progress: MotionValue<number>,
  index: number,
  isMobile: boolean,
) {
  const starts = isMobile ? [-0.18, -0.04, 0.09, 0.22, 0.35] : [0.04, 0.16, 0.28, 0.4, 0.52];
  const start = starts[index] ?? 0.04 + index * 0.12;
  const end = start + (isMobile ? 0.14 : 0.18);
  const desktopX = ["-120px", "-24px", "0px", "72px", "128px"];
  const desktopY = ["32px", "86px", "18px", "74px", "38px"];
  const mobileY = ["42px", "46px", "38px", "44px", "40px"];
  const finalScale = !isMobile && index === 2 ? 1.055 : 1;

  return {
    x: useTransform(progress, [start, end], isMobile ? ["0px", "0px"] : [desktopX[index] ?? "0px", "0px"]),
    y: useTransform(progress, [start, end], isMobile ? [mobileY[index] ?? "42px", "0px"] : [desktopY[index] ?? "60px", "0px"]),
    opacity: useTransform(progress, [start, end], [0, 1]),
    scale: useTransform(progress, [start, end], [isMobile ? 0.94 : 0.92, finalScale]),
  };
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

  const heroY = useTransform(scrollYProgress, [0.44, 0.52], isMobile ? ["0px", "-28px"] : ["0px", "-70px"]);
  const heroScale = useTransform(scrollYProgress, [0.44, 0.52], isMobile ? [1, 0.98] : [1, 0.94]);
  const heroOpacity = useTransform(scrollYProgress, [0.44, 0.52], isMobile ? [1, 0.85] : [1, 0.72]);

  const mediaY = useTransform(scrollYProgress, [0.44, 0.56], isMobile ? ["28px", "0px"] : ["70px", "0px"]);
  const mediaScale = useTransform(scrollYProgress, [0.44, 0.56], isMobile ? [0.985, 1] : [0.94, 1]);
  const mediaOpacity = useTransform(scrollYProgress, [0.44, 0.56], isMobile ? [0.72, 1] : [0.35, 1]);

  const panelY = useTransform(scrollYProgress, [0, 0.45], isMobile ? ["28px", "0px"] : ["80px", "0px"]);
  const panelScale = useTransform(scrollYProgress, [0, 0.45], isMobile ? [0.985, 1] : [0.9, 1]);
  const panelOpacity = useTransform(scrollYProgress, [0, 0.45], isMobile ? [0.72, 1] : [0.4, 1]);

  const sectionY = useTransform(scrollYProgress, [0, 0.42], isMobile ? ["24px", "0px"] : ["52px", "0px"]);
  const titleY = useTransform(scrollYProgress, [0, 0.42, 0.82], isMobile ? ["24px", "0px", "0px"] : ["60px", "0px", "-20px"]);
  const rowX = useTransform(scrollYProgress, [0, 0.45], isMobile ? ["0px", "0px"] : ["60px", "0px"]);
  const leftX = useTransform(scrollYProgress, [0.08, 0.45], isMobile ? ["0px", "0px"] : ["-40px", "0px"]);
  const rightX = useTransform(scrollYProgress, [0.08, 0.45], isMobile ? ["0px", "0px"] : ["40px", "0px"]);
  const standardScale = useTransform(scrollYProgress, [0, 0.45], isMobile ? [0.985, 1] : [0.96, 1]);
  const standardOpacity = useTransform(scrollYProgress, [0, 0.45], isMobile ? [0.72, 1] : [0.45, 1]);
  const galleryScale = useTransform(scrollYProgress, [0, 0.48], isMobile ? [0.985, 1] : [0.94, 1]);
  const galleryCardX1 = useTransform(scrollYProgress, [0.14, 0.42], isMobile ? ["0px", "0px"] : ["-38px", "0px"]);
  const galleryCardX2 = useTransform(scrollYProgress, [0.2, 0.48], isMobile ? ["0px", "0px"] : ["24px", "0px"]);
  const galleryCardX3 = useTransform(scrollYProgress, [0.26, 0.54], isMobile ? ["0px", "0px"] : ["46px", "0px"]);

  const card0 = useStaggeredCardMotion(scrollYProgress, 0, isMobile);
  const card1 = useStaggeredCardMotion(scrollYProgress, 1, isMobile);
  const card2 = useStaggeredCardMotion(scrollYProgress, 2, isMobile);
  const card3 = useStaggeredCardMotion(scrollYProgress, 3, isMobile);
  const card4 = useStaggeredCardMotion(scrollYProgress, 4, isMobile);
  const card5 = useStaggeredCardMotion(scrollYProgress, 5, isMobile);
  const process0 = useProcessCardMotion(scrollYProgress, 0, isMobile);
  const process1 = useProcessCardMotion(scrollYProgress, 1, isMobile);
  const process2 = useProcessCardMotion(scrollYProgress, 2, isMobile);
  const process3 = useProcessCardMotion(scrollYProgress, 3, isMobile);
  const process4 = useProcessCardMotion(scrollYProgress, 4, isMobile);

  const reducedStyle: ChoreographyStyle = {
    "--scene-hero-y": "0px",
    "--scene-hero-scale": 1,
    "--scene-hero-opacity": 1,
    "--scene-media-y": "0px",
    "--scene-media-scale": 1,
    "--scene-media-opacity": 1,
    "--scene-panel-y": "0px",
    "--scene-panel-scale": 1,
    "--scene-panel-opacity": 1,
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
    "--process-card-x-0": "0px",
    "--process-card-x-1": "0px",
    "--process-card-x-2": "0px",
    "--process-card-x-3": "0px",
    "--process-card-x-4": "0px",
    "--process-card-y-0": "0px",
    "--process-card-y-1": "0px",
    "--process-card-y-2": "0px",
    "--process-card-y-3": "0px",
    "--process-card-y-4": "0px",
    "--process-card-opacity-0": 1,
    "--process-card-opacity-1": 1,
    "--process-card-opacity-2": 1,
    "--process-card-opacity-3": 1,
    "--process-card-opacity-4": 1,
    "--process-card-scale-0": 1,
    "--process-card-scale-1": 1,
    "--process-card-scale-2": 1,
    "--process-card-scale-3": 1,
    "--process-card-scale-4": 1,
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
        "--scene-panel-opacity": panelOpacity,
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
        "--process-card-x-0": process0.x,
        "--process-card-x-1": process1.x,
        "--process-card-x-2": process2.x,
        "--process-card-x-3": process3.x,
        "--process-card-x-4": process4.x,
        "--process-card-y-0": process0.y,
        "--process-card-y-1": process1.y,
        "--process-card-y-2": process2.y,
        "--process-card-y-3": process3.y,
        "--process-card-y-4": process4.y,
        "--process-card-opacity-0": process0.opacity,
        "--process-card-opacity-1": process1.opacity,
        "--process-card-opacity-2": process2.opacity,
        "--process-card-opacity-3": process3.opacity,
        "--process-card-opacity-4": process4.opacity,
        "--process-card-scale-0": process0.scale,
        "--process-card-scale-1": process1.scale,
        "--process-card-scale-2": process2.scale,
        "--process-card-scale-3": process3.scale,
        "--process-card-scale-4": process4.scale,
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
