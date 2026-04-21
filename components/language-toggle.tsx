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
                ? "border border-white/84 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(228,237,246,0.98))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(154,170,190,0.18)]"
                : "text-[var(--text-secondary)]"
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
