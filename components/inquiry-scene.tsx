"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  cardStateTransition,
  contentSwapTransition,
  subtleHoverLift,
  subtleTapPress,
} from "@/components/motion-config";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SceneViewport } from "@/components/scene-viewport";
import { TransitionLink } from "@/components/transition-link";
import { useSceneProgression } from "@/components/use-scene-progression";
import type { ResolvedInquiryContent } from "@/lib/site-content-schema";

type InquiryFormState = {
  fullName: string;
  email: string;
  phone: string;
  region: string;
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

export function InquiryScene({ sceneData }: InquirySceneProps) {
  const reduceMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState<InquiryFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
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
  } =
    useSceneProgression({
      stepCount: sceneData.formSteps.length,
      disabled: submitted || isSubmitting,
    });

  const activeSupport = sceneData.supportStates[activeIndex] ?? sceneData.supportStates[0];
  const activeFormStep = sceneData.formSteps[activeIndex] ?? sceneData.formSteps[0];

  if (!activeSupport) {
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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
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

  return (
    <section className="shell py-3 sm:py-4 lg:h-[calc(100dvh-var(--header-offset-desktop))] lg:min-h-[calc(100svh-var(--header-offset-desktop))]">
      <SceneViewport className="lg:h-full">
        <div
          className="scene-shell scene-shell-warm scene-pad lg:h-full"
          {...sceneBindings}
        >
          <div className="relative z-10 flex flex-col gap-5 overflow-visible lg:h-full lg:min-h-0 lg:gap-5">
            <RevealGroup
              className="grid gap-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,0.86fr)] lg:items-end"
              stagger={0.1}
              amount={0.25}
            >
              <RevealItem variant="hero">
                <div className="max-w-[36rem] space-y-4 sm:space-y-3.5">
                  <span className="eyebrow">{sceneData.eyebrow}</span>
                  <h1 className="page-heading headline-display">{sceneData.title}</h1>
                  <p className="max-w-[32rem] text-[0.96rem] leading-7 text-[var(--text-secondary)] sm:text-[1.02rem]">
                    {sceneData.description}
                  </p>
                </div>
              </RevealItem>

              <RevealItem variant="card">
                <div className="grid gap-2.5 sm:grid-cols-3 lg:justify-self-end">
                  {sceneData.trustPoints.map((point) => (
                    <div
                      key={point}
                      className="archive-chip rounded-full px-3.5 py-2 text-center text-[0.72rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </RevealItem>
            </RevealGroup>

            <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)] lg:gap-5">
              <RevealItem variant="section" className="min-h-0">
                <div className="panel-strong flex flex-col rounded-[1.8rem] p-4 sm:p-5 lg:h-full lg:min-h-0">
                  {submitted ? (
                    <div className="flex h-full flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <span className="eyebrow">{sceneData.successEyebrow}</span>
                        <h2 className="headline-support">{sceneData.successTitle}</h2>
                        <p className="max-w-[30rem] text-[0.96rem] leading-7 text-[var(--text-secondary)]">
                          {sceneData.successBody}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
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
                  ) : (
                    <form className="flex flex-col gap-5 lg:h-full lg:min-h-0" onSubmit={handleSubmit}>
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
                                  ? "border-white/88 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(231,239,247,0.98))] text-[var(--text-primary)] shadow-[0_18px_34px_rgba(152,169,189,0.2)]"
                                  : "border-[rgba(181,196,211,0.28)] bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(243,248,252,0.68))] text-[var(--text-secondary)]"
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
                            key={activeIndex}
                            initial={contentEnter}
                            animate={{ opacity: 1, y: 0 }}
                            exit={contentExit}
                            transition={contentSwapTransition}
                            className="grid gap-3 sm:gap-4"
                          >
                            {activeIndex === 0 ? (
                              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="fullName">
                                    Full Name
                                  </label>
                                  <input
                                    className="field-input"
                                    id="fullName"
                                    name="fullName"
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    required
                                    value={formState.fullName}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="email">
                                    Email Address
                                  </label>
                                  <input
                                    className="field-input"
                                    id="email"
                                    name="email"
                                    onChange={handleChange}
                                    placeholder="name@email.com"
                                    required
                                    type="email"
                                    value={formState.email}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="phone">
                                    Phone Number
                                  </label>
                                  <input
                                    className="field-input"
                                    id="phone"
                                    name="phone"
                                    onChange={handleChange}
                                    placeholder="Best number to reach you"
                                    value={formState.phone}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="region">
                                    Region
                                  </label>
                                  <input
                                    className="field-input"
                                    id="region"
                                    name="region"
                                    onChange={handleChange}
                                    placeholder="City, state, or region"
                                    value={formState.region}
                                  />
                                </div>
                              </div>
                            ) : null}

                            {activeIndex === 1 ? (
                              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="filmFor">
                                    Who is this film for?
                                  </label>
                                  <input
                                    className="field-input"
                                    id="filmFor"
                                    name="filmFor"
                                    onChange={handleChange}
                                    placeholder="Parent, grandparent, spouse, loved one"
                                    required
                                    value={formState.filmFor}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="relationship">
                                    Relationship to you
                                  </label>
                                  <input
                                    className="field-input"
                                    id="relationship"
                                    name="relationship"
                                    onChange={handleChange}
                                    placeholder="Father, grandmother, husband"
                                    required
                                    value={formState.relationship}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="stillLiving">
                                    Are they still living?
                                  </label>
                                  <select
                                    className="field-select"
                                    id="stillLiving"
                                    name="stillLiving"
                                    onChange={handleChange}
                                    required
                                    value={formState.stillLiving}
                                  >
                                    <option value="">Select an option</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                  <label className="field-label" htmlFor="timeline">
                                    Timing
                                  </label>
                                  <input
                                    className="field-input"
                                    id="timeline"
                                    name="timeline"
                                    onChange={handleChange}
                                    placeholder="As soon as possible, this season, flexible"
                                    value={formState.timeline}
                                  />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                  <label className="field-label" htmlFor="storyImportance">
                                    Why does this feel important now?
                                  </label>
                                  <textarea
                                    className="field-textarea"
                                    id="storyImportance"
                                    name="storyImportance"
                                    onChange={handleChange}
                                    placeholder="Share as much or as little as feels right."
                                    required
                                    value={formState.storyImportance}
                                  />
                                </div>
                              </div>
                            ) : null}

                            {activeIndex === 2 ? (
                              <div className="grid gap-3 sm:gap-4">
                                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                  <div className="space-y-1.5">
                                    <label className="field-label" htmlFor="filmingLocation">
                                      Preferred filming location
                                    </label>
                                    <input
                                      className="field-input"
                                      id="filmingLocation"
                                      name="filmingLocation"
                                      onChange={handleChange}
                                      placeholder="Home, family property, meaningful place"
                                      value={formState.filmingLocation}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="field-label" htmlFor="faithContext">
                                      Faith or family values
                                    </label>
                                    <select
                                      className="field-select"
                                      id="faithContext"
                                      name="faithContext"
                                      onChange={handleChange}
                                      value={formState.faithContext}
                                    >
                                      <option value="">Select an option</option>
                                      <option value="central">Central to the story</option>
                                      <option value="present">Present, but not central</option>
                                      <option value="not-really">Not especially</option>
                                      <option value="not-sure">Not sure yet</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="field-label" htmlFor="extraNotes">
                                    Anything else we should know?
                                  </label>
                                  <textarea
                                    className="field-textarea"
                                    id="extraNotes"
                                    name="extraNotes"
                                    onChange={handleChange}
                                    placeholder="Sensitivities, hopes for the film, or any practical notes."
                                    value={formState.extraNotes}
                                  />
                                </div>
                              </div>
                            ) : null}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {submitError ? (
                        <p className="rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.84rem] leading-6 text-[var(--text-primary)]">
                          {submitError}
                        </p>
                      ) : null}

                      <div className="grid gap-3 md:grid-cols-[auto_auto_minmax(0,1fr)] md:items-center">
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
                            {isSubmitting ? "Submitting..." : sceneData.submitButtonLabel}
                          </button>
                        )}

                        <p className="max-w-[24rem] text-[0.84rem] leading-6 text-[var(--text-secondary)] md:justify-self-end">
                          {sceneData.footerNote}
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </RevealItem>

              <RevealGroup
                className="grid gap-3 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto]"
                delay={120}
                stagger={0.1}
                amount={0.2}
              >
                <RevealItem variant="media" className="min-h-0">
                  <div className="scene-focus flex min-h-[20rem] flex-col gap-3 p-3 sm:min-h-[22rem] sm:p-4 lg:h-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSupport.title}
                        initial={supportEnter}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={supportExit}
                        transition={contentSwapTransition}
                        className="flex h-full flex-col gap-3 lg:min-h-0"
                      >
                        <div className="film-frame relative min-h-[18rem] flex-1 overflow-hidden sm:min-h-[19rem] lg:min-h-[16rem]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activeSupport.image}
                            alt={`${activeSupport.title} visual placeholder.`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.16))]" />
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
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
          </div>
        </div>
      </SceneViewport>
    </section>
  );
}
