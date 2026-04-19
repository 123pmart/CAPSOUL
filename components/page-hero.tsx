import Image from "next/image";

import { Reveal, RevealGroup, RevealItem, ScrollPlane } from "@/components/reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  supportLabel?: string;
  supportTitle?: string;
  supportText?: string;
  highlights?: string[];
  mediaSrc?: string;
  mediaAlt?: string;
  mediaEyebrow?: string;
  mediaNote?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  supportLabel = "Private documentary",
  supportTitle = "Held with care.",
  supportText = "Every step is shaped to feel composed, personal, and editorial rather than procedural.",
  highlights = [],
  mediaSrc,
  mediaAlt = "Editorial placeholder ready for future CAPSOUL photography.",
  mediaEyebrow = "Media direction",
  mediaNote = "Prepared for portrait-led photography, documentary stills, or intimate home-environment imagery.",
}: PageHeroProps) {
  return (
    <section className="shell section-space-tight pb-2 sm:pb-3">
      <Reveal className="scene-shell scene-shell-cool scene-pad">
        <div className="pointer-events-none absolute inset-0">
          <div className="ambient-float-slow absolute -left-[5%] top-[-12%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(100,119,133,0.18),transparent_72%)]" />
          <div className="ambient-float-delayed absolute bottom-[-12%] right-[-7%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(199,180,158,0.3),transparent_72%)]" />
        </div>

        <div className="relative z-10 content-frame grid gap-4 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-6 xl:gap-7">
          <RevealGroup className="flex h-full flex-col justify-center gap-5 px-1 py-2 lg:max-w-[32.5rem]" stagger={0.11} amount={0.28}>
            <RevealItem variant="micro">
              <span className="eyebrow">{eyebrow}</span>
            </RevealItem>

            <RevealItem variant="hero">
              <div className="space-y-4">
                <div className="headline-container headline-container-start">
                  <h1 className="page-heading headline-display">{title}</h1>
                </div>
                <p className="max-w-[32rem] text-[0.98rem] leading-7 text-[var(--text-secondary)] sm:text-[1.02rem]">
                  {description}
                </p>
              </div>
            </RevealItem>

            <RevealItem variant="card">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="panel-ink rounded-[1.45rem] p-4 sm:p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    {supportLabel}
                  </p>
                  <h2 className="mt-2 text-[1.5rem] leading-[0.98] text-[var(--text-primary)] sm:text-[1.7rem]">
                    {supportTitle}
                  </h2>
                  <p className="mt-3 text-[0.94rem] leading-7 text-[var(--text-secondary)]">
                    {supportText}
                  </p>
                </div>

                <div className="panel rounded-[1.45rem] p-4 sm:p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Service markers
                  </p>
                  <div className="mt-3 grid gap-2">
                    {(highlights.length
                      ? highlights
                      : [
                          "Calm, private direction",
                          "Editorial restraint",
                          "Built as an heirloom",
                        ]
                    ).map((highlight) => (
                      <div
                        className="archive-chip rounded-[0.95rem] px-3 py-2.5 text-[0.88rem] leading-6 text-[var(--text-secondary)]"
                        key={highlight}
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>

          <RevealGroup className="grid gap-3 xl:grid-rows-[minmax(0,1fr)_auto]" stagger={0.12} delay={120} amount={0.2}>
            <RevealItem variant="media">
              <ScrollPlane className="scene-focus p-3" distance={16}>
                <div className="film-frame relative min-h-[22rem] overflow-hidden sm:min-h-[25rem] lg:min-h-[31rem] xl:min-h-[34rem]">
                  {mediaSrc ? (
                    <Image src={mediaSrc} alt={mediaAlt} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(235,226,214,0.95),rgba(213,202,189,0.9))]" />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(232,239,246,0.16))]" />

                  <div className="surface-note absolute left-4 top-4 max-w-[14rem] rounded-[1rem] px-3 py-2.5 text-[0.78rem] leading-5 text-[var(--text-secondary)]">
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      {mediaEyebrow}
                    </p>
                    <p className="mt-1.5">
                      Image-ready framing for portraiture, documentary stills, and quieter environmental detail.
                    </p>
                  </div>

                  <div className="media-caption absolute inset-x-4 bottom-4 rounded-[1.15rem] px-4 py-3.5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      Visual note
                    </p>
                    <p className="mt-2 max-w-[28rem] text-[0.92rem] leading-6 text-[var(--text-primary)]">
                      {mediaNote}
                    </p>
                  </div>
                </div>
              </ScrollPlane>
            </RevealItem>

            <RevealItem variant="card">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="archive-chip rounded-[1.12rem] px-4 py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Tone
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                    Spacious, restrained, and intentionally paced so the page feels like a scene rather than a template.
                  </p>
                </div>
                <div className="panel rounded-[1.12rem] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Photography-ready
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-secondary)]">
                    These frames are built to become stronger when portrait-led imagery is dropped in later.
                  </p>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </Reveal>
    </section>
  );
}
