"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  cardStateTransition,
  contentSwapTransition,
  measuredEase,
  subtleHoverLift,
  subtleTapPress,
} from "@/components/motion-config";
import { CompactSceneControls } from "@/components/compact-scene-controls";
import { MobilePageNextLink } from "@/components/mobile-page-next-link";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SceneDetailModal } from "@/components/scene-detail-modal";
import { ScenePageUtilityRow } from "@/components/scene-page-utility-row";
import { SceneRoutePager } from "@/components/scene-route-pager";
import { useSiteLocale } from "@/components/site-locale-provider";
import { SceneViewport } from "@/components/scene-viewport";
import { useCompactViewport } from "@/components/use-compact-viewport";
import { useSceneProgression } from "@/components/use-scene-progression";
import type { ScreenAction, ScreenStep } from "@/content/screen-scenes";

type SceneStepWithPresentation = ScreenStep & {
  objectPosition?: string;
};

type SceneScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  steps: SceneStepWithPresentation[];
  primaryAction?: ScreenAction;
  secondaryAction?: ScreenAction;
  stageLabel?: string;
  compactNote?: string;
  tone?: "warm" | "cool" | "deep";
};

export function SceneScreen({
  eyebrow,
  title,
  description,
  steps,
  stageLabel = "Scene progression",
  compactNote = "Scroll or tap through the states inside this screen.",
  tone = "cool",
}: SceneScreenProps) {
  const reduceMotion = useReducedMotion();
  const isPhoneViewport = useCompactViewport("(max-width: 767px)");
  const isTabletPortraitViewport = useCompactViewport(
    "(min-width: 768px) and (orientation: portrait) and (hover: none) and (pointer: coarse)",
  );
  const { globalContent } = useSiteLocale();
  const [isMobileSceneDetailOpen, setIsMobileSceneDetailOpen] = useState(false);
  const {
    activeIndex,
    goNext,
    goPrev,
    goToStep,
    isFirst,
    isLast,
    sceneBindings,
    usesViewportProgression,
  } = useSceneProgression({
    stepCount: steps.length,
  });

  const active = steps[activeIndex] ?? steps[0];
  const toneClassName = useMemo(() => {
    if (tone === "warm") return "scene-shell-warm";
    if (tone === "deep") return "scene-shell-deep";
    return "scene-shell-cool";
  }, [tone]);

  useEffect(() => {
    setIsMobileSceneDetailOpen(false);
  }, [activeIndex, isPhoneViewport]);

  if (!active) {
    return null;
  }

  const mediaEnter = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: 24, scale: 0.985 }
      : { opacity: 0, y: 14, scale: 0.996 };
  const mediaExit = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: -20, scale: 0.992 }
      : { opacity: 0, y: -10, scale: 0.998 };
  const panelEnter = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: 18 }
      : { opacity: 0, y: 10 };
  const panelExit = reduceMotion
    ? { opacity: 1 }
    : usesViewportProgression
      ? { opacity: 0, y: -12 }
      : { opacity: 0, y: -8 };

  const mobileProgressionNote = usesViewportProgression
    ? compactNote
    : globalContent.sceneLabels.arrowInstruction;
  const mobileSceneSwapTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: measuredEase };
  const sceneIntro = (
    <RevealGroup
      className="grid gap-[var(--mobile-section-gap)] md:max-w-[40rem] md:gap-4"
      stagger={0.1}
      amount={0.25}
    >
      <RevealItem variant="hero">
        <div className="max-w-[36rem] flex flex-col items-start">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="page-heading headline-display mt-[var(--mobile-label-heading-gap)]">
            {title}
          </h1>
          <p className="mt-[var(--mobile-heading-body-gap)] max-w-[32rem] text-[0.94rem] leading-6 text-[var(--text-secondary)] sm:text-[1.02rem] sm:leading-7">
            {description}
          </p>
        </div>
      </RevealItem>
    </RevealGroup>
  );
  const scenePortraitBody = (
    <div className="scene-screen-portrait-grid portrait-tablet-main-grid md:grid md:grid-cols-[minmax(0,1.02fr)_minmax(16.8rem,0.98fr)] md:items-stretch md:gap-3">
      <RevealItem variant="section" className="h-full min-h-0">
        <div className="scene-screen-portrait-main portrait-tablet-main-panel panel-strong flex h-full flex-col rounded-[1.55rem] p-3 md:min-h-0">
          <div className="flex items-center justify-end">
            <span className="scene-counter text-[0.7rem] uppercase tracking-[0.17em] text-[var(--text-tertiary)]">
              {String(activeIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </span>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={`${step.label}-tablet-portrait`}
                  type="button"
                  onClick={() => goToStep(index)}
                  transition={cardStateTransition}
                  animate={
                    reduceMotion
                      ? undefined
                      : isActive
                        ? { y: -2, scale: 1.005 }
                        : { y: 0, scale: 1 }
                  }
                  whileHover={reduceMotion || isActive ? undefined : subtleHoverLift}
                  whileTap={reduceMotion ? undefined : subtleTapPress}
                  className={`text-left rounded-[1rem] border px-3 py-2.5 ${
                    isActive ? "scene-step-chip-active" : "scene-step-chip"
                  }`}
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[var(--accent-deep)]">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[0.88rem] leading-5 text-[var(--text-primary)]">
                    {step.title}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <div className="scene-screen-portrait-copy">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
              {globalContent.sceneLabels.activeState}
            </p>
            <h2 className="mt-2 text-[1.36rem] leading-[0.98] text-balance">
              {active.title}
            </h2>
            <p className="mt-2.5 max-w-[28rem] text-[0.88rem] leading-6 text-[var(--text-secondary)]">
              {active.detail}
            </p>
          </div>

          <div className="home-divider" />

          <div className="mt-auto grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="button-secondary px-3.5 text-[0.82rem]"
              disabled={isFirst}
              onClick={goPrev}
            >
              {globalContent.routeLabels.previous}
            </button>
            <button
              type="button"
              className="button-primary px-3.5 text-[0.82rem]"
              disabled={isLast}
              onClick={goNext}
            >
              {globalContent.routeLabels.next}
            </button>
          </div>
        </div>
      </RevealItem>

      <RevealGroup
        className="scene-screen-portrait-support-stack portrait-tablet-support-stack grid h-full gap-2.5 md:min-h-0 md:content-start"
        delay={140}
        stagger={0.1}
        amount={0.2}
      >
        <RevealItem variant="media" className="portrait-tablet-support-media-item h-full min-h-0">
          <div className="scene-screen-portrait-media-panel portrait-tablet-support-media-panel scene-focus scene-panel-shell flex h-full min-h-[14.9rem] flex-col gap-2.5 p-2.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active.title}-tablet-portrait`}
                initial={mediaEnter}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={mediaExit}
                transition={contentSwapTransition}
                className="portrait-tablet-support-media-stage grid h-full min-h-0 gap-2.5"
              >
                <div className="scene-screen-portrait-media-shell scene-media-shell min-h-0">
                  <div className="scene-screen-portrait-media-frame scene-media-frame film-frame relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={active.image}
                      alt={`${active.title} visual placeholder.`}
                      decoding="async"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: active.objectPosition ?? "center center" }}
                    />
                    <div className="scene-media-overlay absolute inset-0" />
                    <div className="surface-note absolute left-2.5 top-2.5 max-w-[11rem] rounded-[0.95rem] px-2.5 py-2 text-[0.72rem] leading-5 text-[var(--text-secondary)]">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--accent-deep)]">
                        {active.mediaLabel}
                      </p>
                      <p className="mt-1">{active.mediaCaption}</p>
                    </div>
                    <div className="media-caption absolute inset-x-2.5 bottom-2.5 rounded-[0.98rem] px-3 py-2.5">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[var(--accent-deep)]">
                        {stageLabel}
                      </p>
                      <p className="mt-1.5 text-[0.88rem] leading-6 text-[var(--text-primary)]">
                        {active.summary}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="panel rounded-[1rem] p-3">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[var(--accent-deep)]">
                    {stageLabel}
                  </p>
                  <p className="mt-1.5 text-[0.86rem] leading-6 text-[var(--text-secondary)]">
                    {active.summary}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </RevealItem>

        <RevealItem variant="card">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active.label}-${activeIndex}-tablet-portrait-bullets`}
              initial={panelEnter}
              animate={{ opacity: 1, y: 0 }}
              exit={panelExit}
              transition={contentSwapTransition}
              className="grid gap-2 sm:grid-cols-2"
            >
              {active.bullets.map((bullet) => (
                <div
                  key={`${active.label}-${bullet}-tablet-portrait`}
                  className="panel rounded-[0.92rem] px-3 py-2.5 text-[0.8rem] leading-5 text-[var(--text-secondary)]"
                >
                  {bullet}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </RevealItem>
      </RevealGroup>
    </div>
  );
  const sceneUtilityRow = <ScenePageUtilityRow className="scene-screen-utility md:pt-2 min-[1025px]:pt-3" />;
  const sceneDetailModal = (
    <SceneDetailModal
      open={isMobileSceneDetailOpen}
      onClose={() => setIsMobileSceneDetailOpen(false)}
      eyebrow={active.label}
      title={active.title}
      description={active.detail}
    >
      <div className="panel px-3.5 py-3.5">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          {stageLabel}
        </p>
        <p className="mt-2 text-[0.88rem] leading-6 text-[var(--text-secondary)]">
          {active.summary}
        </p>
      </div>

      <div className="grid gap-2">
        {active.bullets.map((bullet) => (
          <div
            key={`${active.label}-mobile-modal-${bullet}`}
            className="panel px-3.5 py-3 text-[0.84rem] leading-6 text-[var(--text-secondary)]"
          >
            {bullet}
          </div>
        ))}
      </div>
    </SceneDetailModal>
  );

  if (isTabletPortraitViewport) {
    return (
      <>
        <section className="scene-screen-shell shell py-2 sm:py-4 md:flex md:h-[calc(100svh-var(--header-offset-desktop))] md:min-h-0 md:items-center md:overflow-hidden md:py-2">
          <SceneViewport className="portrait-tablet-scene-viewport scene-screen-viewport md:w-full">
            <div
              className={`portrait-tablet-scene-frame scene-screen-frame scene-shell ${toneClassName} scene-pad md:w-full`}
              {...sceneBindings}
            >
              <div className="portrait-tablet-shell-content">
                <div className="portrait-tablet-page-center-shell">
                  <div aria-hidden="true" className="portrait-tablet-page-spacer" />
                  <div className="portrait-tablet-page-group gap-[var(--mobile-section-gap)] md:gap-4 lg:gap-5">
                    {sceneIntro}
                    {scenePortraitBody}
                    {sceneUtilityRow}
                  </div>
                  <div aria-hidden="true" className="portrait-tablet-page-spacer" />
                </div>
              </div>
            </div>
          </SceneViewport>
        </section>
        {sceneDetailModal}
      </>
    );
  }

  return (
    <section className="scene-screen-shell shell py-2 sm:py-4 md:flex md:h-[calc(100svh-var(--header-offset-desktop))] md:min-h-0 md:items-start md:overflow-hidden md:py-2 min-[1025px]:items-center min-[1025px]:py-4">
        <SceneViewport className="scene-screen-viewport md:w-full">
          <div className={`scene-screen-frame scene-shell ${toneClassName} scene-pad md:w-full`} {...sceneBindings}>
          <div className="scene-screen-stack relative z-10 flex flex-col gap-[var(--mobile-section-gap)] overflow-visible md:min-h-0 md:gap-3 min-[1025px]:gap-5">
            {sceneIntro}

            <div className="grid gap-[var(--mobile-card-gap)] md:hidden">
              <RevealItem variant="micro">
                <SceneRoutePager compact />
              </RevealItem>

              <RevealItem variant="card">
                <div className="panel-strong rounded-[1.2rem] p-3.5">
                  <div className="flex flex-nowrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        {mobileProgressionNote}
                        </p>
                      </div>
                    <span className="scene-counter text-[0.72rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                      {String(activeIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="scene-mobile-stage mt-3">
                    <motion.button
                      type="button"
                      aria-expanded={isPhoneViewport ? isMobileSceneDetailOpen : undefined}
                      onClick={() => {
                        if (isPhoneViewport) {
                          setIsMobileSceneDetailOpen(true);
                        }
                      }}
                      className="scene-focus scene-mobile-card flex w-full flex-col gap-3 p-3 text-left"
                    >
                      <div className="scene-media-shell">
                        <div className="scene-media-frame film-frame relative overflow-hidden">
                          <div className="scene-mobile-media-slot">
                            <AnimatePresence initial={false} mode="sync">
                              <motion.div
                                key={`${active.label}-phone-scene`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={mobileSceneSwapTransition}
                                className="scene-mobile-media-layer"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={active.image}
                                  alt={`${active.title} visual placeholder.`}
                                  decoding="async"
                                  className="h-full w-full object-cover"
                                  style={{ objectPosition: active.objectPosition ?? "center center" }}
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.16))]" />
                                <div className="media-caption absolute inset-x-2.5 bottom-2.5 rounded-[1rem] px-3.5 py-3">
                                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                                    {active.mediaLabel}
                                  </p>
                                  <p className="mt-2 line-clamp-2 text-[0.92rem] leading-6 text-[var(--text-primary)]">
                                    {active.summary}
                                  </p>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="scene-mobile-caption-slot">
                        <AnimatePresence initial={false} mode="sync">
                          <motion.div
                            key={`${active.label}-phone-note`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={mobileSceneSwapTransition}
                            className="scene-mobile-caption-layer"
                          >
                            <p className="scene-mobile-note line-clamp-2 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                              {active.mediaCaption}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  </div>

                  <CompactSceneControls
                    className="mt-3"
                    labels={steps.map((step) => step.title)}
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

              <RevealItem variant="micro">
                <MobilePageNextLink />
              </RevealItem>
            </div>

            <div className="scene-tablet-branch md:min-h-0 md:grid-cols-[minmax(0,1.03fr)_minmax(17rem,0.97fr)] md:items-stretch md:gap-3">
              <RevealGroup className="scene-screen-tablet-media-group md:min-h-0" delay={80} stagger={0.08} amount={0.2}>
                <RevealItem variant="media" className="scene-screen-tablet-media-item min-h-0">
                  <div className="scene-screen-tablet-media-panel scene-focus scene-panel-shell flex min-h-[15.8rem] flex-col gap-2.5 p-2.5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${active.title}-tablet`}
                        initial={mediaEnter}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={mediaExit}
                        transition={contentSwapTransition}
                        className="scene-screen-tablet-media-stage grid min-h-0 gap-2.5"
                      >
                        <div className="scene-screen-tablet-media-shell scene-media-shell min-h-0">
                          <div className="scene-screen-tablet-media-frame scene-media-frame film-frame relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={active.image}
                              alt={`${active.title} visual placeholder.`}
                              decoding="async"
                              className="h-full w-full object-cover"
                              style={{ objectPosition: active.objectPosition ?? "center center" }}
                            />
                            <div className="scene-media-overlay absolute inset-0" />
                            <div className="surface-note absolute left-2.5 top-2.5 max-w-[11.5rem] rounded-[0.95rem] px-2.5 py-2 text-[0.72rem] leading-5 text-[var(--text-secondary)]">
                              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--accent-deep)]">
                                {active.mediaLabel}
                              </p>
                              <p className="mt-1">{active.mediaCaption}</p>
                            </div>
                            <div className="media-caption absolute inset-x-2.5 bottom-2.5 rounded-[0.98rem] px-3 py-2.5">
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[var(--accent-deep)]">
                                {stageLabel}
                              </p>
                              <p className="mt-1.5 text-[0.9rem] leading-6 text-[var(--text-primary)]">
                                {active.summary}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </RevealItem>
              </RevealGroup>

              <RevealGroup
                className="scene-screen-tablet-side-column grid gap-2.5 md:min-h-0 md:content-start"
                delay={140}
                stagger={0.1}
                amount={0.2}
              >
                <RevealItem variant="card" className="scene-screen-tablet-card-item min-h-0">
                  <div className="scene-screen-tablet-card panel-strong flex min-h-0 flex-col gap-2.5 rounded-[1.45rem] p-3">
                    <div className="flex items-center justify-end">
                      <span className="scene-counter text-[0.7rem] uppercase tracking-[0.17em] text-[var(--text-tertiary)]">
                        {String(activeIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {steps.map((step, index) => {
                        const isActive = index === activeIndex;

                        return (
                          <motion.button
                            key={`${step.label}-tablet`}
                            type="button"
                            onClick={() => goToStep(index)}
                            transition={cardStateTransition}
                            animate={
                              reduceMotion
                                ? undefined
                                : isActive
                                  ? { y: -2, scale: 1.005 }
                                  : { y: 0, scale: 1 }
                            }
                            whileHover={reduceMotion || isActive ? undefined : subtleHoverLift}
                            whileTap={reduceMotion ? undefined : subtleTapPress}
                            className={`text-left rounded-[1rem] border px-3 py-2.5 ${
                              isActive ? "scene-step-chip-active" : "scene-step-chip"
                            }`}
                          >
                            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[var(--accent-deep)]">
                              {step.label}
                            </p>
                            <p className="mt-1 text-[0.88rem] leading-5 text-[var(--text-primary)]">
                              {step.title}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="home-divider" />

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${active.label}-${activeIndex}-tablet`}
                        initial={panelEnter}
                        animate={{ opacity: 1, y: 0 }}
                        exit={panelExit}
                        transition={contentSwapTransition}
                        className="grid min-h-0 flex-1 content-start gap-2.5"
                      >
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                            {globalContent.sceneLabels.activeState}
                          </p>
                          <h2 className="mt-1.5 text-[1.34rem] leading-[0.98] text-balance">
                            {active.title}
                          </h2>
                          <p className="mt-2.5 text-[0.88rem] leading-6 text-[var(--text-secondary)]">
                            {active.detail}
                          </p>
                        </div>

                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {active.bullets.map((bullet) => (
                            <div
                              key={`${active.label}-${bullet}-tablet`}
                              className="panel rounded-[0.92rem] px-3 py-2.5 text-[0.8rem] leading-5 text-[var(--text-secondary)]"
                            >
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-auto grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className="button-secondary px-3.5 text-[0.82rem]"
                        disabled={isFirst}
                        onClick={goPrev}
                      >
                        {globalContent.routeLabels.previous}
                      </button>
                      <button
                        type="button"
                        className="button-primary px-3.5 text-[0.82rem]"
                        disabled={isLast}
                        onClick={goNext}
                      >
                        {globalContent.routeLabels.next}
                      </button>
                    </div>
                  </div>
                </RevealItem>
              </RevealGroup>
            </div>

            <div className="scene-desktop-branch scene-screen-grid min-[1025px]:h-full min-[1025px]:min-h-0 min-[1025px]:grid-cols-[minmax(0,1.08fr)_minmax(19.5rem,0.92fr)] min-[1025px]:items-stretch min-[1025px]:gap-5">
              <RevealGroup className="h-full min-h-0" delay={80} stagger={0.08} amount={0.2}>
                <RevealItem variant="media" className="h-full min-h-0">
                  <div className="scene-screen-media-panel scene-focus scene-panel-shell flex h-full min-h-[19rem] flex-col gap-3 p-3 sm:min-h-[21rem] sm:p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active.title}
                        initial={mediaEnter}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={mediaExit}
                        transition={contentSwapTransition}
                        className="grid h-full min-h-0 gap-3"
                      >
                        <div className="scene-media-shell h-full min-h-0">
                          <div className="scene-media-frame film-frame relative h-full overflow-hidden md:aspect-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={active.image}
                              alt={`${active.title} visual placeholder.`}
                              decoding="async"
                              className="h-full w-full object-cover"
                              style={{ objectPosition: active.objectPosition ?? "center center" }}
                            />
                            <div className="scene-media-overlay absolute inset-0" />
                            <div className="surface-note absolute left-3 top-3 max-w-[14rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)] sm:left-4 sm:top-4">
                              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                                {active.mediaLabel}
                              </p>
                              <p className="mt-1.5">{active.mediaCaption}</p>
                            </div>
                            <div className="media-caption absolute inset-x-3 bottom-3 rounded-[1.1rem] px-4 py-3.5 sm:inset-x-4 sm:bottom-4">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                                {stageLabel}
                              </p>
                              <p className="mt-2 max-w-[28rem] text-[1.02rem] leading-7 text-[var(--text-primary)]">
                                {active.summary}
                              </p>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    </AnimatePresence>
                  </div>
                </RevealItem>
              </RevealGroup>

              <RevealGroup
                className="scene-screen-side-column grid gap-3 md:h-full md:min-h-0 md:content-start"
                delay={140}
                stagger={0.1}
                amount={0.2}
              >
                <RevealItem variant="card" className="h-full min-h-0">
                  <div className="panel-strong flex h-full min-h-0 flex-col gap-3 rounded-[1.7rem] p-3.5 sm:p-4">
                    <div className="flex items-center justify-end">
                      <span className="scene-counter text-[0.75rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                        {String(activeIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {steps.map((step, index) => {
                        const isActive = index === activeIndex;

                        return (
                          <motion.button
                            key={step.label}
                            type="button"
                            onClick={() => goToStep(index)}
                            transition={cardStateTransition}
                            animate={
                              reduceMotion
                                ? undefined
                                : isActive
                                  ? { y: -3, scale: 1.01 }
                                  : { y: 0, scale: 1 }
                            }
                            whileHover={reduceMotion || isActive ? undefined : subtleHoverLift}
                            whileTap={reduceMotion ? undefined : subtleTapPress}
                            className={`text-left rounded-[1.15rem] border px-3.5 py-3 ${
                              isActive
                                ? "scene-step-chip-active"
                                : "scene-step-chip"
                            }`}
                          >
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                              {step.label}
                            </p>
                            <p className="mt-1.5 text-[0.96rem] leading-6 text-[var(--text-primary)]">
                              {step.title}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="home-divider" />

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${active.label}-${activeIndex}`}
                        initial={panelEnter}
                        animate={{ opacity: 1, y: 0 }}
                        exit={panelExit}
                        transition={contentSwapTransition}
                        className="grid min-h-0 flex-1 content-start gap-3.5"
                      >
                        <div>
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                            {globalContent.sceneLabels.activeState}
                          </p>
                          <h2 className="mt-2 text-[1.55rem] leading-[0.98] text-balance sm:text-[2.05rem]">
                            {active.title}
                          </h2>
                          <p className="mt-3 max-w-[28rem] text-[0.95rem] leading-7 text-[var(--text-secondary)]">
                            {active.detail}
                          </p>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          {active.bullets.map((bullet) => (
                            <div
                              key={`${active.label}-${bullet}`}
                              className="panel rounded-[0.98rem] px-3.5 py-3 text-[0.86rem] leading-6 text-[var(--text-secondary)]"
                            >
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-auto grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        className="button-secondary px-4"
                        disabled={isFirst}
                        onClick={goPrev}
                      >
                        {globalContent.routeLabels.previous}
                      </button>
                      <button
                        type="button"
                        className="button-primary px-4"
                        disabled={isLast}
                        onClick={goNext}
                      >
                        {globalContent.routeLabels.next}
                      </button>
                    </div>
                  </div>
                </RevealItem>
              </RevealGroup>
            </div>

            {sceneUtilityRow}
          </div>
        </div>
      </SceneViewport>

      {sceneDetailModal}
    </section>
  );
}
