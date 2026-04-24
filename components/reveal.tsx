"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  cardRevealTransition,
  heroRevealTransition,
  microRevealTransition,
  premiumEase,
  scrollDepthSpring,
  sectionRevealTransition,
} from "@/components/motion-config";
import { useResponsiveSceneMode } from "@/components/use-compact-viewport";

type RevealVariant = "section" | "card" | "hero" | "media" | "micro";
type MarginValue = `${number}px ${number}px ${number}px ${number}px`;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  blur?: number;
  variant?: RevealVariant;
  once?: boolean;
  amount?: number;
  margin?: MarginValue;
};

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
  margin?: MarginValue;
  once?: boolean;
};

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  blur?: number;
  variant?: RevealVariant;
};

type ScrollPlaneProps = {
  children: ReactNode;
  className?: string;
  distance?: number;
};

type RevealDefaults = {
  y: number;
  scale: number;
  blur: number;
  clipPath?: string;
  duration: number;
  ease: readonly [number, number, number, number];
};

function getRevealDefaults(variant: RevealVariant): RevealDefaults {
  switch (variant) {
    case "hero":
      return {
        y: 18,
        scale: 0.99,
        blur: 3,
        duration: heroRevealTransition.duration,
        ease: heroRevealTransition.ease,
      };
    case "media":
      return {
        y: 26,
        scale: 0.974,
        blur: 4,
        clipPath: "inset(0 0 14% 0 round 1.75rem)",
        duration: heroRevealTransition.duration,
        ease: heroRevealTransition.ease,
      };
    case "micro":
      return {
        y: 10,
        scale: 0.998,
        blur: 0,
        duration: microRevealTransition.duration,
        ease: microRevealTransition.ease,
      };
    case "card":
      return {
        y: 22,
        scale: 0.992,
        blur: 0,
        duration: cardRevealTransition.duration,
        ease: cardRevealTransition.ease,
      };
    case "section":
    default:
      return {
        y: 34,
        scale: 0.986,
        blur: 0,
        duration: sectionRevealTransition.duration,
        ease: sectionRevealTransition.ease,
      };
  }
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  distance,
  duration,
  blur,
  variant = "section",
  once = true,
  amount = 0.1,
  margin = "0px 0px -48px 0px",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const responsiveSceneMode = useResponsiveSceneMode();
  const defaults = getRevealDefaults(variant);
  const usesLiteRevealMode =
    responsiveSceneMode.isCompact ||
    responsiveSceneMode.isTabletPortrait ||
    responsiveSceneMode.isDesktopShortHeight;
  const resolvedDistance = usesLiteRevealMode
    ? Math.min(distance ?? defaults.y, 12)
    : (distance ?? defaults.y);
  const resolvedDuration = duration ?? defaults.duration;
  const resolvedBlur = usesLiteRevealMode ? 0 : (blur ?? defaults.blur);
  const inView = useInView(ref, {
    once,
    amount,
    margin,
  });

  const initial = reduceMotion
    ? {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        clipPath: "inset(0 0 0% 0 round 0rem)",
      }
    : {
        opacity: 0,
        y: resolvedDistance,
        scale: defaults.scale,
        filter: resolvedBlur ? `blur(${resolvedBlur}px)` : "blur(0px)",
        clipPath: defaults.clipPath ?? "inset(0 0 0% 0 round 0rem)",
      };

  const animate = inView || reduceMotion
    ? {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        clipPath: "inset(0 0 0% 0 round 0rem)",
      }
    : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: resolvedDuration,
        delay: delay / 1000,
        ease: defaults.ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className = "",
  delay = 0,
  stagger = 0.1,
  amount = 0.14,
  margin = "0px 0px -64px 0px",
  once = true,
}: RevealGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, {
    once,
    amount,
    margin,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView || reduceMotion ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: reduceMotion
            ? { staggerChildren: 0, delayChildren: 0 }
            : {
                delayChildren: delay / 1000,
                staggerChildren: stagger,
                ease: premiumEase,
              },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className = "",
  delay = 0,
  distance,
  duration,
  blur,
  variant = "card",
}: RevealItemProps) {
  const reduceMotion = useReducedMotion();
  const responsiveSceneMode = useResponsiveSceneMode();
  const defaults = getRevealDefaults(variant);
  const usesLiteRevealMode =
    responsiveSceneMode.isCompact ||
    responsiveSceneMode.isTabletPortrait ||
    responsiveSceneMode.isDesktopShortHeight;
  const resolvedDistance = usesLiteRevealMode
    ? Math.min(distance ?? defaults.y, 12)
    : (distance ?? defaults.y);
  const resolvedDuration = duration ?? defaults.duration;
  const resolvedBlur = usesLiteRevealMode ? 0 : (blur ?? defaults.blur);

  return (
    <motion.div
      variants={{
        hidden: reduceMotion
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              clipPath: "inset(0 0 0% 0 round 0rem)",
            }
          : {
              opacity: 0,
              y: resolvedDistance,
              scale: defaults.scale,
              filter: resolvedBlur ? `blur(${resolvedBlur}px)` : "blur(0px)",
              clipPath: defaults.clipPath ?? "inset(0 0 0% 0 round 0rem)",
            },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          clipPath: "inset(0 0 0% 0 round 0rem)",
        },
      }}
      transition={{
        duration: resolvedDuration,
        delay: delay / 1000,
        ease: defaults.ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollPlane({
  children,
  className = "",
  distance = 18,
}: ScrollPlaneProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yRaw = useTransform(scrollYProgress, [0, 0.45, 1], [distance, 0, -distance * 0.7]);
  const scaleRaw = useTransform(scrollYProgress, [0, 0.45, 1], [1.015, 1, 0.992]);
  const y = useSpring(yRaw, scrollDepthSpring);
  const scale = useSpring(scaleRaw, scrollDepthSpring);

  return (
    <motion.div
      ref={ref}
      style={reduceMotion ? undefined : { y, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
