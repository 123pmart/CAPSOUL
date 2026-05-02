"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  hidden: { opacity: 0, y: 44, scale: 0.982 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.84, ease: revealEase, staggerChildren: 0.1, delayChildren: 0.05 },
  },
} as const;

const archiveChildReveal = {
  hidden: { opacity: 0, y: 34, scale: 0.988 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.72, ease: revealEase },
  },
} as const;

const heroReveal = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.06 },
  },
} as const;

const liquidTargetSelector = [
  ".apple-liquid-surface",
  ".apple-cta",
  ".apple-inquiry-tab",
  ".apple-input",
  ".apple-budget-shell",
  ".apple-admin-access a",
  ".nav-pill",
  ".button-primary",
  ".theme-toggle",
  ".apple-side-dot",
].join(",");

function useLiquidGlassPointer() {
  const frameRef = useRef<number | null>(null);
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const latestPointerRef = useRef<PointerEvent | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reduceMotion.matches) {
      return;
    }

    function clearActiveTarget(_event?: Event) {
      if (activeTargetRef.current) {
        activeTargetRef.current.removeEventListener("pointermove", handleTargetPointerMove);
        activeTargetRef.current.removeEventListener("pointerleave", clearActiveTarget);
        activeTargetRef.current.removeAttribute("data-liquid-active");
        activeTargetRef.current.style.removeProperty("--pointer-x");
        activeTargetRef.current.style.removeProperty("--pointer-y");
        activeTargetRef.current.style.removeProperty("--liquid-shift-x");
        activeTargetRef.current.style.removeProperty("--liquid-shift-y");
        activeTargetRef.current.style.removeProperty("--liquid-inverse-x");
        activeTargetRef.current.style.removeProperty("--liquid-inverse-y");
        activeTargetRef.current.style.removeProperty("--liquid-tilt-x");
        activeTargetRef.current.style.removeProperty("--liquid-tilt-y");
      }

      activeTargetRef.current = null;
      latestPointerRef.current = null;
    }

    const updatePointerVars = () => {
      frameRef.current = null;

      const event = latestPointerRef.current;
      const target = activeTargetRef.current;

      if (!event || !target) {
        return;
      }

      const rect = target.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
      const normalizedX = x / rect.width - 0.5;
      const normalizedY = y / rect.height - 0.5;

      target.style.setProperty("--pointer-x", `${x.toFixed(1)}px`);
      target.style.setProperty("--pointer-y", `${y.toFixed(1)}px`);
      target.style.setProperty("--liquid-shift-x", `${(normalizedX * 5).toFixed(2)}px`);
      target.style.setProperty("--liquid-shift-y", `${(normalizedY * 5).toFixed(2)}px`);
      target.style.setProperty("--liquid-inverse-x", `${(-normalizedX * 5).toFixed(2)}px`);
      target.style.setProperty("--liquid-inverse-y", `${(-normalizedY * 5).toFixed(2)}px`);
      target.style.setProperty("--liquid-tilt-x", `${(-normalizedY * 1.6).toFixed(2)}deg`);
      target.style.setProperty("--liquid-tilt-y", `${(normalizedX * 1.8).toFixed(2)}deg`);
    };

    const schedulePointerUpdate = (event: PointerEvent) => {
      latestPointerRef.current = event;

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updatePointerVars);
      }
    };

    function handleTargetPointerMove(event: PointerEvent) {
      schedulePointerUpdate(event);
    }

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(liquidTargetSelector)
        : null;

      if (!target) {
        return;
      }

      if (activeTargetRef.current !== target) {
        clearActiveTarget();
        activeTargetRef.current = target;
        target.addEventListener("pointermove", handleTargetPointerMove, { passive: true });
        target.addEventListener("pointerleave", clearActiveTarget, { passive: true });
        target.setAttribute("data-liquid-active", "true");
      }

      schedulePointerUpdate(event);
    };

    document.addEventListener("pointerover", handlePointerOver, { passive: true });

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      clearActiveTarget();
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
    <section id={id} data-archive-section className={`apple-section ${className}`.trim()}>
      <motion.div
        className="apple-section-inner"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="apple-section-kicker" variants={archiveChildReveal}>{eyebrow}</motion.div>
        <motion.h2 className="apple-section-title" variants={archiveChildReveal}>{title}</motion.h2>
        <motion.p className="apple-section-copy" variants={archiveChildReveal}>{description}</motion.p>
        <motion.div className="apple-section-body" variants={archiveChildReveal}>{children}</motion.div>
      </motion.div>
    </section>
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

function ArchiveHero({
  home,
}: {
  home: ResolvedSceneContent;
}) {
  const handleLink = useSectionLink();
  const heroStep = home.steps[0];

  return (
    <section id="home" data-archive-section className="apple-hero">
      <motion.div
        className="apple-hero-inner"
        variants={heroReveal}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="apple-section-kicker" variants={archiveChildReveal}>{home.eyebrow}</motion.div>
        <motion.h1 className="apple-hero-title" variants={archiveChildReveal}>{home.title}</motion.h1>
        <motion.p className="apple-hero-copy" variants={archiveChildReveal}>{home.description}</motion.p>
        <motion.div className="apple-hero-actions" variants={archiveChildReveal}>
          {home.primaryAction ? (
            <a className="apple-cta apple-cta-primary" href={home.primaryAction.href} onClick={(event) => handleLink(home.primaryAction?.href ?? "", event)}>
              {home.primaryAction.label}
            </a>
          ) : null}
          {home.secondaryAction ? (
            <a className="apple-cta apple-cta-secondary" href={home.secondaryAction.href} onClick={(event) => handleLink(home.secondaryAction?.href ?? "", event)}>
              {home.secondaryAction.label}
            </a>
          ) : null}
        </motion.div>
        <motion.div className="apple-hero-stage" variants={archiveChildReveal}>
          <div className="apple-hero-record">
            <ArchiveVisualFrame
              image={heroStep.image}
              label={heroStep.mediaLabel}
              caption={heroStep.mediaCaption}
              indexLabel="Archive 01"
            />
          </div>
          <div className="apple-hero-chapters" aria-label="Opening archive chapters">
            {home.steps.map((step, index) => (
              <div className="apple-hero-chapter apple-liquid-surface" key={step.label}>
                <span className="apple-liquid-layer" aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
                <p>{step.title}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function EmotionalValue({ home }: { home: ResolvedSceneContent }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pillars = home.steps.slice(0, 4);
  const activePillar = pillars[activeIndex] ?? pillars[0];

  return (
    <motion.div
      className="apple-value-band"
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
    >
      <motion.div className="apple-value-archive-shell" variants={archiveChildReveal}>
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
        className="apple-value-grid"
        variants={archiveChildReveal}
      >
        {pillars.map((pillar, index) => {
          const isActive = index === activeIndex;
          const detailId = `archive-card-detail-${index + 1}`;

          return (
            <motion.button
              type="button"
              className={[
                "apple-value-card apple-liquid-surface",
                isActive ? "apple-value-card-active" : "",
              ].filter(Boolean).join(" ")}
              key={pillar.label}
              variants={archiveChildReveal}
              aria-controls={detailId}
              aria-expanded={isActive}
              onClick={() => {
                setActiveIndex(index);
              }}
              onFocus={() => setActiveIndex(index)}
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
        })}
      </motion.div>
    </motion.div>
  );
}

function ArchiveIndexLine({
  sections,
  activeId,
}: {
  sections: Array<{ id: ImmersiveSectionId; label: string }>;
  activeId: ImmersiveSectionId;
}) {
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId));

  return (
    <div
      className="apple-archive-index"
      aria-hidden="true"
      style={{ "--archive-section-index": activeIndex } as CSSProperties}
    >
      <span className="apple-archive-index-label">Archive index</span>
      <div className="apple-archive-index-track">
        <i className="apple-archive-index-marker" />
        {sections.map((section, index) => (
          <span
            key={section.id}
            className={activeId === section.id ? "apple-archive-index-step apple-archive-index-step-active" : "apple-archive-index-step"}
            style={{ "--archive-step-index": index } as CSSProperties}
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
  const reduceMotion = useReducedMotion();
  const active = scene.steps[activeIndex] ?? scene.steps[0];
  const transition = reduceMotion ? { duration: 0 } : contentSwapTransition;

  const previous = () => setActiveIndex((current) => Math.max(0, current - 1));
  const next = () => setActiveIndex((current) => Math.min(scene.steps.length - 1, current + 1));

  if (!active) {
    return null;
  }

  return (
    <div className="apple-scene-module">
      <div className="apple-record-list">
        <div className="apple-record-list-header">
          <span>{sectionLabel}</span>
          <span>
            {String(activeIndex + 1).padStart(2, "0")} / {String(scene.steps.length).padStart(2, "0")}
          </span>
        </div>
        {scene.steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={step.label}
              type="button"
              className={`apple-record-card apple-liquid-surface ${isActive ? "apple-record-card-active" : ""}`.trim()}
              onClick={() => setActiveIndex(index)}
            >
              <span className="apple-liquid-layer" aria-hidden="true" />
              <span>{step.label}</span>
              <strong>{step.title}</strong>
              <p>{step.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="apple-record-feature">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active.label}-${activeIndex}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.996 }}
            transition={transition}
          >
            <ArchiveVisualFrame
              image={active.image}
              label={active.mediaLabel}
              caption={active.mediaCaption}
              indexLabel={active.label}
            />
            <div className="apple-record-detail">
              <span>{sectionLabel}</span>
              <h3>{active.title}</h3>
              <p>{active.detail}</p>
              <div className="apple-record-tags">
                {active.bullets.map((bullet) => (
                  <span key={bullet}>{bullet}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <CompactSceneControls
          className="apple-scene-controls"
          labels={scene.steps.map((step) => step.title)}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
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

function ProcessTimeline({ process }: { process: ResolvedSceneContent }) {
  return (
    <div className="apple-process-grid">
      {process.steps.map((step, index) => (
        <article className="apple-process-card apple-liquid-surface" key={step.label}>
          <span className="apple-liquid-layer" aria-hidden="true" />
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h3>{step.label}</h3>
          <p>{step.detail}</p>
        </article>
      ))}
    </div>
  );
}

function PreserveEditorial({ preserve }: { preserve: ResolvedSceneContent }) {
  const featured = preserve.steps[0];
  const remaining = preserve.steps.slice(1);

  return (
    <div className="apple-preserve-layout">
      {featured ? (
        <article className="apple-preserve-feature apple-liquid-surface">
          <span className="apple-liquid-layer" aria-hidden="true" />
          <span>{featured.mediaLabel}</span>
          <h3>{featured.title}</h3>
          <p>{featured.detail}</p>
          <div className="apple-record-tags">
            {featured.bullets.map((bullet) => (
              <span key={bullet}>{bullet}</span>
            ))}
          </div>
        </article>
      ) : null}
      <div className="apple-preserve-grid">
        {remaining.map((step) => (
          <article className="apple-preserve-card apple-liquid-surface" key={step.label}>
            <span className="apple-liquid-layer" aria-hidden="true" />
            <span>{step.label}</span>
            <h3>{step.title}</h3>
            <p>{step.summary}</p>
          </article>
        ))}
      </div>
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
        <button
          type="button"
          className="apple-cta apple-cta-primary"
          onClick={() => {
            setSubmitted(false);
            setActiveIndex(0);
            setFormState(initialInquiryState);
          }}
        >
          {inquiry.successResetLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="apple-inquiry-layout">
      <form className="apple-inquiry-form" onSubmit={handleSubmit}>
        <div className="apple-inquiry-tabs" role="tablist" aria-label={inquiry.progressionLabel}>
          {inquiry.formSteps.map((step, index) => (
            <button
              key={step.chip}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={`fields-${activeIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
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
            <button
              type="button"
              className="apple-cta apple-cta-primary"
              onClick={() => setActiveIndex((current) => Math.min(inquiry.formSteps.length - 1, current + 1))}
            >
              {inquiry.nextButtonLabel}
            </button>
          ) : (
            <button className="apple-cta apple-cta-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? fieldCopy.submittingLabel : inquiry.submitButtonLabel}
            </button>
          )}
        </div>
        <p className="apple-inquiry-note">{inquiry.footerNote}</p>
      </form>

      <aside className="apple-inquiry-support">
        {activeSupport ? (
          <ArchiveVisualFrame
            image={activeSupport.image}
            label={activeSupport.label}
            caption={activeSupport.body}
            indexLabel={inquiry.progressionLabel}
          />
        ) : null}
        <div className="apple-trust-grid">
          {inquiry.trustPoints.map((point) => (
            <span key={point}>{point}</span>
          ))}
        </div>
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
  useLiquidGlassPointer();

  return (
    <div className="apple-archive-experience">
      <ArchiveIndexLine sections={sections} activeId={activeId} />

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
