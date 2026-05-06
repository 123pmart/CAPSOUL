"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
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
import { useCardTiltMotion, useMagneticMotion } from "@/components/use-magnetic-motion";
import type {
  GlobalSiteContent,
  ResolvedInquiryContent,
  ResolvedSceneContent,
} from "@/lib/site-content-schema";

type PublicExperienceProps = {
  globalContent: GlobalSiteContent;
  home: ResolvedSceneContent;
  experience: ResolvedSceneContent;
  process: ResolvedSceneContent;
  preserve: ResolvedSceneContent;
  inquiry: ResolvedInquiryContent;
};

type PublicSceneStep = ResolvedSceneContent["steps"][number];

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

const sectionReveal = {
  hidden: { opacity: 0, y: 64, scale: 0.965 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.98, ease: revealEase, staggerChildren: 0.16, delayChildren: 0.08 },
  },
} as const;

const archiveChildReveal = {
  hidden: { opacity: 0, y: 42, scale: 0.975 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.86, ease: revealEase },
  },
} as const;

const eyebrowReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.74, ease: revealEase } },
} as const;

const titleReveal = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.94, ease: revealEase } },
} as const;

const heroTitleCharacterReveal = {
  hidden: { opacity: 0, y: "112%" },
  visible: (index: number) => ({
    opacity: 1,
    y: "0%",
    transition: { duration: 0.68, delay: index * 0.018, ease: revealEase },
  }),
} as const;

const copyReveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.82, ease: revealEase } },
} as const;

const cardGridReveal = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.08, ease: revealEase },
  },
} as const;

const cardReveal = {
  hidden: { opacity: 0, y: 44, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.86, ease: revealEase },
  },
} as const;

const processStepReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: revealEase },
  },
} as const;

const primaryButtonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.16, ease: measuredEase },
} as const;

function MagneticPrimaryAnchor({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"a">) {
  const magnetic = useMagneticMotion(6);

  return (
    <motion.a
      {...props}
      className={`apple-cta apple-cta-primary ${className}`.trim()}
      style={magnetic.style}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      {...primaryButtonMotion}
    >
      {children}
    </motion.a>
  );
}

function MagneticPrimaryButton({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"button">) {
  const magnetic = useMagneticMotion(6);

  return (
    <motion.button
      {...props}
      className={`apple-cta apple-cta-primary ${className}`.trim()}
      style={magnetic.style}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      {...primaryButtonMotion}
    >
      {children}
    </motion.button>
  );
}

function isFineHoverPointer(event: { pointerType: string }) {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

const mediaReveal = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.98, ease: revealEase },
  },
} as const;

const heroReveal = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
} as const;

const detailStaggerReveal = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05, ease: revealEase },
  },
} as const;

const detailItemReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: revealEase } },
} as const;

type ArchiveAtmosphereSection = "hero" | "archive" | "experience" | "process" | "preserve" | "inquire";

function isArchiveAtmosphereSection(value: string | undefined): value is ArchiveAtmosphereSection {
  return value === "hero"
    || value === "archive"
    || value === "experience"
    || value === "process"
    || value === "preserve"
    || value === "inquire";
}

function getAtmosphereSectionForId(id: ImmersiveSectionId): ArchiveAtmosphereSection {
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
  const [activeSection, setActiveSection] = useState<ArchiveAtmosphereSection>("hero");

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

        if (isArchiveAtmosphereSection(nextSection)) {
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

function scrollToPublicSection(id: ImmersiveSectionId) {
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() + 8);

  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? "auto" : "smooth",
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
  return (
    <motion.section
      id={id}
      data-archive-section
      data-atmosphere-section={getAtmosphereSectionForId(id)}
      data-motion-section
      className={`apple-section motion-section ${className}`.trim()}
    >
      <motion.div
        className="apple-section-inner motion-section-flow"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="apple-section-kicker motion-eyebrow" variants={eyebrowReveal}>{eyebrow}</motion.div>
        <motion.h2 className="apple-section-title motion-title" variants={titleReveal}>{title}</motion.h2>
        <motion.p className="apple-section-copy motion-copy" variants={copyReveal}>{description}</motion.p>
        <motion.div className="apple-section-body motion-card" variants={archiveChildReveal}>{children}</motion.div>
      </motion.div>
    </motion.section>
  );
}

function ArchiveVisualFrame({
  image,
  label,
  caption,
  indexLabel,
}: {
  image: string;
  label: string;
  caption: string;
  indexLabel?: string;
}) {
  return (
    <div className="apple-visual-frame apple-liquid-surface">
      <span className="apple-liquid-layer" aria-hidden="true" />
      <div className="apple-visual-toolbar">
        <span>{label}</span>
        {indexLabel ? <span>{indexLabel}</span> : null}
      </div>
      <div className="apple-visual-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${label} visual`} decoding="async" />
      </div>
      <p>{caption}</p>
    </div>
  );
}

function HeroHeadline({ title }: { title: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.h1 className="apple-hero-title motion-title" variants={titleReveal}>
        {title}
      </motion.h1>
    );
  }

  return (
    <motion.h1
      className="apple-hero-title apple-hero-title-mask motion-title"
      variants={titleReveal}
      aria-label={title}
    >
      <span className="apple-hero-title-characters" aria-hidden="true">
        {Array.from(title).map((character, index) => (
          <span className="apple-hero-title-character-window" key={`hero-title-character-${index}`}>
            <motion.span
              className="apple-hero-title-character"
              custom={index}
              variants={heroTitleCharacterReveal}
            >
              {character === " " ? "\u00A0" : character}
            </motion.span>
          </span>
        ))}
      </span>
    </motion.h1>
  );
}

function ArchiveHero({
  home,
}: {
  home: ResolvedSceneContent;
}) {
  const handleLink = useSectionLink();
  const heroStep = home.steps[0];

  return (
    <motion.section
      id="home"
      data-archive-section
      data-atmosphere-section="hero"
      data-motion-section
      className="apple-hero motion-section"
    >
      <motion.div
        className="apple-hero-inner motion-section-flow"
        variants={heroReveal}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="apple-section-kicker motion-eyebrow" variants={eyebrowReveal}>{home.eyebrow}</motion.div>
        <HeroHeadline title={home.title} />
        <motion.p className="apple-hero-copy motion-copy" variants={copyReveal}>{home.description}</motion.p>
        <motion.div className="apple-hero-actions motion-card" variants={cardReveal}>
          {home.primaryAction ? (
            <MagneticPrimaryAnchor
              href={home.primaryAction.href}
              onClick={(event) => handleLink(home.primaryAction?.href ?? "", event)}
            >
              {home.primaryAction.label}
            </MagneticPrimaryAnchor>
          ) : null}
          {home.secondaryAction ? (
            <a className="apple-cta apple-cta-secondary" href={home.secondaryAction.href} onClick={(event) => handleLink(home.secondaryAction?.href ?? "", event)}>
              {home.secondaryAction.label}
            </a>
          ) : null}
        </motion.div>
        <motion.div className="apple-hero-stage motion-media" variants={mediaReveal}>
          <div className="apple-hero-record">
            <ArchiveVisualFrame
              image={heroStep.image}
              label={heroStep.mediaLabel}
              caption={heroStep.mediaCaption}
              indexLabel="Archive 01"
            />
          </div>
          <motion.div className="apple-hero-chapters" aria-label="Opening archive chapters" variants={cardGridReveal}>
            {home.steps.map((step, index) => (
              <motion.div className="apple-hero-chapter apple-liquid-surface" key={`hero-chapter-${index}`} variants={cardReveal}>
                <span className="apple-liquid-layer" aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
                <p>{step.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function ArchiveValueCard({
  pillar,
  index,
  isActive,
  detailId,
  reduceMotion,
  onHover,
  onSelect,
}: {
  pillar: PublicSceneStep;
  index: number;
  isActive: boolean;
  detailId: string;
  reduceMotion: boolean;
  onHover: (index: number) => void;
  onSelect: (index: number) => void;
}) {
  const tilt = useCardTiltMotion(4);

  return (
    <motion.button
      type="button"
      className={[
        "apple-value-card apple-liquid-surface",
        isActive ? "apple-value-card-active" : "",
        isActive ? "" : "apple-value-card-inactive",
      ].filter(Boolean).join(" ")}
      key={`archive-value-card-${index}`}
      variants={cardReveal}
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.006 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      style={{ "--motion-stagger-index": index, ...tilt.style } as MotionStyle}
      aria-controls={detailId}
      aria-expanded={isActive}
      aria-pressed={isActive}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onPointerEnter={(event) => {
        if (isFineHoverPointer(event)) {
          onHover(index);
        }
      }}
      onPointerDown={(event) => {
        if (!isFineHoverPointer(event)) {
          onSelect(index);
        }
      }}
      onClick={() => {
        onSelect(index);
      }}
      onFocus={() => onSelect(index)}
    >
      <span className="apple-liquid-layer" aria-hidden="true" />
      <span>Archive {String(index + 1).padStart(2, "0")}</span>
      <h3>{pillar.label}</h3>
      <p>{pillar.summary}</p>
      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.div
            id={detailId}
            className="apple-value-card-detail"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.28, ease: measuredEase }}
          >
            {pillar.detail}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

function EmotionalValue({ home }: { home: ResolvedSceneContent }) {
  const reduceMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const pillars = home.steps.slice(0, 4);
  const activeIndex = hoverIndex ?? selectedIndex;
  const activePillar = pillars[activeIndex] ?? pillars[0];

  return (
    <motion.section
      className="apple-value-band motion-section"
      data-atmosphere-section="archive"
      data-active-index={activeIndex}
      data-motion-section
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      style={{
        "--active-archive-index": activeIndex,
      } as CSSProperties}
    >
      <motion.div className="apple-value-archive-shell motion-media" variants={mediaReveal}>
        <div className="apple-archive-sheets" aria-hidden="true" data-active-index={activeIndex}>
          <span className="apple-archive-sheet apple-archive-sheet-one" />
          <span className="apple-archive-sheet apple-archive-sheet-two" />
          <span className="apple-archive-sheet apple-archive-sheet-three" />
        </div>
        <div className="apple-value-statement">
          <span>Private memory archive</span>
          <h2>{home.steps[3]?.summary ?? home.title}</h2>
          <div className="apple-archive-record-line" aria-hidden="true">
            <span style={{ "--archive-index-x": `${activeIndex * 100}%` } as CSSProperties} />
          </div>
          <p>{activePillar?.summary ?? home.description}</p>
        </div>
      </motion.div>
      <motion.div
        className="apple-value-grid motion-stagger"
        data-active-index={activeIndex}
        variants={cardGridReveal}
        onPointerLeave={(event) => {
          if (isFineHoverPointer(event)) {
            setHoverIndex(null);
          }
        }}
        style={{
          "--active-archive-index": activeIndex,
          "--archive-card-index-x": `calc(${12.5 + activeIndex * 25}% - 0.32rem)`,
        } as CSSProperties}
      >
        {pillars.map((pillar, index) => {
          const isActive = index === activeIndex;
          const detailId = `archive-card-detail-${index + 1}`;

          return (
            <ArchiveValueCard
              key={`archive-value-card-${index}`}
              pillar={pillar}
              index={index}
              isActive={isActive}
              detailId={detailId}
              reduceMotion={Boolean(reduceMotion)}
              onHover={setHoverIndex}
              onSelect={setSelectedIndex}
            />
          );
        })}
      </motion.div>
    </motion.section>
  );
}

function formatRailLabel(value: string) {
  return value.replace(/\.$/, "");
}

function ArchiveIndexLine({
  items,
  activeKey,
}: {
  items: Array<{ key: ArchiveAtmosphereSection; label: string }>;
  activeKey: ArchiveAtmosphereSection;
}) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.key === activeKey));
  const activeLabel = items[activeIndex]?.label ?? items[0]?.label ?? "";
  const denominator = Math.max(1, items.length - 1);

  return (
    <div
      className="apple-archive-index"
      aria-hidden="true"
      style={{ "--archive-marker-top": `${(activeIndex / denominator) * 100}%` } as CSSProperties}
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
    </div>
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
    <motion.div className="apple-scene-module motion-stagger" variants={cardGridReveal}>
      <motion.div
        className="apple-record-list"
        variants={cardGridReveal}
        style={{
          "--record-active-index": activeIndex,
          "--record-total": scene.steps.length,
          "--record-progress": `${((activeIndex + 1) / scene.steps.length) * 100}%`,
        } as CSSProperties}
      >
        <div className="apple-record-list-header">
          <span>{sectionLabel}</span>
          <span>
            {String(activeIndex + 1).padStart(2, "0")} / {String(scene.steps.length).padStart(2, "0")}
          </span>
        </div>
        <div className="apple-record-sync-rail" aria-hidden="true">
          <span />
        </div>
        {scene.steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <motion.button
              key={`experience-state-${index}`}
              type="button"
              className={`apple-record-card apple-liquid-surface ${isActive ? "apple-record-card-active" : ""}`.trim()}
              variants={cardReveal}
              style={{ "--motion-stagger-index": index } as CSSProperties}
              aria-pressed={isActive}
              onPointerDown={() => selectIndex(index)}
              onClick={() => selectIndex(index)}
            >
              <span className="apple-liquid-layer" aria-hidden="true" />
              <span>{step.label}</span>
              <strong>{step.title}</strong>
              <p>{step.summary}</p>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div className="apple-record-feature motion-media" variants={mediaReveal}>
        <div className="experience-content-container">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`experience-feature-${activeIndex}`}
              className="apple-record-feature-content"
              custom={direction}
              initial={reduceMotion ? false : { opacity: 0, x: direction > 0 ? 28 : -28, y: 8, scale: 0.992 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: direction > 0 ? -20 : 20, y: -6, scale: 0.996 }}
              transition={reduceMotion ? { duration: 0 } : { ...transition, duration: 0.36 }}
            >
              <ArchiveVisualFrame
                image={active.image}
                label={active.mediaLabel}
                caption={active.mediaCaption}
                indexLabel={active.label}
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
                <motion.div className="apple-record-tags" variants={detailStaggerReveal}>
                  {active.bullets.map((bullet, index) => (
                    <motion.span key={`experience-tag-${activeIndex}-${index}`} variants={detailItemReveal}>{bullet}</motion.span>
                  ))}
                </motion.div>
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
      </motion.div>
    </motion.div>
  );
}

function ProcessStepCard({
  step,
  index,
  reduceMotion,
}: {
  step: PublicSceneStep;
  index: number;
  reduceMotion: boolean;
}) {
  const tilt = useCardTiltMotion(4);

  return (
    <motion.article
      className="apple-process-card apple-liquid-surface how-it-works-card premium-card"
      key={`process-step-${index}`}
      variants={processStepReveal}
      initial="hidden"
      whileInView="visible"
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.006 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      viewport={{ once: true, amount: 0.35 }}
      style={{ "--motion-stagger-index": index, ...tilt.style } as MotionStyle}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <span className="apple-liquid-layer" aria-hidden="true" />
      <span>{String(index + 1).padStart(2, "0")}</span>
      <h3>{step.label}</h3>
      <p>{step.detail}</p>
    </motion.article>
  );
}

function ProcessTimeline({ process }: { process: ResolvedSceneContent }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div className="apple-process-grid motion-stagger" variants={cardGridReveal}>
      {process.steps.map((step, index) => (
        <ProcessStepCard
          key={`process-step-${index}`}
          step={step}
          index={index}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}
    </motion.div>
  );
}

function PreserveEditorial({ preserve }: { preserve: ResolvedSceneContent }) {
  const featured = preserve.steps[0];
  const remaining = preserve.steps.slice(1);

  return (
    <motion.div className="apple-preserve-layout motion-stagger" variants={cardGridReveal}>
      {featured ? (
        <motion.article className="apple-preserve-feature apple-liquid-surface motion-media" variants={mediaReveal}>
          <span className="apple-liquid-layer" aria-hidden="true" />
          <span>{featured.mediaLabel}</span>
          <h3>{featured.title}</h3>
          <p>{featured.detail}</p>
          <motion.div className="apple-record-tags" variants={detailStaggerReveal}>
            {featured.bullets.map((bullet, index) => (
              <motion.span key={`preserve-feature-tag-${index}`} variants={detailItemReveal}>{bullet}</motion.span>
            ))}
          </motion.div>
        </motion.article>
      ) : null}
      <motion.div className="apple-preserve-grid" variants={cardGridReveal}>
        {remaining.map((step, index) => (
          <motion.article
            className="apple-preserve-card apple-liquid-surface"
            key={`preserve-card-${index}`}
            variants={cardReveal}
            style={{ "--motion-stagger-index": index + 1 } as CSSProperties}
          >
            <span className="apple-liquid-layer" aria-hidden="true" />
            <span>{step.label}</span>
            <h3>{step.title}</h3>
            <p>{step.summary}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.div>
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
    <motion.div className="apple-inquiry-layout motion-stagger" variants={cardGridReveal}>
      <motion.form className="apple-inquiry-form" onSubmit={handleSubmit} variants={cardReveal}>
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
        <AnimatePresence initial={false}>
          <motion.div
            key={`fields-${activeIndex}`}
            initial={{ opacity: 0, y: 16, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.998 }}
            transition={{ duration: 0.32, ease: measuredEase }}
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
      </motion.form>

      <motion.aside className="apple-inquiry-support motion-media" variants={mediaReveal}>
        <AnimatePresence initial={false}>
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
                label={activeSupport.label}
                caption={activeSupport.body}
                indexLabel={inquiry.progressionLabel}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="apple-trust-grid">
          {inquiry.trustPoints.map((point, index) => (
            <span key={`trust-point-${index}`}>{point}</span>
          ))}
        </div>
      </motion.aside>
    </motion.div>
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
  const railItems = useMemo<Array<{ key: ArchiveAtmosphereSection; label: string }>>(
    () => [
      { key: "hero", label: formatRailLabel(home.title) },
      { key: "archive", label: "Private Memory Archive" },
      { key: "experience", label: formatRailLabel(experience.title) },
      { key: "process", label: formatRailLabel(process.title) },
      { key: "preserve", label: formatRailLabel(preserve.title) },
      { key: "inquire", label: formatRailLabel(inquiry.title) },
    ],
    [experience.title, home.title, inquiry.title, preserve.title, process.title],
  );

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
            onClick={() => scrollToPublicSection(section.id)}
          >
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      <ArchiveHero home={home} />
      <EmotionalValue home={home} />

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
