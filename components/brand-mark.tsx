"use client";

import { company } from "@/content/site";
import { useSiteLocale } from "@/components/site-locale-provider";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  const { globalContent } = useSiteLocale();

  return (
    <div
      className={`flex max-w-full items-center text-[var(--foreground)] ${
        compact ? "gap-2.25" : "gap-3"
      }`}
    >
      <div
        className={`brand-mark-shell relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1rem] ${
          compact ? "h-[2.2rem] w-[2.2rem]" : "h-[2.7rem] w-[2.7rem]"
        }`}
      >
        <span className="brand-mark-topglow absolute inset-0" />
        <span className="brand-mark-bottomglow absolute inset-x-[18%] bottom-[18%] h-[36%] rounded-full" />
        <span
          className={`brand-mark-glyph relative ${compact ? "text-[1rem]" : "text-[1.16rem]"}`}
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
            {globalContent.brandDescriptor}
          </span>
        ) : null}
      </div>
    </div>
  );
}
