"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  cardStateTransition,
  contentSwapTransition,
  measuredEase,
  subtleHoverLift,
  subtleTapPress,
} from "@/components/motion-config";
import { CompactSceneControls } from "@/components/compact-scene-controls";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SceneDetailModal } from "@/components/scene-detail-modal";
import { ScenePageUtilityRow } from "@/components/scene-page-utility-row";
import { SceneRoutePager } from "@/components/scene-route-pager";
import { useSiteLocale } from "@/components/site-locale-provider";
import { SceneViewport } from "@/components/scene-viewport";
import { TransitionLink } from "@/components/transition-link";
import { useCompactViewport } from "@/components/use-compact-viewport";
import { useSceneProgression } from "@/components/use-scene-progression";
import type { ResolvedInquiryContent } from "@/lib/site-content-schema";

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

const initialState: InquiryFormState = {
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

type InquirySceneProps = {
  sceneData: ResolvedInquiryContent;
};

const budgetSliderMin = 5000;
const budgetSliderMax = 25000;
const budgetSliderStep = 500;
const budgetSliderDefault = 12500;

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

export function InquiryScene({ sceneData }: InquirySceneProps) {
  const reduceMotion = useReducedMotion();
  const isPhoneViewport = useCompactViewport("(max-width: 767px)");
  const { globalContent, locale } = useSiteLocale();
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState<InquiryFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isMobileSupportOpen, setIsMobileSupportOpen] = useState(false);
  const {
    activeIndex,
    goNext,
    goPrev,
    goToStep,
    resetToStep,
    isFirst,
    isLast,
    sceneBindings,
    usesViewportProgression,
  } = useSceneProgression({
    stepCount: sceneData.formSteps.length,
    disabled: submitted || isSubmitting,
  });

  const activeSupport = sceneData.supportStates[activeIndex] ?? sceneData.supportStates[0];
  const activeFormStep = sceneData.formSteps[activeIndex] ?? sceneData.formSteps[0];
  const fieldCopy = sceneData.fieldCopy;
  const estimatedBudgetValue = parseBudgetValue(formState.estimatedBudget);
  const estimatedBudgetProgress =
    ((estimatedBudgetValue - budgetSliderMin) / (budgetSliderMax - budgetSliderMin)) * 100;
  const estimatedBudgetLabel = locale === "es" ? "Presupuesto estimado" : "Estimated budget";
  const estimatedBudgetHint =
    locale === "es"
      ? "Un rango cómodo nos ayuda a orientar el alcance y la producción."
      : "A comfortable range helps us shape scope and production.";

  useEffect(() => {
    setIsMobileSupportOpen(false);
  }, [activeIndex, isPhoneViewport]);

  if (!activeSupport || !activeFormStep) {
    return null;
  }

  const contentEnter = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: 18 }
      : { opacity: 0, y: 10 };
  const contentExit = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: -14 }
      : { opacity: 0, y: -8 };
  const supportEnter = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: 24, scale: 0.985 }
      : { opacity: 0, y: 14, scale: 0.996 };
  const supportExit = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: -18, scale: 0.992 }
      : { opacity: 0, y: -10, scale: 0.998 };
  const mobileSceneSwapTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: measuredEase };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
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
        headers: {
          "Content-Type": "application/json",
        },
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

  const renderFormFields = () => {
    if (activeIndex === 0) {
      return (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="fullName">
              {fieldCopy.fullNameLabel}
            </label>
            <input
              className="field-input"
              id="fullName"
              name="fullName"
              onChange={handleChange}
              placeholder={fieldCopy.fullNamePlaceholder}
              required
              value={formState.fullName}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="email">
              {fieldCopy.emailLabel}
            </label>
            <input
              className="field-input"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder={fieldCopy.emailPlaceholder}
              required
              type="email"
              value={formState.email}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="phone">
              {fieldCopy.phoneLabel}
            </label>
            <input
              className="field-input"
              id="phone"
              name="phone"
              onChange={handleChange}
              placeholder={fieldCopy.phonePlaceholder}
              value={formState.phone}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="region">
              {fieldCopy.regionLabel}
            </label>
            <input
              className="field-input"
              id="region"
              name="region"
              onChange={handleChange}
              placeholder={fieldCopy.regionPlaceholder}
              value={formState.region}
            />
          </div>
          <div className="sm:col-span-2">
            <div
              className="budget-slider-shell"
              style={{ "--budget-progress": `${estimatedBudgetProgress}%` } as CSSProperties}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="field-label !mb-0" htmlFor="estimatedBudget">
                  {estimatedBudgetLabel}
                </label>
                <motion.span
                  layout
                  className="budget-slider-value"
                  transition={cardStateTransition}
                >
                  {formState.estimatedBudget}
                </motion.span>
              </div>

              <div className="budget-slider-track">
                <div className="budget-slider-progress" />
                <input
                  id="estimatedBudget"
                  name="estimatedBudget"
                  type="range"
                  min={budgetSliderMin}
                  max={budgetSliderMax}
                  step={budgetSliderStep}
                  value={estimatedBudgetValue}
                  onChange={handleBudgetChange}
                  className="budget-slider-input"
                />
              </div>

              <p className="budget-slider-hint">{estimatedBudgetHint}</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeIndex === 1) {
      return (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="filmFor">
              {fieldCopy.filmForLabel}
            </label>
            <input
              className="field-input"
              id="filmFor"
              name="filmFor"
              onChange={handleChange}
              placeholder={fieldCopy.filmForPlaceholder}
              required
              value={formState.filmFor}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="relationship">
              {fieldCopy.relationshipLabel}
            </label>
            <input
              className="field-input"
              id="relationship"
              name="relationship"
              onChange={handleChange}
              placeholder={fieldCopy.relationshipPlaceholder}
              required
              value={formState.relationship}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="stillLiving">
              {fieldCopy.stillLivingLabel}
            </label>
            <select
              className="field-select"
              id="stillLiving"
              name="stillLiving"
              onChange={handleChange}
              required
              value={formState.stillLiving}
            >
              <option value="">{fieldCopy.stillLivingPlaceholder}</option>
              <option value={fieldCopy.stillLivingYes}>{fieldCopy.stillLivingYes}</option>
              <option value={fieldCopy.stillLivingNo}>{fieldCopy.stillLivingNo}</option>
              <option value={fieldCopy.stillLivingPreferNot}>
                {fieldCopy.stillLivingPreferNot}
              </option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="field-label" htmlFor="timeline">
              {fieldCopy.timelineLabel}
            </label>
            <input
              className="field-input"
              id="timeline"
              name="timeline"
              onChange={handleChange}
              placeholder={fieldCopy.timelinePlaceholder}
              value={formState.timeline}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="field-label" htmlFor="storyImportance">
              {fieldCopy.storyImportanceLabel}
            </label>
            <textarea
              className="field-textarea"
              id="storyImportance"
              name="storyImportance"
              onChange={handleChange}
              placeholder={fieldCopy.storyImportancePlaceholder}
              required
              value={formState.storyImportance}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:gap-4">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="filmingLocation">
              {fieldCopy.filmingLocationLabel}
            </label>
            <input
              className="field-input"
              id="filmingLocation"
              name="filmingLocation"
              onChange={handleChange}
              placeholder={fieldCopy.filmingLocationPlaceholder}
              value={formState.filmingLocation}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="faithContext">
              {fieldCopy.faithContextLabel}
            </label>
            <select
              className="field-select"
              id="faithContext"
              name="faithContext"
              onChange={handleChange}
              value={formState.faithContext}
            >
              <option value="">{fieldCopy.faithContextPlaceholder}</option>
              <option value="central">{fieldCopy.faithContextCentral}</option>
              <option value="present">{fieldCopy.faithContextPresent}</option>
              <option value="not-really">{fieldCopy.faithContextNotReally}</option>
              <option value="not-sure">{fieldCopy.faithContextNotSure}</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="field-label" htmlFor="extraNotes">
            {fieldCopy.extraNotesLabel}
          </label>
          <textarea
            className="field-textarea"
            id="extraNotes"
            name="extraNotes"
            onChange={handleChange}
            placeholder={fieldCopy.extraNotesPlaceholder}
            value={formState.extraNotes}
          />
        </div>
      </div>
    );
  };

  const renderSuccessContent = (compact: boolean) => (
    <div className="flex h-full flex-col justify-between gap-5">
      <div className={compact ? "max-w-[30rem]" : "max-w-[30rem]"}>
        <span className="eyebrow">{sceneData.successEyebrow}</span>
        <h2 className={`${compact ? "text-[1.45rem]" : "headline-support"} mt-[var(--mobile-label-heading-gap)]`}>
          {sceneData.successTitle}
        </h2>
        <p className="mt-[var(--mobile-heading-body-gap)] text-[0.94rem] leading-6 text-[var(--text-secondary)] sm:text-[0.96rem] sm:leading-7">
          {sceneData.successBody}
        </p>
      </div>

      <div className="grid gap-[var(--mobile-body-action-gap)] sm:grid-cols-2">
        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            setSubmitted(false);
            resetToStep(0);
            setFormState(initialState);
          }}
        >
          {sceneData.successResetLabel}
        </button>
        <TransitionLink className="button-primary" href="/">
          {sceneData.successReturnLabel}
        </TransitionLink>
      </div>
    </div>
  );

  return (
      <section className="inquiry-scene-shell shell py-2 sm:py-4 md:flex md:h-[calc(100svh-var(--header-offset-desktop))] md:min-h-0 md:items-start md:overflow-hidden min-[1025px]:items-center">
        <SceneViewport className="md:w-full">
        <div className="scene-shell scene-shell-warm scene-pad md:w-full" {...sceneBindings}>
          <div className="inquiry-scene-stack relative z-10 flex flex-col gap-[var(--mobile-section-gap)] overflow-visible md:min-h-0 md:gap-4 lg:gap-5">
            <RevealGroup
              className="grid gap-[var(--mobile-section-gap)] md:max-w-[40rem] md:gap-4"
              stagger={0.1}
              amount={0.25}
            >
              <RevealItem variant="hero">
                <div className="max-w-[36rem] flex flex-col items-start">
                  <span className="eyebrow">{sceneData.eyebrow}</span>
                  <h1 className="page-heading headline-display mt-[var(--mobile-label-heading-gap)]">
                    {sceneData.title}
                  </h1>
                  <p className="mt-[var(--mobile-heading-body-gap)] max-w-[32rem] text-[0.94rem] leading-6 text-[var(--text-secondary)] sm:text-[1.02rem] sm:leading-7">
                    {sceneData.description}
                  </p>
                </div>
              </RevealItem>

            </RevealGroup>

            <div className="grid gap-[var(--mobile-card-gap)] md:hidden">
              <RevealItem variant="micro">
                <SceneRoutePager compact />
              </RevealItem>

              {!submitted ? (
                <>
                  <RevealItem variant="card">
                    <div className="panel-strong rounded-[1.28rem] p-3.5">
                      <div className="flex flex-nowrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                            {sceneData.progressionLabel}
                          </p>
                        </div>
                        <span className="scene-counter text-[0.72rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                          {String(activeIndex + 1).padStart(2, "0")} / {String(sceneData.formSteps.length).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="scene-mobile-stage mt-3">
                        <motion.button
                          type="button"
                          aria-expanded={isPhoneViewport ? isMobileSupportOpen : undefined}
                          onClick={() => {
                            if (isPhoneViewport) {
                              setIsMobileSupportOpen(true);
                            }
                          }}
                          className="scene-focus scene-mobile-card flex w-full flex-col gap-3 p-3 text-left"
                        >
                          <div className="scene-media-shell">
                            <div className="scene-media-frame film-frame relative overflow-hidden">
                              <div className="scene-mobile-media-slot">
                                <AnimatePresence initial={false} mode="sync">
                                  <motion.div
                                    key={`${activeSupport.label}-phone-scene`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={mobileSceneSwapTransition}
                                    className="scene-mobile-media-layer"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={activeSupport.image}
                                      alt={`${activeSupport.title} visual placeholder.`}
                                      decoding="async"
                                      className="h-full w-full object-cover"
                                      style={{ objectPosition: activeSupport.objectPosition }}
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.16))]" />
                                    <div className="media-caption absolute inset-x-2.5 bottom-2.5 rounded-[1rem] px-3.5 py-3">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                                          {activeSupport.label}
                                        </p>
                                        <p className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                                          {activeFormStep.chip}
                                        </p>
                                      </div>
                                      <h2 className="scene-mobile-title-lock mt-2 line-clamp-2 text-[1.14rem] leading-[1.04] text-[var(--text-primary)]">
                                        {activeSupport.title}
                                      </h2>
                                    </div>
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>

                          <div className="scene-mobile-caption-slot">
                            <AnimatePresence initial={false} mode="sync">
                              <motion.div
                                key={`${activeSupport.label}-phone-note`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={mobileSceneSwapTransition}
                                className="scene-mobile-caption-layer"
                              >
                                <p className="scene-mobile-note line-clamp-2 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                                  {activeSupport.body}
                                </p>
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        </motion.button>
                      </div>

                      <CompactSceneControls
                        className="mt-3"
                        labels={sceneData.supportStates.map((support) => support.title)}
                        activeIndex={activeIndex}
                        onSelect={goToStep}
                        onPrevious={goPrev}
                        onNext={goNext}
                        previousDisabled={isFirst}
                        nextDisabled={isLast}
                      />

                      <p className="mt-3 text-[0.74rem] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                        {globalContent.sceneLabels.tapImageHint}
                      </p>
                    </div>
                  </RevealItem>

                  <RevealItem variant="card">
                    <div className="panel-strong rounded-[1.35rem] p-4">
                      <form className="grid gap-[var(--mobile-card-gap)]" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-3 gap-2">
                          {sceneData.formSteps.map((step, index) => {
                            const isActive = index === activeIndex;

                            return (
                              <motion.button
                                key={step.chip}
                                type="button"
                                onClick={() => goToStep(index)}
                                animate={
                                  reduceMotion
                                    ? undefined
                                    : isActive
                                      ? { y: -3, scale: 1.01 }
                                      : { y: 0, scale: 1 }
                                }
                              transition={cardStateTransition}
                              whileHover={reduceMotion || isActive ? undefined : subtleHoverLift}
                              whileTap={reduceMotion ? undefined : subtleTapPress}
                              className={`rounded-[0.95rem] px-3 py-2.5 text-center ${
                                isActive
                                  ? "scene-step-chip-active text-[var(--text-primary)]"
                                  : "scene-step-chip text-[var(--text-secondary)]"
                              }`}
                            >
                                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent-deep)]">
                                  {step.chip}
                                </p>
                              </motion.button>
                            );
                          })}
                        </div>

                        <div className="scene-mobile-form-summary">
                          <h2 className="text-[1.34rem] leading-[1.04] text-balance">
                            {activeFormStep.title}
                          </h2>
                          <p className="mt-[var(--mobile-heading-body-gap)] text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                            {activeFormStep.description}
                          </p>
                        </div>

                        <div className="scene-mobile-field-stage">
                          <AnimatePresence initial={false} mode="wait">
                            <motion.div
                              key={`mobile-fields-${activeIndex}`}
                              initial={contentEnter}
                              animate={{ opacity: 1, y: 0 }}
                              exit={contentExit}
                              transition={contentSwapTransition}
                              className="grid gap-3"
                            >
                              {renderFormFields()}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {submitError ? (
                          <p className="rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.84rem] leading-6 text-[var(--text-primary)]">
                            {submitError}
                          </p>
                        ) : null}

                        <p className="text-[0.82rem] leading-6 text-[var(--text-secondary)]">
                          {sceneData.footerNote}
                        </p>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            className="button-secondary !min-h-0 !w-auto shrink-0 px-3 py-2 text-[0.74rem] opacity-80"
                            disabled={isFirst}
                            onClick={goPrev}
                          >
                            {sceneData.previousButtonLabel}
                          </button>

                          {!isLast ? (
                            <button
                              type="button"
                              className="button-primary flex-1 px-4"
                              disabled={isSubmitting}
                              onClick={goNext}
                            >
                              {sceneData.nextButtonLabel}
                            </button>
                          ) : (
                            <button className="button-primary flex-1 px-4" disabled={isSubmitting} type="submit">
                              {isSubmitting ? fieldCopy.submittingLabel : sceneData.submitButtonLabel}
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </RevealItem>
                </>
              ) : (
                <RevealItem variant="card">
                  <div className="panel-strong rounded-[1.35rem] p-4">{renderSuccessContent(true)}</div>
                </RevealItem>
              )}
            </div>

            <div className="inquiry-tablet-branch inquiry-tablet-grid md:min-h-0 md:grid-cols-[minmax(0,1.02fr)_minmax(16.8rem,0.98fr)] md:items-start md:gap-3">
              <RevealItem variant="section" className="min-h-0">
                <div className="inquiry-tablet-form-panel panel-strong flex flex-col rounded-[1.55rem] p-3 md:min-h-0">
                  {submitted ? (
                    renderSuccessContent(false)
                  ) : (
                    <form className="inquiry-tablet-form-shell flex flex-col gap-3.5 md:min-h-0" onSubmit={handleSubmit}>
                      <div className="inquiry-tablet-tabs grid gap-2 sm:grid-cols-3">
                        {sceneData.formSteps.map((step, index) => {
                          const isActive = index === activeIndex;

                          return (
                            <motion.button
                              key={`${step.chip}-tablet`}
                              type="button"
                              onClick={() => goToStep(index)}
                              animate={
                                reduceMotion
                                  ? undefined
                                  : isActive
                                    ? { y: -2, scale: 1.005 }
                                    : { y: 0, scale: 1 }
                              }
                              transition={cardStateTransition}
                              whileHover={reduceMotion || isActive ? undefined : subtleHoverLift}
                              whileTap={reduceMotion ? undefined : subtleTapPress}
                              className={`rounded-full border px-2.5 py-1.5 text-center text-[0.68rem] uppercase tracking-[0.15em] ${
                                isActive
                                  ? "scene-step-chip-active text-[var(--text-primary)]"
                                  : "scene-step-chip text-[var(--text-secondary)]"
                              }`}
                            >
                              {step.chip}
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="inquiry-tablet-copy">
                        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          {activeSupport.label}
                        </p>
                        <h2 className="mt-2 text-[1.36rem] leading-[0.98]">
                          {activeFormStep.title}
                        </h2>
                        <p className="mt-2.5 max-w-[28rem] text-[0.88rem] leading-6 text-[var(--text-secondary)]">
                          {activeFormStep.description}
                        </p>
                      </div>

                      <div className="home-divider" />

                      <div className="inquiry-tablet-field-stage min-h-0">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`tablet-fields-${activeIndex}`}
                            initial={contentEnter}
                            animate={{ opacity: 1, y: 0 }}
                            exit={contentExit}
                            transition={contentSwapTransition}
                            className="grid gap-2.5"
                          >
                            {renderFormFields()}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {submitError ? (
                        <p className="inquiry-tablet-error rounded-[0.95rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3 py-2.5 text-[0.8rem] leading-5 text-[var(--text-primary)]">
                          {submitError}
                        </p>
                      ) : null}

                      <div className="inquiry-tablet-actions grid gap-2">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            className="button-secondary px-3.5 text-[0.82rem]"
                            disabled={isFirst}
                            onClick={goPrev}
                          >
                            {sceneData.previousButtonLabel}
                          </button>

                          {!isLast ? (
                            <button
                              type="button"
                              className="button-primary px-3.5 text-[0.82rem]"
                              disabled={isSubmitting}
                              onClick={goNext}
                            >
                              {sceneData.nextButtonLabel}
                            </button>
                          ) : (
                            <button className="button-primary px-3.5 text-[0.82rem]" disabled={isSubmitting} type="submit">
                              {isSubmitting ? fieldCopy.submittingLabel : sceneData.submitButtonLabel}
                            </button>
                          )}
                        </div>

                        <p className="text-[0.8rem] leading-5 text-[var(--text-secondary)]">
                          {sceneData.footerNote}
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </RevealItem>

              <RevealGroup
                className="inquiry-tablet-support-stack grid gap-2.5 md:min-h-0 md:content-start"
                delay={120}
                stagger={0.1}
                amount={0.2}
              >
                <RevealItem variant="media" className="min-h-0">
                  <div className="inquiry-tablet-media-panel scene-focus scene-panel-shell flex min-h-[14.9rem] flex-col gap-2.5 p-2.5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeSupport.title}-tablet`}
                        initial={supportEnter}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={supportExit}
                        transition={contentSwapTransition}
                        className="grid min-h-0 gap-2.5"
                      >
                        <div className="scene-media-shell min-h-0">
                          <div className="scene-media-frame film-frame relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={activeSupport.image}
                              alt={`${activeSupport.title} visual placeholder.`}
                              className="h-full w-full object-cover"
                              style={{ objectPosition: activeSupport.objectPosition }}
                              decoding="async"
                            />
                            <div className="scene-media-overlay absolute inset-0" />
                            <div className="surface-note absolute left-2.5 top-2.5 max-w-[11rem] rounded-[0.95rem] px-2.5 py-2 text-[0.72rem] leading-5 text-[var(--text-secondary)]">
                              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--accent-deep)]">
                                {activeSupport.label}
                              </p>
                              <p className="mt-1">{sceneData.mediaNote}</p>
                            </div>
                            <div className="media-caption absolute inset-x-2.5 bottom-2.5 rounded-[0.98rem] px-3 py-2.5">
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[var(--accent-deep)]">
                                {sceneData.progressionLabel}
                              </p>
                              <p className="mt-1.5 text-[0.88rem] leading-6 text-[var(--text-primary)]">
                                {activeSupport.body}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="panel rounded-[1rem] p-3">
                          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[var(--accent-deep)]">
                            {sceneData.nextHeading}
                          </p>
                          <p className="mt-1.5 text-[0.86rem] leading-6 text-[var(--text-secondary)]">
                            {sceneData.nextBody}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </RevealItem>

                <RevealItem variant="card">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {sceneData.trustPoints.map((point) => (
                      <div
                        key={`${point}-tablet`}
                        className="archive-chip rounded-[0.95rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)]"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </RevealItem>
              </RevealGroup>
            </div>

            <div className="inquiry-desktop-branch inquiry-scene-grid min-[1025px]:min-h-0 min-[1025px]:grid-cols-[minmax(0,1.03fr)_minmax(19.5rem,0.9fr)] min-[1025px]:gap-5">
              <RevealItem variant="section" className="min-h-0">
                <div className="inquiry-form-panel panel-strong flex flex-col rounded-[1.8rem] p-4 sm:p-5 md:min-h-0">
                  {submitted ? (
                    renderSuccessContent(false)
                  ) : (
                    <form className="inquiry-form-shell flex flex-col gap-5 md:h-full md:min-h-0" onSubmit={handleSubmit}>
                      <div className="grid gap-2.5 sm:grid-cols-3">
                        {sceneData.formSteps.map((step, index) => {
                          const isActive = index === activeIndex;

                          return (
                            <motion.button
                              key={step.chip}
                              type="button"
                              onClick={() => goToStep(index)}
                              animate={
                                reduceMotion
                                  ? undefined
                                  : isActive
                                    ? { y: -3, scale: 1.01 }
                                    : { y: 0, scale: 1 }
                              }
                              transition={cardStateTransition}
                              whileHover={reduceMotion || isActive ? undefined : subtleHoverLift}
                              whileTap={reduceMotion ? undefined : subtleTapPress}
                              className={`rounded-full border px-3 py-2 text-center text-[0.75rem] uppercase tracking-[0.16em] ${
                                isActive
                                  ? "scene-step-chip-active text-[var(--text-primary)]"
                                  : "scene-step-chip text-[var(--text-secondary)]"
                              }`}
                            >
                              {step.chip}
                            </motion.button>
                          );
                        })}
                      </div>

                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          {activeSupport.label}
                        </p>
                        <h2 className="mt-3 text-[1.55rem] leading-[0.98] sm:mt-2 sm:text-[2.05rem]">
                          {activeFormStep.title}
                        </h2>
                        <p className="mt-3 max-w-[30rem] text-[0.94rem] leading-7 text-[var(--text-secondary)]">
                          {activeFormStep.description}
                        </p>
                      </div>

                      <div className="home-divider" />

                      <div className="min-h-0 flex-1">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`desktop-fields-${activeIndex}`}
                            initial={contentEnter}
                            animate={{ opacity: 1, y: 0 }}
                            exit={contentExit}
                            transition={contentSwapTransition}
                            className="grid gap-3 sm:gap-4"
                          >
                            {renderFormFields()}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {submitError ? (
                        <p className="rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.84rem] leading-6 text-[var(--text-primary)]">
                          {submitError}
                        </p>
                      ) : null}

                      <div className="grid gap-2.5">
                        <div className="grid gap-3 sm:grid-cols-2 xl:w-fit">
                          <button
                            type="button"
                            className="button-secondary px-4"
                            disabled={isFirst}
                            onClick={goPrev}
                          >
                            {sceneData.previousButtonLabel}
                          </button>

                          {!isLast ? (
                            <button
                              type="button"
                              className="button-primary px-4"
                              disabled={isSubmitting}
                              onClick={goNext}
                            >
                              {sceneData.nextButtonLabel}
                            </button>
                          ) : (
                            <button className="button-primary px-4" disabled={isSubmitting} type="submit">
                              {isSubmitting ? fieldCopy.submittingLabel : sceneData.submitButtonLabel}
                            </button>
                          )}
                        </div>

                        <p className="max-w-[24rem] text-[0.84rem] leading-6 text-[var(--text-secondary)]">
                          {sceneData.footerNote}
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </RevealItem>

              <RevealGroup
                className="inquiry-support-stack grid gap-3 md:min-h-0 md:content-start"
                delay={120}
                stagger={0.1}
                amount={0.2}
              >
                <RevealItem variant="media" className="min-h-0">
                  <div className="inquiry-support-media-panel scene-focus scene-panel-shell flex min-h-[18.75rem] flex-col gap-3 p-3 sm:min-h-[20.5rem] sm:p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSupport.title}
                        initial={supportEnter}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={supportExit}
                        transition={contentSwapTransition}
                        className="grid min-h-0 gap-3"
                      >
                        <div className="scene-media-shell min-h-0">
                          <div className="scene-media-frame film-frame relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={activeSupport.image}
                              alt={`${activeSupport.title} visual placeholder.`}
                              className="h-full w-full object-cover"
                              style={{ objectPosition: activeSupport.objectPosition }}
                              decoding="async"
                            />
                            <div className="scene-media-overlay absolute inset-0" />
                            <div className="surface-note absolute left-3 top-3 max-w-[14rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)] sm:left-4 sm:top-4">
                              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                                {activeSupport.label}
                              </p>
                              <p className="mt-1.5">{sceneData.mediaNote}</p>
                            </div>
                            <div className="media-caption absolute inset-x-3 bottom-3 rounded-[1.1rem] px-4 py-3.5 sm:inset-x-4 sm:bottom-4">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                                {sceneData.progressionLabel}
                              </p>
                              <p className="mt-2 max-w-[28rem] text-[1.02rem] leading-7 text-[var(--text-primary)]">
                                {activeSupport.body}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="panel rounded-[1.12rem] p-4">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                            {sceneData.nextHeading}
                          </p>
                          <p className="mt-2 text-[0.92rem] leading-7 text-[var(--text-secondary)]">
                            {sceneData.nextBody}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </RevealItem>

                <RevealItem variant="card">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sceneData.trustPoints.map((point) => (
                      <div
                        key={point}
                        className="archive-chip rounded-[1rem] px-3.5 py-3 text-[0.84rem] leading-6 text-[var(--text-secondary)]"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </RevealItem>
              </RevealGroup>
            </div>

            <ScenePageUtilityRow className="inquiry-scene-utility md:pt-2 min-[1025px]:pt-3" />
          </div>
        </div>
      </SceneViewport>

      <SceneDetailModal
        open={isMobileSupportOpen}
        onClose={() => setIsMobileSupportOpen(false)}
        eyebrow={activeSupport.label}
        title={activeSupport.title}
        description={activeSupport.body}
      >
        <div className="panel px-3.5 py-3.5">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
            {activeFormStep.chip}
          </p>
          <p className="mt-2 text-[0.96rem] leading-6 text-[var(--text-primary)]">
            {activeFormStep.title}
          </p>
          <p className="mt-2 text-[0.86rem] leading-6 text-[var(--text-secondary)]">
            {activeFormStep.description}
          </p>
        </div>

        <div className="panel px-3.5 py-3.5">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
            {sceneData.nextHeading}
          </p>
          <p className="mt-2 text-[0.88rem] leading-6 text-[var(--text-secondary)]">
            {sceneData.nextBody}
          </p>
        </div>
      </SceneDetailModal>
    </section>
  );
}
