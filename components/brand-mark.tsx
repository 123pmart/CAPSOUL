import { company } from "@/content/site";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div
      className={`flex max-w-full items-center text-[var(--foreground)] ${
        compact ? "gap-2.25" : "gap-3"
      }`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[rgba(255,255,255,0.84)] bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(228,236,244,0.92))] shadow-[0_16px_30px_rgba(154,170,190,0.14)] backdrop-blur-xl ${
          compact ? "h-[2.2rem] w-[2.2rem]" : "h-[2.7rem] w-[2.7rem]"
        }`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_58%)]" />
        <span className="absolute inset-x-[18%] bottom-[18%] h-[36%] rounded-full bg-[radial-gradient(circle,rgba(152,171,190,0.16),transparent_72%)]" />
        <span
          className={`relative ${compact ? "text-[1rem]" : "text-[1.16rem]"}`}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          C
        </span>
      </div>
      <div className="flex min-w-0 flex-col">
        <span
          className={`truncate font-semibold uppercase text-[var(--foreground-soft)] ${
            compact
              ? "text-[0.62rem] tracking-[0.16em] sm:text-[0.7rem] sm:tracking-[0.22em]"
              : "text-[0.8rem] tracking-[0.28em] sm:text-[0.86rem]"
          }`}
        >
          {company.name}
        </span>
        {!compact ? (
          <span className="text-[0.66rem] uppercase tracking-[0.16em] text-[var(--muted)] sm:text-[0.7rem]">
            {company.descriptor}
          </span>
        ) : null}
      </div>
    </div>
  );
}
