"use client";

import {
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import {
  m,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { useCinematicMotion } from "@/components/motion/MotionProvider";
import {
  premiumEase,
  scaleMotionValue,
} from "@/components/motion/motion-config";

type ScrollSceneKind = "hero" | "section" | "archive" | "quiet";

type ScrollSceneProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
  kind?: ScrollSceneKind;
  amount?: number;
  margin?: string;
  once?: boolean;
  [key: string]: any;
};

const motionElements: Record<string, any> = {
  div: m.div,
  section: m.section,
  article: m.article,
};

function getMotionElement(as: ElementType) {
  return typeof as === "string" ? motionElements[as] ?? m.div : m.div;
}

function getScrollValues(kind: ScrollSceneKind, intensity: number) {
  if (kind === "hero") {
    return {
      y: [0, scaleMotionValue(-44, intensity)],
      scale: [1, 0.955],
      opacity: [1, 0.68],
      offset: ["start start", "end start"] as const,
    };
  }

  if (kind === "archive") {
    return {
      y: [scaleMotionValue(30, intensity), 0, scaleMotionValue(-18, intensity)],
      scale: [0.97, 1.018, 1],
      opacity: [0.9, 1, 0.96],
      offset: ["start end", "center center", "end start"] as const,
    };
  }

  if (kind === "quiet") {
    return {
      y: [scaleMotionValue(20, intensity), 0, scaleMotionValue(-10, intensity)],
      scale: [0.985, 1, 0.996],
      opacity: [0.94, 1, 0.98],
      offset: ["start end", "center center", "end start"] as const,
    };
  }

  return {
    y: [scaleMotionValue(26, intensity), 0, scaleMotionValue(-12, intensity)],
    scale: [0.985, 1, 0.996],
    opacity: [0.94, 1, 0.96],
    offset: ["start end", "center center", "end start"] as const,
  };
}

function getInputRange(length: number) {
  return length === 3 ? [0, 0.5, 1] : [0, 1];
}

export function ScrollScene({
  as: Component = "section",
  children,
  className,
  contentClassName,
  style,
  contentStyle,
  kind = "section",
  amount = 0.18,
  margin = "0px 0px -72px 0px",
  once = true,
  ...rest
}: ScrollSceneProps) {
  const motionState = useCinematicMotion();

  if (!motionState.enabled || !motionState.canUseScrollMotion) {
    const StaticComponent = Component;

    return (
      <StaticComponent
        {...rest}
        className={className}
        data-motion-visible="true"
        style={style}
      >
        {contentClassName ? (
          <div className={contentClassName} style={contentStyle}>
            {children}
          </div>
        ) : children}
      </StaticComponent>
    );
  }

  return (
    <AnimatedScrollScene
      {...rest}
      Component={Component}
      amount={amount}
      className={className}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      kind={kind}
      margin={margin}
      once={once}
      style={style}
    >
      {children}
    </AnimatedScrollScene>
  );
}

function AnimatedScrollScene({
  Component,
  children,
  className,
  contentClassName,
  style,
  contentStyle,
  kind,
  amount,
  margin,
  once,
  ...rest
}: ScrollSceneProps & { Component: ElementType }) {
  const ref = useRef<HTMLElement | null>(null);
  const motionState = useCinematicMotion();
  const inView = useInView(ref, { once, amount, margin: margin as any });
  const MotionComponent = getMotionElement(Component);
  const values = getScrollValues(kind ?? "section", motionState.intensity);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [...values.offset] as any,
  });
  const rawY = useTransform(scrollYProgress, getInputRange(values.y.length), values.y);
  const rawScale = useTransform(scrollYProgress, getInputRange(values.scale.length), values.scale);
  const rawOpacity = useTransform(scrollYProgress, getInputRange(values.opacity.length), values.opacity);
  const y = useSpring(rawY, { stiffness: 120, damping: 26, mass: 0.72 });
  const scale = useSpring(rawScale, { stiffness: 120, damping: 26, mass: 0.72 });
  const opacity = useSpring(rawOpacity, { stiffness: 120, damping: 26, mass: 0.72 });
  const animatedContentStyle = { ...contentStyle, y, scale, opacity };

  if (!contentClassName) {
    return (
      <MotionComponent
        {...rest}
        ref={ref}
        className={[className, "motion-layer"].filter(Boolean).join(" ")}
        data-motion-visible={inView ? "true" : "false"}
        style={style}
        transition={{ ease: premiumEase }}
      >
        {children}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      {...rest}
      ref={ref}
      className={[className, "motion-layer"].filter(Boolean).join(" ")}
      data-motion-visible={inView ? "true" : "false"}
      style={style}
      transition={{ ease: premiumEase }}
    >
      <m.div
        className={[contentClassName, "motion-gpu"].filter(Boolean).join(" ")}
        style={animatedContentStyle}
      >
        {children}
      </m.div>
    </MotionComponent>
  );
}
