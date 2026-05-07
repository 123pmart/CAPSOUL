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
  routeLabels?: {
    previous: string;
    next: string;
  };
};

const revealTransition = {
  duration: 0.52,
  ease: [0.22, 1, 0.36, 1],
} as const;

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(length - 1, Math.max(0, index));
}

function resetSectionScroll(content: HTMLElement | null) {
  if (!content) {
    return;
  }

  content.scrollTop = 0;
  content
    .querySelectorAll<HTMLElement>(
      [
        ".scene-detail-scroll",
        ".inquiry-tablet-field-stage",
        ".scene-mobile-field-stage",
      ].join(", "),
    )
    .forEach((nestedScrollTarget) => {
      nestedScrollTarget.scrollTop = 0;
    });
}

export function SectionScroller({
  sections,
  children,
  routeLabels = { previous: "Previous", next: "Next" },
}: SectionScrollerProps) {
  const reduceMotion = useReducedMotion();
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const childItems = useMemo(() => Children.toArray(children), [children]);

  const syncArchiveState = useCallback((index: number) => {
    const sectionCount = Math.max(childItems.length - 1, 1);
    const archiveProgress = index / sectionCount;
    const centeredIndex = index - (childItems.length - 1) / 2;
    const rootStyle = document.documentElement.style;

    rootStyle.setProperty("--section-index", String(index));
    rootStyle.setProperty("--archive-depth", archiveProgress.toFixed(3));
    rootStyle.setProperty("--archive-shift", `${(centeredIndex * 5).toFixed(2)}px`);
    rootStyle.setProperty("--archive-shift-soft", `${(centeredIndex * 2.6).toFixed(2)}px`);
    rootStyle.setProperty("--archive-shift-lite", `${(centeredIndex * 1.8).toFixed(2)}px`);
  }, [childItems.length]);

  const setBoundedActiveIndex = useCallback((index: number) => {
    const nextIndex = clampIndex(index, childItems.length);
    activeIndexRef.current = nextIndex;
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
    syncArchiveState(nextIndex);
  }, [childItems.length, syncArchiveState]);

  const getHeaderOffset = useCallback(() => {
    const main = document.getElementById("main-content");
    const paddingTop = main
      ? Number.parseFloat(window.getComputedStyle(main).paddingTop)
      : Number.NaN;

    return Number.isFinite(paddingTop) ? paddingTop : 96;
  }, []);

  const syncActiveSection = useCallback(() => {
    if (childItems.length === 0) {
      return;
    }

    const marker = window.scrollY + getHeaderOffset() + window.innerHeight * 0.26;
    let nextIndex = 0;

    sectionRefs.current.forEach((section, index) => {
      if (!section) {
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;

      if (sectionTop <= marker) {
        nextIndex = index;
      }
    });

    setBoundedActiveIndex(nextIndex);
  }, [childItems.length, getHeaderOffset, setBoundedActiveIndex]);

  useEffect(() => {
    const handleScroll = () => {
      if (frameRef.current != null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        syncActiveSection();
      });
    };

    syncActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("orientationchange", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("orientationchange", handleScroll);

      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      const rootStyle = document.documentElement.style;
      rootStyle.removeProperty("--section-index");
      rootStyle.removeProperty("--archive-depth");
      rootStyle.removeProperty("--archive-shift");
      rootStyle.removeProperty("--archive-shift-soft");
      rootStyle.removeProperty("--archive-shift-lite");
    };
  }, [syncActiveSection]);

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
    const nextIndex = clampIndex(index, childItems.length);
    const targetSection = sectionRefs.current[nextIndex];

    if (!targetSection) {
      return;
    }

    const prefersReducedMotion =
      reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    resetSectionScroll(contentRefs.current[nextIndex]);
    setBoundedActiveIndex(nextIndex);

    const sectionTop = targetSection.getBoundingClientRect().top + window.scrollY;
    const top = Math.max(0, sectionTop - getHeaderOffset() + 10);

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    window.requestAnimationFrame(() => {
      resetSectionScroll(contentRefs.current[nextIndex]);
    });
  }, [childItems.length, getHeaderOffset, reduceMotion, setBoundedActiveIndex]);

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
                  ref={(node) => {
                    contentRefs.current[index] = node;
                  }}
                  className="section-scroller-content"
                  data-section-active={isActive ? "true" : "false"}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={reduceMotion ? { duration: 0 } : revealTransition}
                >
                  <div className="archive-section-stage">
                    <div className="archive-stage-depth" aria-hidden="true">
                      <span className="archive-stage-sheet archive-stage-sheet-back" />
                      <span className="archive-stage-sheet archive-stage-sheet-mid" />
                      <span className="archive-stage-sheet archive-stage-sheet-front" />
                    </div>
                    <div className="archive-section-content">
                      <div className="archive-stage-meta" aria-hidden="true">
                        <span>{`Record ${String(index + 1).padStart(2, "0")}`}</span>
                        <span>{section.label}</span>
                      </div>
                      <div className="section-scroller-content-main">
                        {content}
                      </div>
                      <nav
                        data-section-navigation-control="true"
                        className="section-page-controls"
                        aria-label={`${section.label} section controls`}
                      >
                        <button
                          type="button"
                          className="section-page-control section-page-control-previous"
                          disabled={index === 0}
                          aria-label={
                            index === 0
                              ? routeLabels.previous
                              : `${routeLabels.previous}: ${sections[index - 1]?.label}`
                          }
                          onClick={() => goToSection(index - 1)}
                        >
                          <span aria-hidden="true">&larr;</span>
                          <span>{routeLabels.previous}</span>
                        </button>
                        <div
                          data-section-navigation-control="true"
                          className="section-mobile-progress-nav"
                          role="group"
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
                        </div>
                        <button
                          type="button"
                          className="section-page-control section-page-control-next"
                          disabled={index === childItems.length - 1}
                          aria-label={
                            index === childItems.length - 1
                              ? routeLabels.next
                              : `${routeLabels.next}: ${sections[index + 1]?.label}`
                          }
                          onClick={() => goToSection(index + 1)}
                        >
                          <span>{routeLabels.next}</span>
                          <span aria-hidden="true">&rarr;</span>
                        </button>
                      </nav>
                    </div>
                  </div>
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
