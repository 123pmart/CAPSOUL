import Image from "next/image";

import { Reveal, RevealGroup, RevealItem, ScrollPlane } from "@/components/reveal";
import { SectionIntro } from "@/components/section-intro";
import { TransitionLink } from "@/components/transition-link";
import { homepage } from "@/content/site";

export function HomeClosingCta() {
  return (
    <section className="home-shell section-space-tight pt-0">
      <Reveal className="scene-shell scene-shell-cool scene-pad">
        <div className="relative z-10 section-stack">
          <SectionIntro
            tone="home"
            eyebrow={homepage.cta.eyebrow}
            title={homepage.cta.title}
            description={homepage.cta.description}
          />

          <RevealGroup className="content-frame-wide grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] xl:gap-5" stagger={0.12} amount={0.2}>
            <RevealItem variant="media">
              <ScrollPlane className="scene-focus p-3 sm:p-4" distance={14}>
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
                  <div className="film-frame relative min-h-[20rem] overflow-hidden sm:min-h-[24rem] xl:min-h-[31rem]">
                    <Image
                      src="/visuals/heirloom-frame.svg"
                      alt="Editorial placeholder representing the CAPSOUL film as a private family keepsake."
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.18))]" />
                    <div className="surface-note absolute left-4 top-4 max-w-[14rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Heirloom-ready
                      </p>
                      <p className="mt-1.5">
                        Built for future stills of the film, archive objects, and the family contexts it lives within.
                      </p>
                    </div>
                    <div className="media-caption absolute inset-x-4 bottom-4 rounded-[1.16rem] px-4 py-3.5">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Private archive
                      </p>
                      <p className="mt-2 max-w-[26rem] text-[0.92rem] leading-6 text-[var(--text-primary)]">
                        A finished film that feels personal enough to revisit on ordinary days and defining ones.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="panel-ink rounded-[1.45rem] p-5 sm:p-6">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                        Final invitation
                      </p>
                      <p className="mt-3 text-[1rem] leading-7 text-[var(--text-primary)]">
                        If one person comes to mind immediately, the next step is simply to begin the conversation.
                      </p>
                      <div className="mt-5 flex flex-col gap-2.5">
                        <TransitionLink className="button-primary" href={homepage.cta.primaryCta.href}>
                          {homepage.cta.primaryCta.label}
                        </TransitionLink>
                        <TransitionLink className="button-secondary" href={homepage.cta.secondaryCta.href}>
                          {homepage.cta.secondaryCta.label}
                        </TransitionLink>
                      </div>
                      <p className="mt-4 text-[0.8rem] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                        {homepage.cta.note}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {homepage.heirloom.points.map((point) => (
                        <div
                          key={point}
                          className="archive-chip rounded-[1.05rem] px-3.5 py-3.5 text-[0.9rem] leading-6 text-[var(--text-secondary)]"
                        >
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollPlane>
            </RevealItem>
          </RevealGroup>
        </div>
      </Reveal>
    </section>
  );
}
