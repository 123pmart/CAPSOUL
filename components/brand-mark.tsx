"use client";

import { company } from "@/content/site";
import { useSiteLocale } from "@/components/site-locale-provider";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  const { globalContent } = useSiteLocale();

  return (
    <div className="flex max-w-full items-center text-[var(--foreground)]">
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
