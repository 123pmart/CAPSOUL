"use client";

import Image from "next/image";
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
import { storyPillars } from "@/content/site";

type StoryPillarShowcaseProps = {
  shellClassName?: string;
  sectionSpacingClassName?: string;
  headingStyle?: "home" | "page";
  eyebrow: string;
  title: string;
  description: string;
  introLabel?: string;
  introDescription?: string;
  featuredLabel?: string;
  footerNote?: string;
};

export function StoryPillarShowcase({
  shellClassName = "shell",
  sectionSpacingClassName = "section-space",
  headingStyle = "page",
  eyebrow,
  title,
  description,
  introLabel = "Story map",
  introDescription = "These chapters give the conversation shape while leaving room for the real person to lead.",
  featuredLabel = "Active chapter",
  footerNote = "The strongest films feel selective and intentional rather than exhaustive.",
}: StoryPillarShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = storyPillars[activeIndex] ?? storyPillars[0];

  return (
    <section className={`${shellClassName} ${sectionSpacingClassName}`}>
      <Reveal className="scene-shell scene-shell-warm scene-pad">
        <div className="relative z-10 section-stack">
          <SectionIntro
            tone={headingStyle}
            eyebrow={eyebrow}
            title={title}
            description={description}
          />

          <RevealGroup className="content-frame-wide grid gap-4 xl:grid-cols-[minmax(20rem,0.5fr)_minmax(0,1.5fr)] xl:gap-5" stagger={0.12} amount={0.2}>
            <RevealItem variant="card">
              <div className="panel-strong rounded-[1.8rem] p-4 sm:p-5 lg:p-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                  {introLabel}
                </p>
                <p className="mt-3 max-w-[23rem] text-[0.94rem] leading-7 text-[var(--text-secondary)]">
                  {introDescription}
                </p>

                <div className="mt-5 grid gap-2.5">
                  {storyPillars.map((pillar, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <motion.button
                        key={pillar.title}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        transition={cardStateTransition}
                        animate={
                          reduceMotion
                            ? undefined
                            : isActive
                              ? { y: -2, scale: 1.004 }
                              : { y: 0, scale: 1 }
                        }
                        whileHover={reduceMotion || isActive ? undefined : subtleHoverLift}
                        whileTap={reduceMotion ? undefined : subtleTapPress}
                        className={`text-left rounded-[1.2rem] border p-4 ${
                          isActive
                            ? "border-[rgba(51,71,86,0.18)] bg-[rgba(255,255,255,0.64)] shadow-[0_18px_42px_rgba(16,22,29,0.07)]"
                            : "border-[rgba(41,49,57,0.08)] bg-[rgba(249,245,240,0.44)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                              Chapter {index + 1}
                            </p>
                            <h3 className="mt-2 text-[1.08rem] leading-tight text-[var(--text-primary)]">
                              {pillar.title}
                            </h3>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] ${
                              isActive
                                ? "border border-white/78 bg-[rgba(225,234,242,0.92)] text-[var(--accent-deep)] shadow-[0_10px_24px_rgba(152,169,189,0.14)]"
                                : "archive-chip text-[var(--text-secondary)]"
                            }`}
                          >
                            {isActive ? "Open" : "View"}
                          </span>
                        </div>
                        <p className="mt-3 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                          {pillar.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </RevealItem>

            <RevealItem variant="media">
              <div className="scene-focus p-3 sm:p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.title}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22, scale: 0.988 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -14, scale: 0.994 }}
                    transition={contentSwapTransition}
                    className="grid gap-3 xl:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)]"
                  >
                    <div className="film-frame relative min-h-[20rem] overflow-hidden sm:min-h-[24rem] xl:min-h-[36rem]">
                      <Image
                        src={active.image}
                        alt={`Editorial placeholder for the ${active.title.toLowerCase()} chapter.`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.18))]" />

                      <div className="surface-note absolute left-4 top-4 max-w-[13rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          {featuredLabel}
                        </p>
                        <p className="mt-1.5">
                          {active.chapter}
                        </p>
                      </div>

                      <div className="media-caption absolute inset-x-4 bottom-4 rounded-[1.15rem] px-4 py-3.5">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          Why it matters
                        </p>
                        <p className="mt-2 max-w-[24rem] text-[0.92rem] leading-6 text-[var(--text-primary)]">
                          {active.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 xl:grid-rows-[auto_auto_1fr]">
                    <div className="panel-ink rounded-[1.45rem] p-5 sm:p-6">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          {active.title}
                        </p>
                        <p className="mt-3 text-[1.16rem] leading-8 text-[var(--text-primary)] sm:text-[1.24rem]">
                          {active.description}
                        </p>
                    </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {active.highlights.map((highlight) => (
                          <div
                            key={highlight}
                            className="archive-chip rounded-[1.05rem] px-3.5 py-3.5 text-[0.9rem] leading-6 text-[var(--text-secondary)]"
                          >
                            {highlight}
                          </div>
                        ))}
                      </div>

                      <div className="panel rounded-[1.3rem] p-5">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          Editorial note
                        </p>
                        <p className="mt-3 text-[0.94rem] leading-7 text-[var(--text-secondary)]">
                          {footerNote}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </Reveal>
    </section>
  );
}
