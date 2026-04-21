"use client";

import { useSiteLocale } from "@/components/site-locale-provider";
import type { SiteLocale } from "@/lib/site-content-schema";

const localeOptions: SiteLocale[] = ["en", "es"];

type LanguageToggleProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageToggle({
  className = "",
  compact = false,
}: LanguageToggleProps) {
  const { locale, globalContent, isUpdatingLocale, setLocale } = useSiteLocale();
  const wrapperSpacing = compact ? "gap-0.5 px-1 py-1" : "gap-1 px-1.5 py-1.5";
  const buttonSpacing = compact ? "px-2.5 py-1.5 text-[0.72rem]" : "px-3 py-2 text-[0.74rem]";

  return (
    <div
      className={`panel inline-flex w-full items-center rounded-full ${wrapperSpacing} ${className}`.trim()}
      aria-label="Language selector"
    >
      {localeOptions.map((option) => {
        const active = locale === option;

        return (
          <button
            key={option}
            type="button"
            className={`nav-pill min-w-0 flex-1 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] ${buttonSpacing} ${
              active
                ? "border border-[rgba(255,255,255,0.92)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(223,236,250,0.98))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(111,144,181,0.16)] lg:border-[rgba(222,238,255,0.22)] lg:bg-[linear-gradient(180deg,rgba(148,194,242,0.18),rgba(56,89,133,0.26))] lg:text-white lg:shadow-[0_18px_36px_rgba(2,8,17,0.3)]"
                : "text-[var(--text-secondary)] lg:text-[rgba(223,236,250,0.78)]"
            }`}
            disabled={isUpdatingLocale}
            onClick={() => {
              void setLocale(option);
            }}
          >
            {globalContent.languageLabels[option]}
          </button>
        );
      })}
    </div>
  );
}
