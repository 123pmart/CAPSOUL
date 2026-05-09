"use client";

import {
  useRef,
  type CSSProperties,
  type ElementType,
} from "react";
import { m, useInView } from "framer-motion";

import { useCinematicMotion } from "@/components/motion/MotionProvider";
import {
  motionDurations,
  premiumEase,
  scaleMotionDuration,
  scaleMotionValue,
} from "@/components/motion/motion-config";

type MotionTextProps = {
  as?: ElementType;
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  amount?: number;
  margin?: string;
  immediate?: boolean;
  [key: string]: any;
};

const motionElements: Record<string, any> = {
  h1: m.h1,
  h2: m.h2,
  h3: m.h3,
  span: m.span,
};

function getMotionElement(as: ElementType) {
  return typeof as === "string" ? motionElements[as] ?? m.span : m.span;
}

export function MotionText({
  as: Component = "h2",
  text,
  className,
  style,
  delay = 0,
  amount = 0.25,
  margin = "0px 0px -72px 0px",
  immediate = false,
  ...rest
}: MotionTextProps) {
  const motionState = useCinematicMotion();

  if (!motionState.enabled) {
    const StaticComponent = Component;

    return (
      <StaticComponent {...rest} className={className} style={style}>
        {text}
      </StaticComponent>
    );
  }

  return (
    <AnimatedMotionText
      {...rest}
      Component={Component}
      amount={amount}
      className={className}
      delay={delay}
      immediate={immediate}
      margin={margin}
      style={style}
      text={text}
    />
  );
}

function AnimatedMotionText({
  Component,
  text,
  className,
  style,
  delay,
  amount,
  margin,
  immediate,
  ...rest
}: MotionTextProps & { Component: ElementType }) {
  const ref = useRef<HTMLElement | null>(null);
  const motionState = useCinematicMotion();
  const inView = useInView(ref, { once: true, amount, margin: margin as any });
  const MotionComponent = getMotionElement(Component);
  const isVisible = inView || immediate;
  const hiddenDistance = scaleMotionValue(44, motionState.intensity);
  const hiddenTextState = {
    opacity: 0,
    y: motionState.isMobile ? Math.max(24, hiddenDistance) : hiddenDistance,
    scale: motionState.isMobile ? 0.98 : 0.965,
  };
  const visibleTextState = {
    opacity: 1,
    y: 0,
    scale: 1,
  };

  return (
    <MotionComponent
      {...rest}
      ref={ref}
      className={[className, "motion-text"].filter(Boolean).join(" ")}
      data-motion-visible={isVisible ? "true" : "false"}
      initial={hiddenTextState}
      animate={isVisible ? visibleTextState : hiddenTextState}
      transition={{
        duration: scaleMotionDuration(motionDurations.text, motionState.intensity),
        delay,
        ease: premiumEase,
      }}
      style={style}
    >
      {text}
    </MotionComponent>
  );
}
