import type { StoryPillar } from "@/content/site";

type StoryPillarCardProps = {
  pillar: StoryPillar;
};

export function StoryPillarCard({ pillar }: StoryPillarCardProps) {
  return (
    <article className="panel depth-hover relative h-full overflow-hidden rounded-[1.32rem] p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_34%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="archive-chip inline-flex w-fit rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
            Story pillar
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
            Chapter
          </span>
        </div>
        <h3 className="mt-3 text-[1.22rem] leading-tight sm:text-[1.4rem]">
          {pillar.title}
        </h3>
        <p className="mt-2 text-[0.93rem] leading-6 text-[var(--muted-strong)]">
          {pillar.description}
        </p>
        <div className="mt-3 rounded-[1rem] border border-[rgba(65,75,84,0.1)] bg-[rgba(255,255,255,0.34)] px-3.5 py-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
            Story angle
          </p>
          <p className="mt-2 text-[0.88rem] leading-6 text-[var(--muted-strong)]">
            {pillar.chapter}
          </p>
        </div>
        <div className="mt-auto pt-4">
          <div className="rounded-[1rem] border border-[var(--line)] bg-white/42 px-3.5 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
              Why it matters
            </p>
            <p className="mt-2 text-[0.88rem] leading-6 text-[var(--muted-strong)]">
              {pillar.purpose}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pillar.highlights.slice(0, 2).map((highlight) => (
                <span
                  className="archive-chip rounded-full px-2.5 py-1.5 text-[0.73rem] leading-none text-[var(--muted-strong)]"
                  key={highlight}
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
