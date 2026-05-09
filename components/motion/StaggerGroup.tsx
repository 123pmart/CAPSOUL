"use client";

import {
  Children,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MutableRefObject,
  type Ref,
  type ReactNode,
} from "react";
import { m, useInView } from "framer-motion";

import { useCinematicMotion } from "@/components/motion/MotionProvider";
import {
  motionDurations,
  premiumEase,
  scaleMotionDuration,
} from "@/components/motion/motion-config";

export type StaggerDirection = "up" | "left" | "right" | "none";
export type StaggerVariant = "section" | "card" | "media" | "archive" | "process" | "quiet";

type StaggerContextValue = {
  active: boolean;
  direction: StaggerDirection;
  alternate: boolean;
  variant: StaggerVariant;
};

const StaggerContext = createContext<StaggerContextValue>({
  active: false,
  direction: "up",
  alternate: false,
  variant: "card",
});

type StaggerGroupProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  direction?: StaggerDirection;
  alternate?: boolean;
  variant?: StaggerVariant;
  delay?: number;
  stagger?: number;
  amount?: number;
  margin?: string;
  once?: boolean;
  [key: string]: any;
};

const motionElements: Record<string, any> = {
  div: m.div,
  section: m.section,
  article: m.article,
  aside: m.aside,
  header: m.header,
  footer: m.footer,
  form: m.form,
  ul: m.ul,
};

export function useStaggerContext() {
  return useContext(StaggerContext);
}

function getMotionElement(as: ElementType) {
  return typeof as === "string" ? motionElements[as] ?? m.div : m.div;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as MutableRefObject<T | null>).current = value;
}

export const StaggerGroup = forwardRef<HTMLElement, StaggerGroupProps>(function StaggerGroup({
  as: Component = "div",
  children,
  className,
  style,
  direction = "up",
  alternate = false,
  variant = "card",
  delay = 0.05,
  stagger = 0.08,
  amount = 0.18,
  margin = "0px 0px -72px 0px",
  once = true,
  ...rest
}: StaggerGroupProps, forwardedRef) {
  const motionState = useCinematicMotion();
  const contextValue = useMemo<StaggerContextValue>(() => ({
    active: motionState.enabled,
    direction,
    alternate,
    variant,
  }), [alternate, direction, motionState.enabled, variant]);

  if (!motionState.enabled) {
    const StaticComponent = Component;

    return (
      <StaggerContext.Provider value={contextValue}>
        <StaticComponent
          {...rest}
          ref={forwardedRef}
          className={className}
          data-motion-visible="true"
          style={style}
        >
          {children}
        </StaticComponent>
      </StaggerContext.Provider>
    );
  }

  return (
    <AnimatedStaggerGroup
      {...rest}
      Component={Component}
      amount={amount}
      className={className}
      contextValue={contextValue}
      delay={delay}
      margin={margin}
      once={once}
      forwardedRef={forwardedRef}
      stagger={stagger}
      style={style}
    >
      {children}
    </AnimatedStaggerGroup>
  );
});

function AnimatedStaggerGroup({
  Component,
  children,
  className,
  style,
  contextValue,
  delay = 0.05,
  stagger = 0.08,
  amount = 0.18,
  margin = "0px 0px -72px 0px",
  once = true,
  forwardedRef,
  ...rest
}: StaggerGroupProps & {
  Component: ElementType;
  contextValue: StaggerContextValue;
  forwardedRef?: Ref<HTMLElement>;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const motionState = useCinematicMotion();
  const inView = useInView(ref, { once, amount, margin: margin as any });
  const childCount = Children.count(children);
  const cappedStagger = Math.min(stagger, childCount > 1 ? 0.48 / (childCount - 1) : stagger);
  const MotionComponent = getMotionElement(Component);

  useEffect(() => {
    if (inView) {
      setIsAnimating(true);
    }
  }, [inView]);

  return (
    <StaggerContext.Provider value={contextValue}>
      <MotionComponent
        {...rest}
        ref={(node: HTMLElement | null) => {
          ref.current = node;
          assignRef(forwardedRef, node);
        }}
        className={[
          className,
          "motion-gpu",
          isAnimating ? "motion-no-layout" : "",
        ].filter(Boolean).join(" ")}
        data-motion-visible={inView ? "true" : "false"}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: delay,
              staggerChildren: cappedStagger,
              duration: scaleMotionDuration(motionDurations.small, motionState.intensity),
              ease: premiumEase,
            },
          },
        }}
        onAnimationComplete={() => setIsAnimating(false)}
        style={style}
      >
        {children}
      </MotionComponent>
    </StaggerContext.Provider>
  );
}
