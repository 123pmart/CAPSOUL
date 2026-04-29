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

import { ImmersiveScrollProvider } from "@/components/immersive-scroll-context";

type SectionScrollerSection = {
  id: string;
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

      setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
    };

    const handleScroll = () => {
      if (frameRef.current != null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(syncActiveSection);
    };

    syncActiveSection();
    root.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      root.removeEventListener("scroll", handleScroll);

      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [childItems.length]);

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

    setActiveIndex(nextIndex);
  }, [childItems.length]);

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
