import Image from "next/image";

import { RevealGroup, RevealItem, ScrollPlane } from "@/components/reveal";
import { TransitionLink } from "@/components/transition-link";
import { homepage } from "@/content/site";

const hero = homepage.hero;

export function HomepageHero() {
  return (
    <section className="home-shell section-space-tight pb-4 sm:pb-5">
      <div className="scene-shell scene-shell-warm scene-pad">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-4%] top-[-8%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(103,122,138,0.16),transparent_72%)]" />
          <div className="absolute bottom-[-10%] right-[-7%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(205,183,156,0.22),transparent_72%)]" />
        </div>

        <div className="relative z-10 content-frame-wide grid min-h-[calc(100svh-8.75rem)] gap-5 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center lg:gap-7 xl:gap-9">
          <RevealGroup className="flex h-full flex-col justify-center gap-5 px-1 py-2 lg:max-w-[33.5rem]" stagger={0.11} amount={0.3}>
            <RevealItem variant="micro">
              <span className="eyebrow">{hero.eyebrow}</span>
            </RevealItem>

            <RevealItem variant="hero">
              <div className="space-y-4">
                <div className="headline-container headline-container-start">
                  <h1 className="home-heading headline-display">{hero.title}</h1>
                </div>
                <p className="max-w-[32rem] text-[0.98rem] leading-7 text-[var(--text-secondary)] sm:text-[1.03rem]">
                  {hero.description}
                </p>
              </div>
            </RevealItem>

            <RevealItem variant="card">
              <div className="flex w-full max-w-[30rem] flex-col gap-2.5 sm:flex-row">
                <TransitionLink className="button-primary sm:min-w-[11.75rem]" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </TransitionLink>
                <TransitionLink className="button-secondary sm:min-w-[11.75rem]" href={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                </TransitionLink>
              </div>
            </RevealItem>

            <RevealItem variant="card">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="panel-ink rounded-[1.5rem] p-4 sm:p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Brand promise
                  </p>
                  <p className="mt-3 text-[0.98rem] leading-7 text-[var(--text-primary)]">
                    {homepage.brandStatement}
                  </p>
                </div>

                <div className="panel rounded-[1.5rem] p-4 sm:p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    What lasts
                  </p>
                  <p className="mt-3 text-[0.94rem] leading-6 text-[var(--text-secondary)]">
                    {hero.note}
                  </p>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>

          <RevealGroup className="relative" stagger={0.12} delay={120} amount={0.2}>
            <RevealItem variant="media">
              <ScrollPlane className="scene-focus p-3 sm:p-4" distance={18}>
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.16fr)_minmax(18rem,0.84fr)]">
                  <div className="film-frame relative min-h-[24rem] overflow-hidden sm:min-h-[28rem] lg:min-h-[34rem] xl:min-h-[38rem]">
                    <Image
                      src="/visuals/hero-frame.svg"
                      alt="Editorial CAPSOUL hero placeholder prepared for portrait photography and documentary stills."
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.18))]" />

                    <div className="surface-note absolute left-4 top-4 max-w-[14rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Opening scene
                      </p>
                      <p className="mt-1.5">
                        Framed for future portraiture, home details, and the quiet gravity of a real person on camera.
                      </p>
                    </div>

                    <div className="media-caption absolute inset-x-4 bottom-4 rounded-[1.16rem] px-4 py-3.5">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Preserved chapters
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {hero.chapters.map((chapter) => (
                          <span
                            key={chapter}
                            className="rounded-full border border-white/76 bg-white/52 px-3 py-1.5 text-[0.76rem] leading-none text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                          >
                            {chapter}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 xl:grid-rows-[minmax(0,1fr)_auto]">
                    <div className="panel-strong rounded-[1.45rem] p-4 sm:p-5">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Guided reflection
                      </p>
                      <p className="mt-3 text-[0.98rem] leading-7 text-[var(--text-primary)]">
                        {hero.floatingCards[0].title}
                      </p>
                      <p className="mt-3 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                        {hero.floatingCards[0].description}
                      </p>
                    </div>

                    <div className="panel rounded-[1.45rem] p-4 sm:p-5">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Private archive
                      </p>
                      <p className="mt-3 text-[0.98rem] leading-7 text-[var(--text-primary)]">
                        {hero.floatingCards[1].title}
                      </p>
                      <p className="mt-3 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                        {hero.floatingCards[1].description}
                      </p>
                    </div>

                    <div className="archive-chip rounded-[1.2rem] px-4 py-3.5">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                        Filmed with calm
                      </p>
                      <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                        {hero.floatingCards[2].description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollPlane>
            </RevealItem>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
