"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import {
  cardStateTransition,
  contentSwapTransition,
  subtleHoverLift,
  subtleTapPress,
} from "@/components/motion-config";
import { SectionIntro } from "@/components/section-intro";
import { processSteps } from "@/content/site";

type ProcessShowcasePoint = {
  title: string;
  body: string;
};

type ProcessShowcaseProps = {
  shellClassName?: string;
  sectionSpacingClassName?: string;
  headingStyle?: "home" | "page";
  eyebrow: string;
  title: string;
  description: string;
  reassuranceTitle: string;
  reassuranceDescription: string;
  stepLabel?: string;
  footerPoints?: ProcessShowcasePoint[];
};

export function ProcessShowcase({
  shellClassName = "shell",
  sectionSpacingClassName = "section-space",
  headingStyle = "page",
  eyebrow,
  title,
  description,
  reassuranceTitle,
  reassuranceDescription,
  stepLabel = "Process steps",
  footerPoints = [],
}: ProcessShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = processSteps[activeIndex] ?? processSteps[0];

  return (
    <section className={`${shellClassName} ${sectionSpacingClassName}`}>
      <Reveal className="scene-shell scene-shell-cool scene-pad">
        <div className="section-stack">
          <SectionIntro
            tone={headingStyle}
            eyebrow={eyebrow}
            title={title}
            description={description}
          />

          <RevealGroup className="panel-strong content-frame grid gap-4 rounded-[2rem] p-3.5 sm:p-4 lg:p-5 xl:grid-cols-[minmax(17rem,0.42fr)_minmax(19rem,0.58fr)_minmax(0,1fr)] xl:items-start xl:gap-5" stagger={0.12} amount={0.2}>
            <RevealItem variant="card">
              <div className="flex h-full flex-col justify-between gap-4 rounded-[1.45rem] border border-[rgba(65,75,84,0.12)] bg-[rgba(229,235,239,0.2)] p-3.5 sm:p-4">
                <div className="archive-chip rounded-[1.12rem] px-3.5 py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    {reassuranceTitle}
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                    {reassuranceDescription}
                  </p>
                </div>

                <div className="rounded-[1.12rem] border border-[rgba(65,75,84,0.12)] bg-[rgba(34,40,45,0.04)] px-3.5 py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Process tone
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                    Clear pacing, quiet direction, and enough structure to keep the family oriented without feeling mechanical.
                  </p>
                </div>
              </div>
            </RevealItem>

            <RevealItem variant="card">
              <div className="rounded-[1.45rem] border border-[rgba(65,75,84,0.12)] bg-[rgba(255,255,255,0.34)] p-3.5 sm:p-4">
                <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                  {stepLabel}
                </p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1 xl:gap-3">
                  {processSteps.map((step, index) => {
                    const activeState = index === activeIndex;

                    return (
                      <motion.button
                        key={step.step}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        transition={cardStateTransition}
                        animate={
                          reduceMotion
                            ? undefined
                            : activeState
                              ? { y: -2, scale: 1.004 }
                              : { y: 0, scale: 1 }
                        }
                        whileHover={reduceMotion || activeState ? undefined : subtleHoverLift}
                        whileTap={reduceMotion ? undefined : subtleTapPress}
                        className={`depth-hover flex min-h-[7.5rem] flex-col justify-between rounded-[1.18rem] border p-3.5 text-left sm:min-h-[8rem] sm:p-4 ${
                          activeState
                            ? "border-[rgba(63,85,102,0.24)] bg-[rgba(255,255,255,0.72)] shadow-[0_16px_36px_rgba(16,22,29,0.08)]"
                            : "border-[rgba(65,75,84,0.12)] bg-[rgba(251,248,243,0.72)]"
                        }`}
                        aria-pressed={activeState}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.17em] text-[var(--accent-deep)]">
                              {step.step}
                            </span>
                            <div>
                              <h3 className="text-[1rem] leading-tight text-[var(--text-primary)] sm:text-[1.08rem]">
                                {step.title}
                              </h3>
                              <p className="mt-1 text-[0.82rem] leading-5 text-[var(--text-secondary)]">
                                {step.cadence}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${
                              activeState
                                ? "border border-white/78 bg-[rgba(225,234,242,0.92)] text-[var(--accent-deep)] shadow-[0_10px_24px_rgba(152,169,189,0.14)]"
                                : "archive-chip text-[var(--text-secondary)]"
                            }`}
                          >
                            {activeState ? "Active" : "View"}
                          </span>
                        </div>
                        <p className="max-w-[18rem] text-[0.88rem] leading-6 text-[var(--text-secondary)]">
                          {step.details}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </RevealItem>

            <RevealItem variant="media">
              <div className="scene-focus relative p-4 sm:p-5 lg:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.step}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22, scale: 0.988 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -16, scale: 0.994 }}
                    transition={contentSwapTransition}
                    className="flex h-full min-h-[20rem] flex-col justify-between gap-5 sm:min-h-[21.5rem] xl:min-h-[24rem]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                            {active.cadence}
                          </p>
                          <h3 className="mt-2 max-w-[11ch] text-[1.9rem] leading-[0.96] text-balance sm:text-[2.15rem]">
                            {active.title}
                          </h3>
                        </div>
                        <p className="text-[clamp(3.8rem,7vw,5.8rem)] leading-none text-[rgba(63,85,102,0.14)]">
                          {active.step}
                        </p>
                      </div>

                      <div className="home-divider my-4" />

                      <p className="max-w-[31rem] text-[1rem] leading-7 text-[var(--text-primary)]">
                        {active.summary}
                      </p>
                      <p className="mt-3 max-w-[30rem] text-[0.93rem] leading-6 text-[var(--text-secondary)]">
                        {active.details}
                      </p>
                    </div>

                    <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
                      <div className="archive-chip rounded-[1rem] px-3.5 py-3.5">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          What this step protects
                        </p>
                        <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                          {active.reassurance}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-[rgba(65,75,84,0.12)] bg-[rgba(34,40,45,0.04)] px-3.5 py-3.5">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          Process tone
                        </p>
                        <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                          Gentle direction, clear communication, and a steady pace.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </RevealItem>
          </RevealGroup>

          {footerPoints.length ? (
            <div className="content-frame grid gap-2.5 md:grid-cols-3">
              {footerPoints.map((point, index) => (
                <Reveal
                  className="panel depth-hover flex h-full flex-col rounded-[1.15rem] p-4 sm:p-5"
                  variant="card"
                  delay={170 + index * 70}
                  key={point.title}
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    {point.title}
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                    {point.body}
                  </p>
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
