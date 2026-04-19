import Image from "next/image";

import { RevealGroup, RevealItem, ScrollPlane } from "@/components/reveal";
import { SectionIntro } from "@/components/section-intro";
import { TransitionLink } from "@/components/transition-link";

type Action = {
  label: string;
  href: string;
};

type CtaBandProps = {
  title: string;
  description: string;
  primaryAction: Action;
  secondaryAction?: Action;
};

export function CtaBand({
  title,
  description,
  primaryAction,
  secondaryAction,
}: CtaBandProps) {
  return (
    <section className="scene-shell scene-shell-warm scene-pad">
      <div className="relative z-10 section-stack">
        <SectionIntro
          eyebrow="Next step"
          title={title}
          description={description}
        />

        <RevealGroup className="content-frame grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(19rem,0.96fr)] xl:gap-5" stagger={0.12} amount={0.2}>
          <RevealItem variant="section">
            <div className="panel-ink rounded-[1.6rem] p-5 sm:p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                Personal follow-through
              </p>
              <p className="mt-3 max-w-[34rem] text-[1rem] leading-7 text-[var(--text-primary)]">
                CAPSOUL is structured to feel composed from the first response onward, with clear next steps and a human tone throughout.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <TransitionLink className="button-primary" href={primaryAction.href}>
                  {primaryAction.label}
                </TransitionLink>
                {secondaryAction ? (
                  <TransitionLink className="button-secondary" href={secondaryAction.href}>
                    {secondaryAction.label}
                  </TransitionLink>
                ) : null}
              </div>
            </div>
          </RevealItem>

          <RevealItem variant="media">
            <ScrollPlane className="scene-focus p-3" distance={12}>
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)]">
                <div className="film-frame relative min-h-[16rem] overflow-hidden sm:min-h-[20rem] xl:min-h-[22rem]">
                  <Image
                    src="/visuals/heirloom-frame.svg"
                    alt="Editorial placeholder representing the finished CAPSOUL film as a family archive piece."
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.18))]" />
                  <div className="media-caption absolute inset-x-4 bottom-4 rounded-[1.08rem] px-4 py-3.5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      Private by default
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-primary)]">
                      The service stays intimate, direct, and clearly handled from the start.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="archive-chip rounded-[1.05rem] px-3.5 py-3.5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      Personally handled
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                      No handoff to an impersonal pipeline.
                    </p>
                  </div>
                  <div className="panel rounded-[1.05rem] p-3.5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      Clear pacing
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                      Enough structure to feel easy, never mechanical.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollPlane>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
