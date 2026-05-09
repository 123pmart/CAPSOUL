"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { m } from "framer-motion";

import { useCinematicMotion } from "@/components/motion/MotionProvider";
import {
  premiumEase,
  softEase,
  motionDurations,
  scaleMotionDuration,
  scaleMotionValue,
} from "@/components/motion/motion-config";
import {
  useStaggerContext,
  type StaggerDirection,
  type StaggerVariant,
} from "@/components/motion/StaggerGroup";

type SceneCardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  index?: number;
  direction?: StaggerDirection;
  variant?: StaggerVariant;
  hover?: boolean;
  tap?: boolean;
  [key: string]: any;
};

const motionElements: Record<string, any> = {
  div: m.div,
  article: m.article,
  aside: m.aside,
  button: m.button,
  form: m.form,
  li: m.li,
};

function getMotionElement(as: ElementType) {
  return typeof as === "string" ? motionElements[as] ?? m.div : m.div;
}

function getBaseDistance(variant: StaggerVariant) {
  switch (variant) {
    case "archive":
      return 58;
    case "media":
      return 54;
    case "process":
      return 42;
    case "quiet":
      return 36;
    case "section":
      return 48;
    case "card":
    default:
      return 48;
  }
}

function getBaseScale(variant: StaggerVariant) {
  switch (variant) {
    case "archive":
    case "card":
    case "process":
    case "section":
      return 0.96;
    case "media":
      return 0.955;
    case "quiet":
      return 0.975;
    default:
      return 0.96;
  }
}

function getHiddenTransform({
  direction,
  alternate,
  index,
  intensity,
  variant,
  isMobile,
}: {
  direction: StaggerDirection;
  alternate: boolean;
  index: number;
  intensity: number;
  variant: StaggerVariant;
  isMobile: boolean;
}) {
  const baseDistance = scaleMotionValue(getBaseDistance(variant), intensity);
  const alternatingSign = alternate && index % 2 === 1 ? -1 : 1;
  const horizontalDistance = Math.min(18, baseDistance) * alternatingSign;

  if (isMobile) {
    return {
      x: 0,
      y: Math.max(24, baseDistance),
    };
  }

  if (direction === "left") {
    return { x: -horizontalDistance, y: scaleMotionValue(8, intensity) };
  }

  if (direction === "right") {
    return { x: horizontalDistance, y: scaleMotionValue(8, intensity) };
  }

  if (direction === "none") {
    return { x: 0, y: 0 };
  }

  return {
    x: alternate ? horizontalDistance : 0,
    y: baseDistance,
  };
}

export function SceneCard({
  as: Component = "div",
  children,
  className,
  style,
  index = 0,
  direction,
  variant,
  hover = true,
  tap = true,
  ...rest
}: SceneCardProps) {
  const motionState = useCinematicMotion();
  const staggerContext = useStaggerContext();
  const resolvedVariant = variant ?? staggerContext.variant;
  const resolvedDirection = direction ?? staggerContext.direction;

  if (!motionState.enabled || !staggerContext.active) {
    const StaticComponent = Component;

    return (
      <StaticComponent {...rest} className={className} style={style}>
        {children}
      </StaticComponent>
    );
  }

  const MotionComponent = getMotionElement(Component);
  const duration = resolvedVariant === "quiet"
    ? motionDurations.small
    : resolvedVariant === "archive"
      ? motionDurations.archive
      : resolvedVariant === "media"
        ? motionDurations.section
        : motionDurations.card;
  const hiddenTransform = getHiddenTransform({
    direction: resolvedDirection,
    alternate: staggerContext.alternate,
    index,
    isMobile: motionState.isMobile,
    intensity: motionState.intensity,
    variant: resolvedVariant,
  });
  const hiddenScale = motionState.isMobile
    ? Math.max(getBaseScale(resolvedVariant), 0.98)
    : getBaseScale(resolvedVariant);

  return (
    <MotionComponent
      {...rest}
      className={[className, "motion-gpu"].filter(Boolean).join(" ")}
      custom={index}
      variants={{
        hidden: {
          opacity: 0,
          x: hiddenTransform.x,
          y: hiddenTransform.y,
          scale: hiddenScale,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            duration: scaleMotionDuration(duration, motionState.intensity),
            ease: resolvedVariant === "quiet" ? softEase : premiumEase,
          },
        },
      }}
      whileHover={
        hover && motionState.canUseHoverMotion
          ? { y: -4, scale: 1.01, transition: { duration: 0.2, ease: softEase } }
          : undefined
      }
      whileTap={
        tap
          ? { scale: 0.985, transition: { duration: 0.18, ease: softEase } }
          : undefined
      }
      style={style}
    >
      {children}
    </MotionComponent>
  );
}
