"use client";

import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
};

const revealTransition = {
  duration: 0.58,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function SectionScroller({ sections, children }: SectionScrollerProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const childItems = useMemo(() => Children.toArray(children), [children]);

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
    const nextIndex = Math.min(childItems.length - 1, Math.max(0, index));
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  }, [childItems.length]);

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
  }, [childItems.length, setBoundedActiveIndex, syncBackgroundMotion]);

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

  const goToSection = useCallback((index: number) => {
    const root = containerRef.current;
    const nextIndex = Math.min(childItems.length - 1, Math.max(0, index));

    if (!root || !sectionRefs.current[nextIndex]) {
      return;
    }

    root.scrollTo({
      top: nextIndex * root.clientHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });

    setBoundedActiveIndex(nextIndex);
    syncBackgroundMotion(root);
  }, [childItems.length, setBoundedActiveIndex, syncBackgroundMotion]);

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
                  className="section-scroller-content"
                  data-section-active={isActive ? "true" : "false"}
                  initial={false}
                  animate={
                    reduceMotion
                      ? { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }
                      : isActive
                        ? { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }
                        : { opacity: 0.12, filter: "blur(8px)", scale: 0.985, y: 20 }
                  }
                  transition={reduceMotion ? { duration: 0 } : revealTransition}
                >
                  {content}
                </motion.div>
              </section>
            );
          })}
        </div>

        <nav className="section-dot-nav" aria-label="Section navigation">
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
