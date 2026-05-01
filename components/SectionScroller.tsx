"use client";

import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  IMMERSIVE_SECTION_NAVIGATE_EVENT,
  ImmersiveScrollProvider,
  dispatchImmersiveSectionChange,
  getImmersiveRouteForSection,
  isImmersiveSectionId,
  type ImmersiveSectionId,
} from "@/components/immersive-scroll-context";

type SectionScrollerSection = {
  id: ImmersiveSectionId;
  label: string;
};

type SectionScrollerProps = {
  sections: SectionScrollerSection[];
  children: ReactNode;
  routeLabels?: {
    previous: string;
    next: string;
  };
};

const revealTransition = {
  duration: 0.58,
  ease: [0.22, 1, 0.36, 1],
} as const;

const SCROLL_BOUNDARY_TOLERANCE = 6;
const DESKTOP_WHEEL_DELTA_THRESHOLD = 104;
const MOBILE_SECTION_SWIPE_THRESHOLD = 92;
const SECTION_TRANSITION_LOCK_MS = 780;
const WHEEL_INTENT_IDLE_MS = 220;

type InnerScrollPosition = "start" | "end" | "preserve";

type BoundaryWheelEvent = {
  target: EventTarget | null;
  deltaY: number;
  cancelable?: boolean;
  nativeEvent?: {
    cancelable?: boolean;
  };
  preventDefault: () => void;
};

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(length - 1, Math.max(0, index));
}

function getScrollableDistance(element: HTMLElement) {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

function canScrollInDirection(
  element: HTMLElement,
  direction: 1 | -1,
  tolerance = SCROLL_BOUNDARY_TOLERANCE,
) {
  const maxScroll = getScrollableDistance(element);

  if (maxScroll <= tolerance) {
    return false;
  }

  if (direction > 0) {
    return element.scrollTop < maxScroll - tolerance;
  }

  return element.scrollTop > tolerance;
}

function isScrollableElement(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  return (
    /(auto|scroll|overlay)/.test(style.overflowY) &&
    getScrollableDistance(element) > SCROLL_BOUNDARY_TOLERANCE
  );
}

function findNestedScrollableTarget(
  target: EventTarget | null,
  boundary: HTMLElement,
) {
  if (!(target instanceof Element)) {
    return null;
  }

  let element: Element | null = target;

  while (element && element !== boundary) {
    if (element instanceof HTMLElement && isScrollableElement(element)) {
      return element;
    }

    element = element.parentElement;
  }

  return null;
}

function isSectionNavigationProtectedTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        "input",
        "textarea",
        "select",
        "option",
        "a",
        "button:not(.scene-mobile-card)",
        "[role='button']:not(.scene-mobile-card)",
        "[role='slider']",
        "[data-section-navigation-control='true']",
        ".compact-scene-controls",
        ".inquiry-step-tabs",
      ].join(", "),
    ),
  );
}

export function SectionScroller({
  sections,
  children,
  routeLabels = { previous: "Previous", next: "Next" },
}: SectionScrollerProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const wheelBufferRef = useRef(0);
  const wheelDirectionRef = useRef<1 | -1 | null>(null);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ y: number; index: number } | null>(null);
  const navigationLockRef = useRef(false);
  const navigationLockTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const childItems = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const syncBackgroundMotion = useCallback((root: HTMLDivElement) => {
    if (reduceMotion) {
      return;
    }

    const maxScroll = Math.max(root.scrollHeight - root.clientHeight, 1);
    const progress = Math.min(1, Math.max(0, root.scrollTop / maxScroll));
    const wave = Math.sin(progress * Math.PI * 2);
    const counterWave = Math.cos(progress * Math.PI * 2);
    const driftX = wave * 68;
    const shiftY = (progress - 0.5) * -190;
    const scale = 1.022 + Math.abs(counterWave) * 0.026 + progress * 0.018;
    const glow = 0.08 + Math.abs(wave) * 0.09;
    const canvasX = counterWave * 18;
    const canvasY = (progress - 0.5) * 52;
    const canvasScale = 1.04 + Math.abs(wave) * 0.018;
    const rootStyle = document.documentElement.style;

    rootStyle.setProperty("--immersive-bg-progress", progress.toFixed(3));
    rootStyle.setProperty("--immersive-bg-drift-x", `${driftX.toFixed(2)}px`);
    rootStyle.setProperty("--immersive-bg-shift-y", `${shiftY.toFixed(2)}px`);
    rootStyle.setProperty("--immersive-bg-scale", scale.toFixed(3));
    rootStyle.setProperty("--immersive-bg-glow", glow.toFixed(3));
    rootStyle.setProperty("--immersive-bg-counter-x", `${(counterWave * -54).toFixed(2)}px`);
    rootStyle.setProperty("--immersive-bg-counter-y", `${(wave * 44).toFixed(2)}px`);
    rootStyle.setProperty("--immersive-canvas-x", `${canvasX.toFixed(2)}px`);
    rootStyle.setProperty("--immersive-canvas-y", `${canvasY.toFixed(2)}px`);
    rootStyle.setProperty("--immersive-canvas-scale", canvasScale.toFixed(3));
  }, [reduceMotion]);

  const setBoundedActiveIndex = useCallback((index: number) => {
    const nextIndex = clampIndex(index, childItems.length);
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  }, [childItems.length]);

  const clearNavigationLock = useCallback(() => {
    if (navigationLockTimerRef.current != null) {
      window.clearTimeout(navigationLockTimerRef.current);
      navigationLockTimerRef.current = null;
    }

    navigationLockRef.current = false;
  }, []);

  const resetWheelIntent = useCallback(() => {
    if (wheelIdleTimerRef.current != null) {
      window.clearTimeout(wheelIdleTimerRef.current);
      wheelIdleTimerRef.current = null;
    }

    wheelBufferRef.current = 0;
    wheelDirectionRef.current = null;
  }, []);

  const armWheelIdleReset = useCallback(() => {
    if (wheelIdleTimerRef.current != null) {
      window.clearTimeout(wheelIdleTimerRef.current);
    }

    wheelIdleTimerRef.current = window.setTimeout(() => {
      resetWheelIntent();
    }, WHEEL_INTENT_IDLE_MS);
  }, [resetWheelIntent]);

  const armNavigationLock = useCallback(() => {
    clearNavigationLock();
    navigationLockRef.current = true;

    navigationLockTimerRef.current = window.setTimeout(() => {
      navigationLockRef.current = false;
      navigationLockTimerRef.current = null;
    }, SECTION_TRANSITION_LOCK_MS);
  }, [clearNavigationLock]);

  const positionInnerScroll = useCallback((
    index: number,
    position: InnerScrollPosition,
  ) => {
    if (position === "preserve") {
      return;
    }

    window.requestAnimationFrame(() => {
      const content = contentRefs.current[index];

      if (!content) {
        return;
      }

      content.scrollTop = position === "end" ? getScrollableDistance(content) : 0;
    });
  }, []);

  useEffect(() => {
    const root = containerRef.current;

    if (!root || childItems.length === 0) {
      return;
    }

    const syncActiveSection = () => {
      frameRef.current = null;

      const viewportHeight = root.clientHeight || 1;
      const nextIndex = Math.min(
        childItems.length - 1,
        Math.max(0, Math.round(root.scrollTop / viewportHeight)),
      );

      setBoundedActiveIndex(nextIndex);
      syncBackgroundMotion(root);
    };

    const handleScroll = () => {
      if (frameRef.current != null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(syncActiveSection);
    };

    syncActiveSection();
    root.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!mostVisible) {
          return;
        }

        const nextIndex = Number((mostVisible.target as HTMLElement).dataset.sectionIndex);

        if (Number.isFinite(nextIndex)) {
          setBoundedActiveIndex(nextIndex);
        }
      },
      {
        root,
        rootMargin: "-24% 0px -24% 0px",
        threshold: [0.24, 0.4, 0.56, 0.72],
      },
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      root.removeEventListener("scroll", handleScroll);
      observer.disconnect();

      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      clearNavigationLock();
      resetWheelIntent();

      const rootStyle = document.documentElement.style;
      rootStyle.removeProperty("--immersive-bg-progress");
      rootStyle.removeProperty("--immersive-bg-drift-x");
      rootStyle.removeProperty("--immersive-bg-shift-y");
      rootStyle.removeProperty("--immersive-bg-scale");
      rootStyle.removeProperty("--immersive-bg-glow");
      rootStyle.removeProperty("--immersive-bg-counter-x");
      rootStyle.removeProperty("--immersive-bg-counter-y");
      rootStyle.removeProperty("--immersive-canvas-x");
      rootStyle.removeProperty("--immersive-canvas-y");
      rootStyle.removeProperty("--immersive-canvas-scale");
    };
  }, [childItems.length, clearNavigationLock, resetWheelIntent, setBoundedActiveIndex, syncBackgroundMotion]);

  useEffect(() => {
    const section = sections[activeIndex];
    const href = section ? getImmersiveRouteForSection(section.id) : null;

    if (!section || !href) {
      return;
    }

    dispatchImmersiveSectionChange({
      id: section.id,
      index: activeIndex,
      label: section.label,
      href,
    });
  }, [activeIndex, sections]);

  const goToSection = useCallback((
    index: number,
    innerScrollPosition: InnerScrollPosition = "start",
  ) => {
    const root = containerRef.current;
    const nextIndex = clampIndex(index, childItems.length);

    if (!root || !sectionRefs.current[nextIndex]) {
      return;
    }

    root.scrollTo({
      top: nextIndex * root.clientHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });

    setBoundedActiveIndex(nextIndex);
    positionInnerScroll(nextIndex, innerScrollPosition);
    syncBackgroundMotion(root);
  }, [childItems.length, positionInnerScroll, setBoundedActiveIndex, syncBackgroundMotion]);

  const navigateFromBoundary = useCallback((
    direction: 1 | -1,
    innerScrollPosition: InnerScrollPosition,
  ) => {
    if (navigationLockRef.current) {
      return false;
    }

    const nextIndex = activeIndexRef.current + direction;

    if (nextIndex < 0 || nextIndex >= childItems.length) {
      return false;
    }

    resetWheelIntent();
    touchStartRef.current = null;
    armNavigationLock();
    goToSection(nextIndex, innerScrollPosition);
    return true;
  }, [armNavigationLock, childItems.length, goToSection, resetWheelIntent]);

  const getActiveScrollTarget = useCallback((
    eventTarget: EventTarget | null,
    direction: 1 | -1,
  ) => {
    const content = contentRefs.current[activeIndexRef.current];

    if (!content) {
      return null;
    }

    const nestedScrollable = findNestedScrollableTarget(eventTarget, content);

    if (nestedScrollable && canScrollInDirection(nestedScrollable, direction)) {
      return nestedScrollable;
    }

    return canScrollInDirection(content, direction) ? content : null;
  }, []);

  const activeContentCanScroll = useCallback((
    eventTarget: EventTarget | null,
    direction: 1 | -1,
  ) => Boolean(getActiveScrollTarget(eventTarget, direction)), [getActiveScrollTarget]);

  const handleWheelBoundary = useCallback((event: BoundaryWheelEvent) => {
    if (isSectionNavigationProtectedTarget(event.target)) {
      return;
    }

    const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;

    const scrollTarget = getActiveScrollTarget(event.target, direction);

    if (Math.abs(event.deltaY) < 1) {
      resetWheelIntent();
      return;
    }

    if (scrollTarget) {
      if (event.nativeEvent?.cancelable ?? event.cancelable ?? true) {
        event.preventDefault();
      }

      scrollTarget.scrollTop += event.deltaY;
      resetWheelIntent();
      return;
    }

    if (event.nativeEvent?.cancelable ?? event.cancelable ?? true) {
      event.preventDefault();
    }

    if (wheelDirectionRef.current !== direction) {
      wheelBufferRef.current = 0;
      wheelDirectionRef.current = direction;
    }

    wheelBufferRef.current += event.deltaY;
    armWheelIdleReset();

    if (Math.abs(wheelBufferRef.current) < DESKTOP_WHEEL_DELTA_THRESHOLD) {
      return;
    }

    navigateFromBoundary(direction, direction > 0 ? "start" : "end");
  }, [armWheelIdleReset, getActiveScrollTarget, navigateFromBoundary, resetWheelIntent]);

  useEffect(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      handleWheelBoundary(event);
    };

    root.addEventListener("wheel", handleNativeWheel, { capture: true, passive: false });

    return () => {
      root.removeEventListener("wheel", handleNativeWheel, { capture: true });
      resetWheelIntent();
    };
  }, [handleWheelBoundary, resetWheelIntent]);

  const handleTouchStartCapture = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    if (isSectionNavigationProtectedTarget(event.target)) {
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = {
      y: event.touches[0]?.clientY ?? 0,
      index: activeIndexRef.current,
    };
  }, []);

  const handleTouchEndCapture = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (!start || start.index !== activeIndexRef.current || isSectionNavigationProtectedTarget(event.target)) {
      return;
    }

    const endY = event.changedTouches[0]?.clientY ?? start.y;
    const delta = start.y - endY;

    if (Math.abs(delta) < MOBILE_SECTION_SWIPE_THRESHOLD) {
      return;
    }

    const direction: 1 | -1 = delta > 0 ? 1 : -1;

    if (activeContentCanScroll(event.target, direction)) {
      return;
    }

    navigateFromBoundary(direction, direction > 0 ? "start" : "end");
  }, [activeContentCanScroll, navigateFromBoundary]);

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      const sectionId = detail?.id;

      if (!sectionId || !isImmersiveSectionId(sectionId)) {
        return;
      }

      const nextIndex = sections.findIndex((section) => section.id === sectionId);

      if (nextIndex !== -1) {
        goToSection(nextIndex);
      }
    };

    window.addEventListener(IMMERSIVE_SECTION_NAVIGATE_EVENT, handleNavigate);

    return () => {
      window.removeEventListener(IMMERSIVE_SECTION_NAVIGATE_EVENT, handleNavigate);
    };
  }, [goToSection, sections]);

  return (
    <ImmersiveScrollProvider>
      <div className="section-scroller-shell">
        <div
          ref={containerRef}
          className="section-scroller"
          aria-label="CAPSOUL public sections"
          onTouchStartCapture={handleTouchStartCapture}
          onTouchEndCapture={handleTouchEndCapture}
        >
          {sections.map((section, index) => {
            const isActive = activeIndex === index;
            const content = childItems[index] ?? null;

            return (
              <section
                key={section.id}
                id={section.id}
                data-section-active={isActive ? "true" : "false"}
                data-section-index={index}
                ref={(node) => {
                  sectionRefs.current[index] = node;
                }}
                className="section-scroller-section"
                aria-label={section.label}
              >
                <motion.div
                  ref={(node) => {
                    contentRefs.current[index] = node;
                  }}
                  className="section-scroller-content"
                  data-section-active={isActive ? "true" : "false"}
                  initial={false}
                  animate={
                    reduceMotion
                      ? { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }
                      : isActive
                        ? { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }
                        : { opacity: 0.16, filter: "blur(2px)", scale: 0.992, y: 14 }
                  }
                  transition={reduceMotion ? { duration: 0 } : revealTransition}
                >
                  <div className="section-scroller-content-main">
                    {content}
                  </div>
                  <nav
                    data-section-navigation-control="true"
                    className="section-mobile-progress-nav"
                    aria-label="Mobile section navigation"
                  >
                    {sections.map((progressSection, progressIndex) => {
                      const progressIsActive = activeIndex === progressIndex;

                      return (
                        <button
                          key={`${section.id}-${progressSection.id}-mobile-progress`}
                          type="button"
                          className={`section-mobile-progress-segment ${progressIsActive ? "section-mobile-progress-segment-active" : ""}`.trim()}
                          aria-label={`Go to ${progressSection.label} section`}
                          aria-current={progressIsActive ? "page" : undefined}
                          onClick={() => goToSection(progressIndex)}
                        >
                          <span className="sr-only">{progressSection.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                  <nav
                    data-section-navigation-control="true"
                    className="section-page-controls"
                    aria-label={`${section.label} section controls`}
                  >
                    <button
                      type="button"
                      className="section-page-control section-page-control-previous"
                      disabled={index === 0}
                      aria-label={index === 0 ? routeLabels.previous : `${routeLabels.previous}: ${sections[index - 1]?.label}`}
                      onClick={() => goToSection(index - 1, "start")}
                    >
                      <span aria-hidden="true">&larr;</span>
                      <span>{routeLabels.previous}</span>
                    </button>
                    <button
                      type="button"
                      className="section-page-control section-page-control-next"
                      disabled={index === childItems.length - 1}
                      aria-label={index === childItems.length - 1 ? routeLabels.next : `${routeLabels.next}: ${sections[index + 1]?.label}`}
                      onClick={() => goToSection(index + 1, "start")}
                    >
                      <span>{routeLabels.next}</span>
                      <span aria-hidden="true">&rarr;</span>
                    </button>
                  </nav>
                </motion.div>
              </section>
            );
          })}
        </div>

        <nav
          data-section-navigation-control="true"
          className="section-dot-nav"
          aria-label="Section navigation"
        >
          {sections.map((section, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={`${section.id}-dot`}
                type="button"
                className={`section-dot ${isActive ? "section-dot-active" : ""}`.trim()}
                aria-label={`Go to ${section.label} section`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => goToSection(index)}
              >
                <span className="sr-only">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </ImmersiveScrollProvider>
  );
}
