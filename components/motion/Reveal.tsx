"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { m, useInView } from "framer-motion";

import { useCinematicMotion } from "@/components/motion/MotionProvider";
import {
  motionDurations,
  premiumEase,
  softEase,
  scaleMotionDuration,
  scaleMotionValue,
} from "@/components/motion/motion-config";

type RevealVariant = "hero" | "section" | "card" | "media" | "micro" | "quiet" | "archive";
type RevealDirection = "up" | "down" | "left" | "right" | "none";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: RevealVariant;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  amount?: number;
  margin?: string;
  once?: boolean;
  immediate?: boolean;
  [key: string]: any;
};

const motionElements: Record<string, any> = {
  div: m.div,
  span: m.span,
  p: m.p,
  h1: m.h1,
  h2: m.h2,
  h3: m.h3,
  article: m.article,
  aside: m.aside,
  header: m.header,
  section: m.section,
};

function getMotionElement(as: ElementType) {
  return typeof as === "string" ? motionElements[as] ?? m.div : m.div;
}

function getDefaults(variant: RevealVariant) {
  switch (variant) {
    case "hero":
      return { y: 42, scale: 0.965, duration: motionDurations.hero, ease: premiumEase };
    case "archive":
      return { y: 58, scale: 0.96, duration: motionDurations.archive, ease: premiumEase };
    case "media":
      return { y: 54, scale: 0.96, duration: motionDurations.section, ease: premiumEase };
    case "micro":
      return { y: 22, scale: 0.98, duration: motionDurations.micro, ease: softEase };
    case "quiet":
      return { y: 36, scale: 0.975, duration: motionDurations.small, ease: softEase };
    case "card":
      return { y: 48, scale: 0.96, duration: motionDurations.card, ease: premiumEase };
    case "section":
    default:
      return { y: 48, scale: 0.96, duration: motionDurations.section, ease: premiumEase };
  }
}

function getDirectionalOffset(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    case "none":
      return { x: 0, y: 0 };
    case "up":
    default:
      return { x: 0, y: distance };
  }
}

export function Reveal({
  as: Component = "div",
  children,
  className,
  style,
  variant = "section",
  direction = "up",
  delay = 0,
  duration,
  distance,
  amount = 0.18,
  margin = "0px 0px -72px 0px",
  once = true,
  immediate = false,
  ...rest
}: RevealProps) {
  const motionState = useCinematicMotion();

  if (!motionState.enabled) {
    const StaticComponent = Component;

    return (
      <StaticComponent
        {...rest}
        className={className}
        data-motion-visible="true"
        style={style}
      >
        {children}
      </StaticComponent>
    );
  }

  return (
    <AnimatedReveal
      {...rest}
      Component={Component}
      amount={amount}
      className={className}
      delay={delay}
      direction={direction}
      distance={distance}
      duration={duration}
      immediate={immediate}
      margin={margin}
      once={once}
      style={style}
      variant={variant}
    >
      {children}
    </AnimatedReveal>
  );
}

function AnimatedReveal({
  Component,
  children,
  className,
  style,
  variant,
  direction,
  delay,
  duration,
  distance,
  amount,
  margin,
  once,
  immediate,
  ...rest
}: RevealProps & { Component: ElementType }) {
  const ref = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const motionState = useCinematicMotion();
  const inView = useInView(ref, { once, amount, margin: margin as any });
  const defaults = getDefaults(variant ?? "section");
  const resolvedDistance = scaleMotionValue(distance ?? defaults.y, motionState.intensity);
  const offset = getDirectionalOffset(direction ?? "up", resolvedDistance);
  const MotionComponent = getMotionElement(Component);

  useEffect(() => {
    if (inView || immediate) {
      setIsAnimating(true);
    }
  }, [immediate, inView]);

  return (
    <MotionComponent
      {...rest}
      ref={ref}
      className={[
        className,
        "motion-gpu",
        isAnimating ? "motion-no-layout" : "",
      ].filter(Boolean).join(" ")}
      data-motion-visible={inView || immediate ? "true" : "false"}
      initial="hidden"
      animate={inView || immediate ? "visible" : "hidden"}
      variants={{
        hidden: {
          opacity: 0,
          x: offset.x,
          y: offset.y,
          scale: defaults.scale,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            duration: scaleMotionDuration(duration ?? defaults.duration, motionState.intensity),
            delay,
            ease: defaults.ease,
          },
        },
      }}
      onAnimationComplete={() => setIsAnimating(false)}
      style={style}
    >
      {children}
    </MotionComponent>
  );
}
