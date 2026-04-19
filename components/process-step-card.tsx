import type { ProcessStep } from "@/content/site";

type ProcessStepCardProps = {
  step: ProcessStep;
};

export function ProcessStepCard({ step }: ProcessStepCardProps) {
  return (
    <article className="panel depth-hover relative h-full overflow-hidden rounded-[1.32rem] p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_34%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
            Step {step.step}
          </p>
          <span className="archive-chip rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
            {step.cadence}
          </span>
        </div>
        <h3 className="mt-3 text-[1.22rem] leading-tight sm:text-[1.4rem]">
          {step.title}
        </h3>
        <p className="mt-2 text-[0.93rem] leading-6 text-[var(--muted-strong)]">
          {step.summary}
        </p>
        <div className="mt-auto pt-4">
          <div className="rounded-[1rem] border border-[var(--line)] bg-white/42 px-3.5 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
              Step focus
            </p>
            <p className="mt-2 text-[0.88rem] leading-6 text-[var(--muted-strong)]">
              {step.details}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
