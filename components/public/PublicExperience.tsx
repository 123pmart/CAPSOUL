"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type RefObject,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionStyle,
} from "framer-motion";

import { CompactSceneControls } from "@/components/compact-scene-controls";
import {
  IMMERSIVE_SECTION_NAVIGATE_EVENT,
  dispatchImmersiveSectionChange,
  getImmersiveRouteForSection,
  getImmersiveSectionForRoute,
  isImmersiveSectionId,
  type ImmersiveSectionId,
} from "@/components/immersive-scroll-context";
import { contentSwapTransition, measuredEase } from "@/components/motion-config";
import { PremiumSectionMotion } from "@/components/motion/PremiumSectionMotion";
import type {
  GlobalSiteContent,
  ResolvedInquiryContent,
  ResolvedSceneContent,
} from "@/lib/site-content-schema";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type PublicExperienceProps = {
  globalContent: GlobalSiteContent;
  home: ResolvedSceneContent;
  experience: ResolvedSceneContent;
  process: ResolvedSceneContent;
  preserve: ResolvedSceneContent;
  inquiry: ResolvedInquiryContent;
};

type PublicSceneStep = ResolvedSceneContent["steps"][number];
type PublicLocale = "en" | "es";
type HomeProcessCard = Pick<PublicSceneStep, "label" | "summary">;

const HOME_PROCESS_CARDS: Record<PublicLocale, HomeProcessCard[]> = {
  en: [
    {
      label: "STUDY",
      summary: "We send a simple prep guide so the family can reflect before filming.",
    },
    {
      label: "PREPARE",
      summary: "You take time with the questions, memories, and details that matter.",
    },
    {
      label: "FILM",
      summary: "We capture the conversation calmly, with no pressure to perform.",
    },
    {
      label: "DELIVER",
      summary: "We finish the edit and send a private film the family can keep.",
    },
  ],
  es: [
    {
      label: "ESTUDIAR",
      summary: "Enviamos una guía sencilla para que la familia pueda reflexionar antes de filmar.",
    },
    {
      label: "PREPARAR",
      summary: "Toman tiempo con las preguntas, recuerdos y detalles que importan.",
    },
    {
      label: "FILMAR",
      summary: "Grabamos la conversación con calma, sin presión de actuar.",
    },
    {
      label: "ENTREGAR",
      summary: "Terminamos la edición y enviamos una película privada que la familia puede conservar.",
    },
  ],
};

function getPublicLocale(stepLabelPrefix: string): PublicLocale {
  return stepLabelPrefix.trim().toLocaleLowerCase().startsWith("paso") ? "es" : "en";
}

type InquiryFormState = {
  fullName: string;
  email: string;
  phone: string;
  region: string;
  estimatedBudget: string;
  filmFor: string;
  relationship: string;
  stillLiving: string;
  timeline: string;
  storyImportance: string;
  filmingLocation: string;
  faithContext: string;
  extraNotes: string;
};

const initialInquiryState: InquiryFormState = {
  fullName: "",
  email: "",
  phone: "",
  region: "",
  estimatedBudget: "$12,500",
  filmFor: "",
  relationship: "",
  stillLiving: "",
  timeline: "",
  storyImportance: "",
  filmingLocation: "",
  faithContext: "",
  extraNotes: "",
};

const budgetSliderMin = 5000;
const budgetSliderMax = 25000;
const budgetSliderStep = 500;
const budgetSliderDefault = 12500;

const revealEase = [0.22, 1, 0.36, 1] as const;

const primaryButtonMotion = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.99 },
  transition: { duration: 0.24, ease: measuredEase },
} as const;

function revealDelay(index: number, step = 50): CSSProperties {
  return { "--reveal-delay": `${Math.min(index * step, 260)}ms` } as CSSProperties;
}

function useLiquidSurface(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;

    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let resetTimer = 0;

    const resetVars = () => {
      element.style.setProperty("--pointer-x", "50%");
      element.style.setProperty("--pointer-y", "42%");
      element.style.setProperty("--liquid-tilt-x", "0deg");
      element.style.setProperty("--liquid-tilt-y", "0deg");
    };

    const handleMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
      const pointerY = ((event.clientY - rect.top) / rect.height) * 100;

      element.style.setProperty("--pointer-x", `${pointerX}%`);
      element.style.setProperty("--pointer-y", `${pointerY}%`);
      element.style.setProperty("--liquid-tilt-x", `${(pointerY - 50) * -0.06}deg`);
      element.style.setProperty("--liquid-tilt-y", `${(pointerX - 50) * 0.06}deg`);
    };

    const handleEnter = () => {
      window.clearTimeout(resetTimer);
      element.classList.add("is-liquid-active");
      element.style.transformStyle = "preserve-3d";
      element.style.perspective = "800px";
    };

    const handleLeave = () => {
      element.classList.remove("is-liquid-active");
      resetVars();
      resetTimer = window.setTimeout(() => {
        element.style.transformStyle = "";
        element.style.perspective = "";
      }, 520);
    };

    resetVars();
    element.addEventListener("pointerenter", handleEnter);
    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);

    return () => {
      window.clearTimeout(resetTimer);
      element.removeEventListener("pointerenter", handleEnter);
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
    };
  }, [ref]);
}

function useMagneticButton(ref: RefObject<HTMLElement | null>, strength = 0.35) {
  useEffect(() => {
    const element = ref.current;

    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * strength;
      const y = (event.clientY - rect.top - rect.height / 2) * strength;

      element.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleLeave = () => {
      element.style.transform = "";
      element.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    };

    const handleEnter = () => {
      element.style.transition = "transform 0.15s linear";
    };

    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);
    element.addEventListener("pointerenter", handleEnter);

    return () => {
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
      element.removeEventListener("pointerenter", handleEnter);
    };
  }, [ref, strength]);
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function MagneticButtonFrame({
  children,
  strength = 0.35,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const frameRef = useRef<HTMLSpanElement | null>(null);
  useMagneticButton(frameRef, strength);

  return (
    <span className="apple-cta-magnetic-wrap" ref={frameRef}>
      {children}
    </span>
  );
}

function MagneticPrimaryAnchor({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"a">) {
  return (
    <MagneticButtonFrame>
      <motion.a
        {...props}
        className={`apple-cta apple-cta-primary ${className}`.trim()}
        {...primaryButtonMotion}
      >
        {children}
      </motion.a>
    </MagneticButtonFrame>
  );
}

function MagneticPrimaryButton({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <MagneticButtonFrame>
      <motion.button
        {...props}
        className={`apple-cta apple-cta-primary ${className}`.trim()}
        {...primaryButtonMotion}
      >
        {children}
      </motion.button>
    </MagneticButtonFrame>
  );
}

function MagneticSecondaryAnchor({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"a">) {
  return (
    <MagneticButtonFrame strength={0.28}>
      <motion.a
        {...props}
        className={`apple-cta apple-cta-secondary ${className}`.trim()}
        {...primaryButtonMotion}
      >
        {children}
      </motion.a>
    </MagneticButtonFrame>
  );
}

const detailStaggerReveal = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05, ease: revealEase },
  },
} as const;

const detailItemReveal = {
  hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
  visible: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.48, ease: revealEase },
  },
} as const;

const heroTitleVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
} as const;

const heroTitleWordVariants = {
  hidden: {
    opacity: 0,
    clipPath: "inset(100% 0% 0% 0%)",
    y: 24,
  },
  visible: {
    opacity: 1,
    clipPath: "inset(0% 0% 0% 0%)",
    y: 0,
    transition: { duration: 0.75, ease: revealEase },
  },
} as const;

const processContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
} as const;

const processCardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: revealEase },
  },
} as const;

type ChipMarqueeRowProps = {
  className: string;
  items: string[];
  itemKeyPrefix: string;
  variants?: HTMLMotionProps<"div">["variants"];
  itemVariants?: HTMLMotionProps<"span">["variants"];
};

function ChipMarqueeRow({
  className,
  items,
  itemKeyPrefix,
  variants,
  itemVariants,
}: ChipMarqueeRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    const set = setRef.current;

    if (!row || !set) {
      return;
    }

    let isMounted = true;
    const updateOverflow = () => {
      if (!isMounted) {
        return;
      }

      setIsOverflowing(set.scrollWidth > row.clientWidth + 2);
    };

    updateOverflow();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateOverflow);

      return () => {
        isMounted = false;
        window.removeEventListener("resize", updateOverflow);
      };
    }

    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(row);
    resizeObserver.observe(set);
    document.fonts?.ready.then(updateOverflow).catch(() => undefined);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
    };
  }, [items]);

  const renderChipSet = (isDuplicate = false) => (
    <div
      aria-hidden={isDuplicate ? "true" : undefined}
      className={isDuplicate ? "chip-marquee-set chip-marquee-set-duplicate" : "chip-marquee-set"}
      ref={isDuplicate ? undefined : setRef}
    >
      {items.map((item, index) => (
        isDuplicate ? (
          <span className="ui-chip" key={`${itemKeyPrefix}-duplicate-${index}`}>{item}</span>
        ) : (
          <motion.span className="ui-chip" key={`${itemKeyPrefix}-${index}`} variants={itemVariants}>
            {item}
          </motion.span>
        )
      ))}
    </div>
  );

  return (
    <motion.div
      className={`${className} chip-row chip-marquee`}
      data-overflow={isOverflowing ? "true" : "false"}
      ref={rowRef}
      variants={variants}
    >
      <div className="chip-marquee-track">
        {renderChipSet()}
        {isOverflowing ? renderChipSet(true) : null}
      </div>
    </motion.div>
  );
}

type PublicSectionKey = "hero" | "experience" | "process" | "preserve" | "inquire";
const defaultMediaFallbackSrc = "/visuals/hero-frame.svg";

function normalizeMediaImageSource(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || defaultMediaFallbackSrc;
}

function isPublicSectionKey(value: string | undefined): value is PublicSectionKey {
  return value === "hero"
    || value === "experience"
    || value === "process"
    || value === "preserve"
    || value === "inquire";
}

function getAtmosphereSectionForId(id: ImmersiveSectionId): PublicSectionKey {
  switch (id) {
    case "the-experience":
      return "experience";
    case "how-it-works":
      return "process";
    case "what-we-preserve":
      return "preserve";
    case "inquire":
      return "inquire";
    case "home":
    default:
      return "hero";
  }
}

function usePublicAtmosphereSection() {
  const [activeSection, setActiveSection] = useState<PublicSectionKey>("hero");

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-atmosphere-section]"),
    );

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const nextSection = visible?.target instanceof HTMLElement
          ? visible.target.dataset.atmosphereSection
          : undefined;

        if (isPublicSectionKey(nextSection)) {
          setActiveSection(nextSection);
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -46% 0px",
        threshold: [0.12, 0.28, 0.52],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.activeArchiveSection = activeSection;

    return () => {
      delete document.documentElement.dataset.activeArchiveSection;
    };
  }, [activeSection]);

  return activeSection;
}

function useMinimalPublicRevealMotion() {
  useEffect(() => {
    const motionSelector = ".motion-eyebrow, .motion-title, .motion-copy, .motion-card, .motion-media";
    const motionSections = Array.from(
      document.querySelectorAll<HTMLElement>(".public-visual-scope [data-motion-section], .public-visual-scope .motion-section"),
    );
    const sectionTargets = Array.from(
      document.querySelectorAll<HTMLElement>(".public-visual-scope .motion-section"),
    );

    motionSections.forEach((section) => {
      const sectionMotionElements = Array.from(
        section.querySelectorAll<HTMLElement>(motionSelector),
      );

      sectionMotionElements.forEach((element, index) => {
        element.setAttribute("data-reveal", "");
        element.style.setProperty("--reveal-delay", `${index * 80}ms`);
      });
    });

    const elements = Array.from(
      new Set([
        ...Array.from(document.querySelectorAll<HTMLElement>(".public-visual-scope [data-reveal]")),
        ...Array.from(document.querySelectorAll<HTMLElement>(`.public-visual-scope :is(${motionSelector})`)),
      ]),
    ).filter((element) => !element.classList.contains("motion-section"));
    const observedElements = Array.from(new Set([...elements, ...sectionTargets]));

    if (!observedElements.length) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pending = new Set(observedElements);

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      observedElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    let frame = 0;
    const timers: number[] = [];
    document.documentElement.classList.add("capsoul-reveal-ready");

    const prepareReveal = (element: HTMLElement) => {
      if (element.classList.contains("motion-section")) {
        return;
      }

      element.classList.add("capsoul-reveal-pending");
    };

    const revealElement = (element: HTMLElement) => {
      element.classList.add("is-visible");
      element.classList.remove("capsoul-reveal-pending");
    };

    observedElements.forEach(prepareReveal);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) {
            return;
          }

          revealElement(entry.target);
          pending.delete(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.14,
      },
    );

    observedElements.forEach((element) => observer.observe(element));

    const revealVisibleElements = () => {
      const triggerY = window.innerHeight * 0.9;

      pending.forEach((element) => {
        const rect = element.getBoundingClientRect();

        if (rect.top <= triggerY && rect.bottom >= -24) {
          revealElement(element);
          pending.delete(element);
          observer.unobserve(element);
        }
      });

      frame = 0;
    };

    const scheduleReveal = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(revealVisibleElements);
    };

    revealVisibleElements();
    scheduleReveal();
    timers.push(window.setTimeout(revealVisibleElements, 80));
    timers.push(window.setTimeout(revealVisibleElements, 240));
    window.addEventListener("scroll", scheduleReveal, { passive: true });
    window.addEventListener("resize", scheduleReveal);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      document.documentElement.classList.remove("capsoul-reveal-ready");
      observedElements.forEach((element) => {
        element.classList.remove("capsoul-reveal-pending");
      });
      window.removeEventListener("scroll", scheduleReveal);
      window.removeEventListener("resize", scheduleReveal);
    };
  }, []);
}

function formatBudgetValue(value: number) {
  if (value >= budgetSliderMax) {
    return "$25,000+";
  }

  return `$${value.toLocaleString("en-US")}`;
}

function parseBudgetValue(value: string) {
  const numeric = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  if (Number.isNaN(numeric)) {
    return budgetSliderDefault;
  }

  return Math.min(Math.max(numeric, budgetSliderMin), budgetSliderMax);
}

function getHeaderOffset() {
  if (typeof window === "undefined") {
    return 96;
  }

  const main = document.getElementById("main-content");
  const paddingTop = main ? Number.parseFloat(window.getComputedStyle(main).paddingTop) : Number.NaN;

  return Number.isFinite(paddingTop) ? paddingTop : 96;
}

function scrollToPublicSection(id: ImmersiveSectionId, behavior?: ScrollBehavior) {
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() + 8);

  window.scrollTo({
    top,
    behavior: behavior ?? (prefersReducedMotion ? "auto" : "smooth"),
  });
}

function usePublicActiveSection(
  sections: Array<{ id: ImmersiveSectionId; label: string }>,
) {
  const [activeId, setActiveId] = useState<ImmersiveSectionId>(sections[0]?.id ?? "home");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible?.target.id || !isImmersiveSectionId(visible.target.id)) {
          return;
        }

        setActiveId(visible.target.id);
      },
      {
        root: null,
        rootMargin: "-34% 0px -46% 0px",
        threshold: [0.12, 0.32, 0.58],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const index = sections.findIndex((section) => section.id === activeId);
    const section = sections[index];
    const href = section ? getImmersiveRouteForSection(section.id) : null;

    if (!section || !href) {
      return;
    }

    dispatchImmersiveSectionChange({
      id: section.id,
      index,
      label: section.label,
      href,
    });
  }, [activeId, sections]);

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      const id = detail?.id;

      if (!id || !isImmersiveSectionId(id)) {
        return;
      }

      scrollToPublicSection(id);
      setActiveId(id);
    };

    window.addEventListener(IMMERSIVE_SECTION_NAVIGATE_EVENT, handleNavigate);

    return () => {
      window.removeEventListener(IMMERSIVE_SECTION_NAVIGATE_EVENT, handleNavigate);
    };
  }, []);

  return activeId;
}

function useSectionLink() {
  return useCallback((href: string, event: MouseEvent<HTMLAnchorElement>) => {
    const sectionId = getImmersiveSectionForRoute(href);

    if (!sectionId || window.location.pathname !== "/") {
      return;
    }

    event.preventDefault();
    scrollToPublicSection(sectionId);
  }, []);
}

function ArchiveSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  id: ImmersiveSectionId;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  const motion =
    id === "the-experience"
      ? { variant: "experience" as const, className: "premium-section-motion-experience-section" }
      : id === "how-it-works"
        ? { variant: "process" as const, className: "premium-section-motion-process-section" }
        : id === "what-we-preserve"
          ? { variant: "preserve" as const, className: "premium-section-motion-preserve-section" }
          : id === "inquire"
            ? { variant: "inquire" as const, className: "premium-section-motion-inquire-section" }
            : null;
  const sectionContent = (
    <>
      <SectionKicker>
        {eyebrow}
      </SectionKicker>
      <h2 className="apple-section-title motion-title" data-reveal style={revealDelay(1)}>
        {title}
      </h2>
      <p className="apple-section-copy motion-copy" data-reveal style={revealDelay(2)}>
        {description}
      </p>
      <div className="apple-section-body motion-card">
        {children}
      </div>
    </>
  );

  return (
    <section
      id={id}
      data-archive-section
      data-atmosphere-section={getAtmosphereSectionForId(id)}
      data-motion-section
      className={`apple-section motion-section ${className}`.trim()}
      data-reveal
    >
      {motion ? (
        <PremiumSectionMotion
          variant={motion.variant}
          className={`apple-section-inner motion-section-flow ${motion.className}`}
        >
          {sectionContent}
        </PremiumSectionMotion>
      ) : (
        <div className="apple-section-inner motion-section-flow">
          {sectionContent}
        </div>
      )}
    </section>
  );
}

function SectionKicker({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.88, filter: "blur(4px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: revealEase }}
      className="apple-section-kicker motion-eyebrow"
      data-reveal
    >
      {children}
    </motion.div>
  );
}

function ArchiveVisualFrame({
  image,
  fallbackImage,
  label,
  caption,
  indexLabel,
  objectPosition = "center center",
  priority = false,
  showToolbar = true,
}: {
  image: string;
  fallbackImage?: string;
  label: string;
  caption: string;
  indexLabel?: string;
  objectPosition?: string;
  priority?: boolean;
  showToolbar?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const initialImage = normalizeMediaImageSource(image);
  const fallbackSrc = normalizeMediaImageSource(fallbackImage);
  const imageAltLabel = label || indexLabel || caption || "Archive";
  const [renderedImage, setRenderedImage] = useState(initialImage);
  const [imageFailed, setImageFailed] = useState(false);
  useLiquidSurface(frameRef);

  useEffect(() => {
    setRenderedImage(initialImage);
    setImageFailed(false);
  }, [initialImage]);

  function handleImageError() {
    if (renderedImage !== fallbackSrc) {
      setRenderedImage(fallbackSrc);
      setImageFailed(false);
      return;
    }

    setImageFailed(true);
  }

  return (
    <div className="apple-visual-frame apple-liquid-surface liquid-glass-panel capsoul-glass" ref={frameRef}>
      <span className="apple-liquid-layer" aria-hidden="true" />
      {showToolbar ? (
        <div className="apple-visual-toolbar">
          <span>{label}</span>
          {indexLabel ? <span>{indexLabel}</span> : null}
        </div>
      ) : null}
      <div className="apple-visual-image-wrap">
        {imageFailed ? null : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={renderedImage}
            alt={`${imageAltLabel} visual`}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            onError={handleImageError}
            style={{ objectPosition }}
          />
        )}
      </div>
      <p>{caption}</p>
    </div>
  );
}

function HeroHeadline({ style, title }: { style?: MotionStyle; title: string }) {
  const [isReady, setIsReady] = useState(false);
  const words = useMemo(() => title.split(/\s+/).filter(Boolean), [title]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.h1
        animate={isReady ? "visible" : "hidden"}
        className="apple-hero-title"
        initial="hidden"
        key={title}
        aria-label={title}
        style={style}
        variants={heroTitleVariants}
      >
        {words.map((word, index) => (
          <span
            className="apple-hero-title-word-wrap"
            key={`${word}-${index}`}
          >
            <motion.span
              className="apple-hero-title-word"
              variants={heroTitleWordVariants}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.h1>
    </AnimatePresence>
  );
}

function ArchiveHero({
  home,
  stepLabelPrefix,
}: {
  home: ResolvedSceneContent;
  stepLabelPrefix: string;
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  const heroRecordRef = useRef<HTMLDivElement | null>(null);
  const handleLink = useSectionLink();
  const reduceMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const recordY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -55]);
  const chaptersY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -28]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -18]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -10]);
  const locale = getPublicLocale(stepLabelPrefix);
  const heroStep = home.steps[0];
  const processCards = HOME_PROCESS_CARDS[locale];
  const processStepPrefix = stepLabelPrefix.toLocaleUpperCase();
  useLiquidSurface(heroRecordRef);

  return (
    <section
      id="home"
      data-archive-section
      data-atmosphere-section="hero"
      data-motion-section
      className="apple-hero motion-section"
      data-reveal
      ref={heroRef}
    >
      <PremiumSectionMotion variant="hero" className="apple-hero-inner motion-section-flow">
        <SectionKicker>
          {home.eyebrow}
        </SectionKicker>
        <HeroHeadline title={home.title} style={{ y: titleY }} />
        <motion.p className="apple-hero-copy" style={{ y: copyY }}>
          {home.description}
        </motion.p>
        <div className="apple-hero-actions motion-card" data-reveal style={revealDelay(3)}>
          {home.primaryAction ? (
            <MagneticPrimaryAnchor
              href={home.primaryAction.href}
              onClick={(event) => handleLink(home.primaryAction?.href ?? "", event)}
            >
              {home.primaryAction.label}
            </MagneticPrimaryAnchor>
          ) : null}
          {home.secondaryAction ? (
            <MagneticSecondaryAnchor href={home.secondaryAction.href} onClick={(event) => handleLink(home.secondaryAction?.href ?? "", event)}>
              {home.secondaryAction.label}
            </MagneticSecondaryAnchor>
          ) : null}
        </div>
        <div className="apple-hero-stage">
          <motion.div className="apple-hero-record-parallax" style={{ y: recordY }}>
            <motion.div
              animate={reduceMotion || !isDesktop ? undefined : { y: [0, -8, 0] }}
              className="apple-hero-record apple-liquid-surface liquid-glass-panel capsoul-glass"
              data-reveal
              ref={heroRecordRef}
              style={revealDelay(4)}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            >
              <span className="apple-liquid-layer" aria-hidden="true" />
              <ArchiveVisualFrame
                image={heroStep.image}
                fallbackImage={heroStep.fallbackImage}
                label={heroStep.mediaLabel}
                caption={heroStep.mediaCaption}
                objectPosition={heroStep.objectPosition}
                priority
                showToolbar={false}
              />
            </motion.div>
          </motion.div>
          <motion.div
            className="apple-hero-chapters capsoul-glass"
            aria-label="Opening process steps"
            style={{ y: chaptersY }}
          >
            {processCards.map((step, index) => (
              <div
                className="apple-hero-chapter apple-liquid-surface liquid-glass-panel capsoul-glass"
                key={`hero-chapter-${index}`}
                data-reveal
                style={revealDelay(index + 5)}
              >
                <span className="apple-liquid-layer" aria-hidden="true" />
                <span>{processStepPrefix} {index + 1}</span>
                <strong>{step.label}</strong>
                <p>{step.summary}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </PremiumSectionMotion>
    </section>
  );
}

function formatRailLabel(value: string) {
  return value.replace(/\.$/, "");
}

function getSectionElementIdForKey(key: PublicSectionKey): ImmersiveSectionId {
  switch (key) {
    case "experience":
      return "the-experience";
    case "process":
      return "how-it-works";
    case "preserve":
      return "what-we-preserve";
    case "inquire":
      return "inquire";
    case "hero":
    default:
      return "home";
  }
}

function ArchiveIndexLine({
  items,
  activeKey,
}: {
  items: Array<{ key: PublicSectionKey; label: string }>;
  activeKey: PublicSectionKey;
}) {
  const { scrollY } = useScroll();
  const activeIndex = Math.max(0, items.findIndex((item) => item.key === activeKey));
  const activeLabel = items[activeIndex]?.label ?? items[0]?.label ?? "";
  const denominator = Math.max(1, items.length - 1);
  const markerTop = useTransform(scrollY, (latest) => {
    if (typeof document === "undefined") {
      return `${(activeIndex / denominator) * 100}%`;
    }

    const viewportProgress = items
      .map((item, index) => {
        const section = document.getElementById(getSectionElementIdForKey(item.key));

        if (!section) {
          return null;
        }

        const rect = section.getBoundingClientRect();
        const sectionTop = latest + rect.top;
        const travel = Math.max(1, section.offsetHeight - window.innerHeight * 0.35);
        const progress = Math.min(1, Math.max(0, (latest - sectionTop + window.innerHeight * 0.18) / travel));

        return {
          index,
          progress,
          top: sectionTop,
          bottom: sectionTop + section.offsetHeight,
        };
      })
      .filter((item): item is { index: number; progress: number; top: number; bottom: number } => Boolean(item));

    const current = viewportProgress.find((section) => latest >= section.top - window.innerHeight * 0.2 && latest < section.bottom - window.innerHeight * 0.2)
      ?? viewportProgress.reduce((closest, section) => {
        if (!closest) {
          return section;
        }

        return Math.abs(latest - section.top) < Math.abs(latest - closest.top) ? section : closest;
      }, null as { index: number; progress: number; top: number; bottom: number } | null);

    if (!current) {
      return `${(activeIndex / denominator) * 100}%`;
    }

    const start = (current.index / denominator) * 100;
    const end = (Math.min(items.length - 1, current.index + 1) / denominator) * 100;

    return `${start + (end - start) * current.progress}%`;
  });

  return (
    <motion.div
      className="apple-archive-index"
      aria-hidden="true"
      style={{ "--archive-marker-top": markerTop } as MotionStyle}
    >
      <span className="apple-archive-index-label">{activeLabel}</span>
      <div className="apple-archive-index-track">
        <i className="apple-archive-index-marker" />
        {items.map((item, index) => (
          <span
            key={item.key}
            className={activeKey === item.key ? "apple-archive-index-step apple-archive-index-step-active" : "apple-archive-index-step"}
            style={{ "--archive-step-top": `${(index / denominator) * 100}%` } as CSSProperties}
          />
        ))}
      </div>
    </motion.div>
  );
}

function PublicAdminAccess({ label }: { label: string }) {
  return (
    <div className="apple-admin-access">
      <a href="/admin" aria-label={`${label} access`}>
        {label}
      </a>
    </div>
  );
}

function ArchiveSceneModule({
  scene,
  sectionLabel,
}: {
  scene: ResolvedSceneContent;
  sectionLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const active = scene.steps[activeIndex] ?? scene.steps[0];
  const transition = reduceMotion ? { duration: 0 } : contentSwapTransition;

  const selectIndex = useCallback((nextIndex: number) => {
    const clamped = Math.min(scene.steps.length - 1, Math.max(0, nextIndex));

    setDirection(clamped >= activeIndex ? 1 : -1);
    setActiveIndex(clamped);
  }, [activeIndex, scene.steps.length]);

  const previous = () => selectIndex(activeIndex - 1);
  const next = () => selectIndex(activeIndex + 1);

  if (!active) {
    return null;
  }

  return (
    <div className="apple-scene-module motion-stagger">
      <div className="apple-record-feature liquid-glass-panel capsoul-glass motion-media" data-reveal style={revealDelay(1)}>
        <div className="experience-content-container">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`experience-feature-${activeIndex}`}
              className="apple-record-feature-content"
              custom={direction}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
              transition={reduceMotion ? { duration: 0 } : { ...transition, duration: 0.56 }}
            >
              <ArchiveVisualFrame
                image={active.image}
                fallbackImage={active.fallbackImage}
                label={active.mediaLabel}
                caption={active.mediaCaption}
                indexLabel={active.label}
                objectPosition={active.objectPosition}
              />
              <motion.div
                className="apple-record-detail"
                variants={detailStaggerReveal}
                initial="hidden"
                animate="visible"
              >
                <motion.span variants={detailItemReveal}>{sectionLabel}</motion.span>
                <motion.h3 variants={detailItemReveal}>{active.title}</motion.h3>
                <motion.p variants={detailItemReveal}>{active.detail}</motion.p>
                <ChipMarqueeRow
                  className="apple-record-tags"
                  itemKeyPrefix={`experience-tag-${activeIndex}`}
                  itemVariants={detailItemReveal}
                  items={active.bullets}
                  variants={detailStaggerReveal}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
        <CompactSceneControls
          className="apple-scene-controls"
          labels={scene.steps.map((step) => step.title)}
          activeIndex={activeIndex}
          onSelect={selectIndex}
          onPrevious={previous}
          onNext={next}
          previousDisabled={activeIndex === 0}
          nextDisabled={activeIndex === scene.steps.length - 1}
          showArrows
        />
      </div>
    </div>
  );
}

function ProcessStepCard({
  step,
  index,
}: {
  step: PublicSceneStep;
  index: number;
}) {
  return (
    <motion.article
      className="apple-process-card apple-liquid-surface liquid-glass-panel capsoul-glass how-it-works-card"
      key={`process-step-${index}`}
      data-reveal
      variants={processCardVariants}
      style={{
        "--motion-stagger-index": index,
        "--reveal-delay": `${Math.min(index * 50, 260)}ms`,
      } as CSSProperties}
    >
      <span className="apple-liquid-layer" aria-hidden="true" />
      <span>{String(index + 1).padStart(2, "0")}</span>
      <h3>{step.label}</h3>
      <p>{step.detail}</p>
    </motion.article>
  );
}

function ProcessTimeline({
  process,
}: {
  process: ResolvedSceneContent;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isResettingScrollRef = useRef(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrollReady, setIsScrollReady] = useState(false);

  const syncActiveIndex = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const cards = Array.from(scroller.querySelectorAll<HTMLElement>(".apple-process-card"));

    if (cards.length === 0) {
      setActiveIndex(0);
      return;
    }

    const scrollerStyle = window.getComputedStyle(scroller);
    const gap = Number.parseFloat(scrollerStyle.columnGap || scrollerStyle.gap || "0");
    const cardWidth = cards[0]?.getBoundingClientRect().width ?? 0;
    const stepWidth = Math.max(1, cardWidth + gap);
    const maxIndex = cards.length - 1;
    const nextIndex = Math.min(maxIndex, Math.max(0, Math.round(scroller.scrollLeft / stepWidth)));

    setActiveIndex(nextIndex);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;
    let resetFrame = 0;
    let releaseFrame = 0;

    isResettingScrollRef.current = true;

    if (scroller) {
      scroller.scrollLeft = 0;
    }

    setIsScrollReady(false);
    setActiveIndex(0);

    resetFrame = window.requestAnimationFrame(() => {
      if (scroller) {
        scroller.scrollLeft = 0;
      }

      setActiveIndex(0);
      releaseFrame = window.requestAnimationFrame(() => {
        isResettingScrollRef.current = false;
        setIsScrollReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.cancelAnimationFrame(releaseFrame);
    };
  }, [process.steps.length]);

  return (
    <div className="apple-process-shell">
      <motion.div
        ref={scrollerRef}
        className="apple-process-grid motion-stagger"
        data-scroll-ready={isScrollReady ? "true" : "false"}
        initial="hidden"
        variants={processContainerVariants}
        viewport={{ once: true, margin: "-12%" }}
        whileInView="visible"
        onScroll={() => {
          if (isResettingScrollRef.current) {
            const scroller = scrollerRef.current;

            if (scroller) {
              scroller.scrollLeft = 0;
            }

            setActiveIndex(0);
            return;
          }

          syncActiveIndex();
        }}
      >
        {process.steps.map((step, index) => (
          <ProcessStepCard
            key={`process-step-${index}`}
            step={step}
            index={index}
          />
        ))}
      </motion.div>
      <div className="apple-process-scroll-cue" aria-hidden="true">
        <div className="process-drag-cue">
          <motion.div
            animate={{ scaleX: [0.4, 1, 0.4] }}
            className="process-drag-line"
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            animate={{ x: [0, 6, 0] }}
            className="process-drag-arrow"
            transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, delay: 0.3 }}
          >
            →
          </motion.div>
        </div>
        <span className="apple-process-scroll-dots">
          {process.steps.map((step, index) => (
            <span
              key={`process-cue-${step.label}-${index}`}
              className={index === activeIndex ? "apple-process-scroll-dot apple-process-scroll-dot-active" : "apple-process-scroll-dot"}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function PreserveEditorial({ preserve }: { preserve: ResolvedSceneContent }) {
  const featuredRef = useRef<HTMLElement | null>(null);
  const featured = preserve.steps[0];
  const remaining = preserve.steps.slice(1);
  useLiquidSurface(featuredRef);

  return (
    <div className="apple-preserve-layout motion-stagger">
      {featured ? (
        <article
          className="apple-preserve-feature apple-liquid-surface liquid-glass-panel capsoul-glass motion-media"
          data-reveal
          ref={featuredRef}
        >
          <span className="apple-liquid-layer" aria-hidden="true" />
          <span>{featured.mediaLabel}</span>
          <h3>{featured.title}</h3>
          <p>{featured.detail}</p>
          <ChipMarqueeRow
            className="apple-record-tags"
            itemKeyPrefix="preserve-feature-tag"
            itemVariants={detailItemReveal}
            items={featured.bullets}
            variants={detailStaggerReveal}
          />
        </article>
      ) : null}
      <motion.div
        className="apple-preserve-grid"
        initial="hidden"
        variants={processContainerVariants}
        viewport={{ once: true, margin: "-8%" }}
        whileInView="visible"
      >
        {remaining.map((step, index) => (
          <motion.article
            className="apple-preserve-card apple-liquid-surface liquid-glass-panel capsoul-glass"
            key={`preserve-card-${index}`}
            data-reveal
            variants={processCardVariants}
            style={{
              "--motion-stagger-index": index + 1,
              "--reveal-delay": `${Math.min((index + 1) * 50, 260)}ms`,
            } as CSSProperties}
          >
            <span className="apple-liquid-layer" aria-hidden="true" />
            <span>{step.label}</span>
            <h3>{step.title}</h3>
            <p>{step.summary}</p>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}

function InquiryArchiveForm({
  inquiry,
}: {
  inquiry: ResolvedInquiryContent;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState<InquiryFormState>(initialInquiryState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const activeFormStep = inquiry.formSteps[activeIndex] ?? inquiry.formSteps[0];
  const activeSupport = inquiry.supportStates[activeIndex] ?? inquiry.supportStates[0];
  const fieldCopy = inquiry.fieldCopy;
  const estimatedBudgetValue = parseBudgetValue(formState.estimatedBudget);
  const estimatedBudgetProgress =
    ((estimatedBudgetValue - budgetSliderMin) / (budgetSliderMax - budgetSliderMin)) * 100;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    setFormState((current) => ({
      ...current,
      estimatedBudget: formatBudgetValue(nextValue),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setSubmitError(payload.error ?? "Unable to save your inquiry.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Unable to save your inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFields = () => {
    if (activeIndex === 0) {
      return (
        <div className="apple-form-grid">
          <Field label={fieldCopy.fullNameLabel} id="fullName">
            <input className="apple-input" id="fullName" name="fullName" onChange={handleChange} placeholder={fieldCopy.fullNamePlaceholder} required value={formState.fullName} />
          </Field>
          <Field label={fieldCopy.emailLabel} id="email">
            <input className="apple-input" id="email" name="email" onChange={handleChange} placeholder={fieldCopy.emailPlaceholder} required type="email" value={formState.email} />
          </Field>
          <Field label={fieldCopy.phoneLabel} id="phone">
            <input className="apple-input" id="phone" name="phone" onChange={handleChange} placeholder={fieldCopy.phonePlaceholder} value={formState.phone} />
          </Field>
          <Field label={fieldCopy.regionLabel} id="region">
            <input className="apple-input" id="region" name="region" onChange={handleChange} placeholder={fieldCopy.regionPlaceholder} value={formState.region} />
          </Field>
          <div className="apple-budget-shell" style={{ "--budget-progress": `${estimatedBudgetProgress}%` } as CSSProperties}>
            <div className="apple-budget-top">
              <label htmlFor="estimatedBudget">{fieldCopy.fullNameLabel === "Full Name" ? "Estimated budget" : "Presupuesto estimado"}</label>
              <span>{formState.estimatedBudget}</span>
            </div>
            <div className="apple-budget-track">
              <div className="apple-budget-progress" />
              <input
                id="estimatedBudget"
                name="estimatedBudget"
                type="range"
                min={budgetSliderMin}
                max={budgetSliderMax}
                step={budgetSliderStep}
                value={estimatedBudgetValue}
                onChange={handleBudgetChange}
                className="apple-budget-input"
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeIndex === 1) {
      return (
        <div className="apple-form-grid">
          <Field label={fieldCopy.filmForLabel} id="filmFor">
            <input className="apple-input" id="filmFor" name="filmFor" onChange={handleChange} placeholder={fieldCopy.filmForPlaceholder} required value={formState.filmFor} />
          </Field>
          <Field label={fieldCopy.relationshipLabel} id="relationship">
            <input className="apple-input" id="relationship" name="relationship" onChange={handleChange} placeholder={fieldCopy.relationshipPlaceholder} required value={formState.relationship} />
          </Field>
          <Field label={fieldCopy.stillLivingLabel} id="stillLiving">
            <select className="apple-input" id="stillLiving" name="stillLiving" onChange={handleChange} required value={formState.stillLiving}>
              <option value="">{fieldCopy.stillLivingPlaceholder}</option>
              <option value={fieldCopy.stillLivingYes}>{fieldCopy.stillLivingYes}</option>
              <option value={fieldCopy.stillLivingNo}>{fieldCopy.stillLivingNo}</option>
              <option value={fieldCopy.stillLivingPreferNot}>{fieldCopy.stillLivingPreferNot}</option>
            </select>
          </Field>
          <Field label={fieldCopy.timelineLabel} id="timeline">
            <input className="apple-input" id="timeline" name="timeline" onChange={handleChange} placeholder={fieldCopy.timelinePlaceholder} value={formState.timeline} />
          </Field>
          <Field label={fieldCopy.storyImportanceLabel} id="storyImportance" wide>
            <textarea className="apple-input apple-textarea" id="storyImportance" name="storyImportance" onChange={handleChange} placeholder={fieldCopy.storyImportancePlaceholder} required value={formState.storyImportance} />
          </Field>
        </div>
      );
    }

    return (
      <div className="apple-form-grid">
        <Field label={fieldCopy.filmingLocationLabel} id="filmingLocation">
          <input className="apple-input" id="filmingLocation" name="filmingLocation" onChange={handleChange} placeholder={fieldCopy.filmingLocationPlaceholder} value={formState.filmingLocation} />
        </Field>
        <Field label={fieldCopy.faithContextLabel} id="faithContext">
          <select className="apple-input" id="faithContext" name="faithContext" onChange={handleChange} value={formState.faithContext}>
            <option value="">{fieldCopy.faithContextPlaceholder}</option>
            <option value="central">{fieldCopy.faithContextCentral}</option>
            <option value="present">{fieldCopy.faithContextPresent}</option>
            <option value="not-really">{fieldCopy.faithContextNotReally}</option>
            <option value="not-sure">{fieldCopy.faithContextNotSure}</option>
          </select>
        </Field>
        <Field label={fieldCopy.extraNotesLabel} id="extraNotes" wide>
          <textarea className="apple-input apple-textarea" id="extraNotes" name="extraNotes" onChange={handleChange} placeholder={fieldCopy.extraNotesPlaceholder} value={formState.extraNotes} />
        </Field>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="apple-inquiry-success">
        <span>{inquiry.successEyebrow}</span>
        <h3>{inquiry.successTitle}</h3>
        <p>{inquiry.successBody}</p>
        <MagneticPrimaryButton
          type="button"
          onClick={() => {
            setSubmitted(false);
            setActiveIndex(0);
            setFormState(initialInquiryState);
          }}
        >
          {inquiry.successResetLabel}
        </MagneticPrimaryButton>
      </div>
    );
  }

  return (
    <div className="apple-inquiry-layout motion-stagger">
      <form
        className="apple-inquiry-form liquid-glass-panel capsoul-glass"
        onSubmit={handleSubmit}
        data-reveal
      >
        <div
          className="apple-inquiry-tabs"
          role="tablist"
          aria-label={inquiry.progressionLabel}
          style={{
            "--inquiry-active-index": activeIndex,
            "--inquiry-active-offset": `calc(${activeIndex} * ((100% - 1.3rem) / 3 + 0.65rem))`,
          } as CSSProperties}
        >
          {inquiry.formSteps.map((step, index) => (
            <button
              key={`inquiry-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              className={activeIndex === index ? "apple-inquiry-tab apple-inquiry-tab-active" : "apple-inquiry-tab"}
              onClick={() => setActiveIndex(index)}
            >
              {step.chip}
            </button>
          ))}
        </div>
        <div className="apple-inquiry-copy">
          <span>{activeSupport?.label}</span>
          <h3>{activeFormStep?.title}</h3>
          <p>{activeFormStep?.description}</p>
        </div>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`fields-${activeIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: measuredEase }}
          >
            {renderFields()}
          </motion.div>
        </AnimatePresence>
        {submitError ? <p className="apple-form-error">{submitError}</p> : null}
        <div className="apple-inquiry-actions">
          <button
            type="button"
            className="apple-cta apple-cta-secondary"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
          >
            {inquiry.previousButtonLabel}
          </button>
          {activeIndex < inquiry.formSteps.length - 1 ? (
            <MagneticPrimaryButton
              type="button"
              onClick={() => setActiveIndex((current) => Math.min(inquiry.formSteps.length - 1, current + 1))}
            >
              {inquiry.nextButtonLabel}
            </MagneticPrimaryButton>
          ) : (
            <MagneticPrimaryButton
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? fieldCopy.submittingLabel : inquiry.submitButtonLabel}
            </MagneticPrimaryButton>
          )}
        </div>
        <p className="apple-inquiry-note">{inquiry.footerNote}</p>
      </form>

      <aside
        className="apple-inquiry-support liquid-glass-panel capsoul-glass motion-media"
        data-reveal
        style={revealDelay(1, 80)}
      >
        <AnimatePresence initial={false} mode="wait">
          {activeSupport ? (
            <motion.div
              key={`inquiry-support-${activeIndex}`}
              initial={{ opacity: 0, y: 16, scale: 0.988 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.996 }}
              transition={{ duration: 0.34, ease: measuredEase }}
            >
              <ArchiveVisualFrame
                image={activeSupport.image}
                fallbackImage={activeSupport.fallbackImage}
                label={activeSupport.label}
                caption={activeSupport.body}
                indexLabel={inquiry.progressionLabel}
                objectPosition={activeSupport.objectPosition}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <ChipMarqueeRow
          className="apple-trust-grid"
          itemKeyPrefix="trust-point"
          items={inquiry.trustPoints}
        />
      </aside>
    </div>
  );
}

function Field({
  label,
  id,
  children,
  wide = false,
}: {
  label: string;
  id: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "apple-field apple-field-wide" : "apple-field"}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export function PublicExperience({
  globalContent,
  home,
  experience,
  process,
  preserve,
  inquiry,
}: PublicExperienceProps) {
  const pathname = usePathname();
  const sections = useMemo<Array<{ id: ImmersiveSectionId; label: string }>>(
    () => [
      { id: "home", label: globalContent.navigation.home },
      { id: "the-experience", label: globalContent.navigation.experience },
      { id: "how-it-works", label: globalContent.navigation.process },
      { id: "what-we-preserve", label: globalContent.navigation.preserve },
      { id: "inquire", label: globalContent.navigation.inquire },
    ],
    [globalContent.navigation],
  );
  const activeId = usePublicActiveSection(sections);
  const activeAtmosphereSection = usePublicAtmosphereSection();
  useMinimalPublicRevealMotion();
  const processStepLabelPrefix = globalContent.navigation.home === "Inicio" ? "Paso" : "Step";
  const railItems = useMemo<Array<{ key: PublicSectionKey; label: string }>>(
    () => [
      { key: "hero", label: formatRailLabel(home.title) },
      { key: "experience", label: formatRailLabel(experience.title) },
      { key: "process", label: formatRailLabel(process.title) },
      { key: "preserve", label: formatRailLabel(preserve.title) },
      { key: "inquire", label: formatRailLabel(inquiry.title) },
    ],
    [experience.title, home.title, inquiry.title, preserve.title, process.title],
  );

  useEffect(() => {
    const sectionId = getImmersiveSectionForRoute(pathname ?? "/");

    if (!sectionId || sectionId === "home") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      scrollToPublicSection(sectionId, "auto");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const handleSectionNav = useCallback((sectionId: ImmersiveSectionId) => {
    const scope = document.querySelector<HTMLElement>(".public-visual-scope");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!scope || prefersReducedMotion) {
      scrollToPublicSection(sectionId);
      return;
    }

    scope.style.transition = "filter 0.22s ease";
    scope.style.filter = "blur(4px)";

    window.setTimeout(() => {
      scrollToPublicSection(sectionId);

      window.setTimeout(() => {
        scope.style.filter = "";
      }, 220);
    }, 120);
  }, []);

  return (
    <div className="apple-archive-experience" data-active-section={activeAtmosphereSection}>
      <ArchiveIndexLine items={railItems} activeKey={activeAtmosphereSection} />

      <nav className="apple-side-nav" aria-label="Section navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={activeId === section.id ? "apple-side-dot apple-side-dot-active" : "apple-side-dot"}
            aria-label={`Go to ${section.label} section`}
            aria-current={activeId === section.id ? "page" : undefined}
            onClick={() => handleSectionNav(section.id)}
          >
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      <ArchiveHero home={home} stepLabelPrefix={processStepLabelPrefix} />

      <ArchiveSection
        id="the-experience"
        eyebrow={experience.eyebrow}
        title={experience.title}
        description={experience.description}
        className="apple-section-contrast"
      >
        <ArchiveSceneModule scene={experience} sectionLabel={experience.stageLabel} />
      </ArchiveSection>

      <ArchiveSection
        id="how-it-works"
        eyebrow={process.eyebrow}
        title={process.title}
        description={process.description}
      >
        <ProcessTimeline process={process} />
      </ArchiveSection>

      <ArchiveSection
        id="what-we-preserve"
        eyebrow={preserve.eyebrow}
        title={preserve.title}
        description={preserve.description}
        className="apple-section-editorial"
      >
        <PreserveEditorial preserve={preserve} />
      </ArchiveSection>

      <ArchiveSection
        id="inquire"
        eyebrow={inquiry.eyebrow}
        title={inquiry.title}
        description={inquiry.description}
        className="apple-section-inquiry"
      >
        <InquiryArchiveForm inquiry={inquiry} />
        <PublicAdminAccess label={globalContent.adminEntryLabel} />
      </ArchiveSection>
    </div>
  );
}
