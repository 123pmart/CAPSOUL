import Image from "next/image";

import { Reveal, RevealGroup, RevealItem, ScrollPlane } from "@/components/reveal";
import { SectionIntro } from "@/components/section-intro";
import { homepage } from "@/content/site";

export function HomeEmotionalAnchor() {
  return (
    <section className="home-shell section-space-compact pt-0">
      <Reveal className="scene-shell scene-shell-cool scene-pad">
        <div className="relative z-10 section-stack">
          <SectionIntro
            tone="home"
            eyebrow={homepage.anchor.eyebrow}
            title={homepage.anchor.title}
            description={homepage.anchor.description}
          />

          <RevealGroup className="content-frame-wide grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-stretch xl:gap-5" stagger={0.12} amount={0.2}>
            <RevealItem variant="section">
              <div className="panel-ink rounded-[1.8rem] p-5 sm:p-6 lg:p-7">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  {homepage.anchor.asideTitle}
                </p>
                <p className="mt-4 max-w-[36rem] text-[1.28rem] leading-[1.5] text-[var(--text-primary)] sm:text-[1.44rem]">
                  {homepage.brandStatement}
                </p>
                <p className="mt-4 max-w-[31rem] text-[0.96rem] leading-7 text-[var(--text-secondary)]">
                  {homepage.anchor.asideDescription}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {homepage.whyThisMatters.points.map((point) => (
                    <div
                      key={point.title}
                      className="rounded-[1.2rem] border border-white/72 bg-white/44 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        {point.title}
                      </p>
                      <p className="mt-3 text-[0.92rem] leading-6 text-[var(--text-secondary)]">
                        {point.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </RevealItem>

            <RevealItem variant="media">
              <ScrollPlane className="grid gap-3 xl:grid-rows-[minmax(0,1fr)_auto]" distance={14}>
                <div className="scene-focus p-3">
                  <div className="film-frame relative min-h-[18rem] overflow-hidden sm:min-h-[22rem] xl:min-h-[32rem]">
                    <Image
                      src="/visuals/conversation-frame.svg"
                      alt="Editorial placeholder for future CAPSOUL portrait or home-environment still."
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.18))]" />
                    <div className="surface-note absolute left-4 top-4 max-w-[13rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Portrait ready
                      </p>
                      <p className="mt-1.5">
                        Designed to become stronger with still photography that carries warmth and presence.
                      </p>
                    </div>
                    <div className="media-caption absolute inset-x-4 bottom-4 rounded-[1.12rem] px-4 py-3.5">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        What families want again
                      </p>
                      <p className="mt-2 max-w-[25rem] text-[0.92rem] leading-6 text-[var(--text-primary)]">
                        Voice, cadence, humor, and the emotional temperature that photographs alone cannot preserve.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="archive-chip rounded-[1.18rem] px-4 py-3.5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      Not a montage
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                      The film is shaped around presence, message, and character rather than sentiment alone.
                    </p>
                  </div>
                  <div className="panel rounded-[1.18rem] p-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      Built for family
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                      Private by default, emotionally direct, and made to be revisited rather than consumed once.
                    </p>
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
