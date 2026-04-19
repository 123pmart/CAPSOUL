"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  cardStateTransition,
  contentSwapTransition,
  subtleHoverLift,
  subtleTapPress,
} from "@/components/motion-config";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SceneViewport } from "@/components/scene-viewport";
import type { ScreenAction, ScreenStep } from "@/content/screen-scenes";
import { TransitionLink } from "@/components/transition-link";
import { useSceneProgression } from "@/components/use-scene-progression";

type SceneScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  steps: ScreenStep[];
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
  primaryAction,
  secondaryAction,
  stageLabel = "Scene progression",
  compactNote = "Scroll or tap through the states inside this screen.",
  tone = "cool",
}: SceneScreenProps) {
  const reduceMotion = useReducedMotion();
  const { activeIndex, goNext, goPrev, goToStep, isFirst, isLast, sceneBindings } =
    useSceneProgression({
      stepCount: steps.length,
    });

  const active = steps[activeIndex] ?? steps[0];
  const toneClassName = useMemo(() => {
    if (tone === "warm") return "scene-shell-warm";
    if (tone === "deep") return "scene-shell-deep";
    return "scene-shell-cool";
  }, [tone]);

  if (!active) {
    return null;
  }

  return (
    <section className="shell h-[calc(100dvh-4.95rem)] min-h-[calc(100svh-4.95rem)] py-3 sm:h-[calc(100dvh-5.45rem)] sm:min-h-[calc(100svh-5.45rem)] sm:py-4">
      <SceneViewport className="h-full">
        <div
          className={`scene-shell ${toneClassName} scene-pad h-full`}
          {...sceneBindings}
        >
          <div className="relative z-10 flex h-full min-h-0 flex-col gap-4 overflow-visible lg:gap-5 max-lg:overflow-y-auto">
            <RevealGroup
              className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_auto] lg:items-end"
              stagger={0.1}
              amount={0.25}
            >
              <RevealItem variant="hero">
                <div className="max-w-[34rem] space-y-3">
                  <span className="eyebrow">{eyebrow}</span>
                  <h1 className="page-heading headline-display">{title}</h1>
                  <p className="max-w-[32rem] text-[0.98rem] leading-7 text-[var(--text-secondary)] sm:text-[1.02rem]">
                    {description}
                  </p>
                </div>
              </RevealItem>

              <RevealItem variant="card">
                <div className="grid gap-2.5 sm:grid-cols-[auto_auto] lg:justify-end">
                  {primaryAction ? (
                    <TransitionLink className="button-primary" href={primaryAction.href}>
                      {primaryAction.label}
                    </TransitionLink>
                  ) : null}
                  {secondaryAction ? (
                    <TransitionLink className="button-secondary" href={secondaryAction.href}>
                      {secondaryAction.label}
                    </TransitionLink>
                  ) : null}
                </div>
              </RevealItem>
            </RevealGroup>

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:gap-5">
              <RevealGroup className="min-h-0" delay={80} stagger={0.08} amount={0.2}>
                <RevealItem variant="media" className="h-full">
                  <div className="scene-focus flex h-full min-h-[22rem] flex-col gap-3 p-3 sm:p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active.title}
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -20, scale: 0.992 }}
                        transition={contentSwapTransition}
                        className="flex h-full min-h-0 flex-col gap-3"
                      >
                        <div className="film-frame relative min-h-[16rem] flex-1 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={active.image}
                            alt={`${active.title} visual placeholder.`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.18))]" />
                          <div className="surface-note absolute left-4 top-4 max-w-[14rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                              {active.mediaLabel}
                            </p>
                            <p className="mt-1.5">{active.mediaCaption}</p>
                          </div>
                          <div className="media-caption absolute inset-x-4 bottom-4 rounded-[1.1rem] px-4 py-3.5">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                              {stageLabel}
                            </p>
                            <p className="mt-2 max-w-[28rem] text-[1.02rem] leading-7 text-[var(--text-primary)]">
                              {active.summary}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {active.bullets.map((bullet) => (
                            <div
                              key={bullet}
                              className="archive-chip rounded-[1rem] px-3.5 py-3 text-[0.86rem] leading-6 text-[var(--text-secondary)]"
                            >
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </RevealItem>
              </RevealGroup>

              <RevealGroup
                className="grid min-h-0 gap-3 lg:grid-rows-[auto_minmax(0,1fr)_auto]"
                delay={140}
                stagger={0.1}
                amount={0.2}
              >
                <RevealItem variant="micro">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="archive-chip rounded-full px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {compactNote}
                    </span>
                    <span className="text-[0.75rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                      {String(activeIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                    </span>
                  </div>
                </RevealItem>

                <RevealItem variant="card" className="min-h-0">
                  <div className="panel-strong flex h-full min-h-0 flex-col gap-3 rounded-[1.7rem] p-3.5 sm:p-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
                                ? "border-white/88 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(231,239,247,0.98))] shadow-[0_18px_34px_rgba(152,169,189,0.2)]"
                                : "border-[rgba(181,196,211,0.28)] bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(243,248,252,0.68))]"
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
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                        transition={contentSwapTransition}
                        className="flex min-h-0 flex-1 flex-col justify-between gap-4"
                      >
                        <div>
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                            Active state
                          </p>
                          <h2 className="mt-2 text-[1.7rem] leading-[0.98] text-balance sm:text-[2.05rem]">
                            {active.title}
                          </h2>
                          <p className="mt-3 max-w-[28rem] text-[0.95rem] leading-7 text-[var(--text-secondary)]">
                            {active.detail}
                          </p>
                        </div>

                        <div className="grid gap-2">
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
                  </div>
                </RevealItem>

                <RevealItem variant="micro">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="button-secondary px-4"
                      disabled={isFirst}
                      onClick={goPrev}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="button-primary px-4"
                      disabled={isLast}
                      onClick={goNext}
                    >
                      Next
                    </button>
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
