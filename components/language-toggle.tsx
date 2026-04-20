"use client";

import { useSiteLocale } from "@/components/site-locale-provider";
import type { SiteLocale } from "@/lib/site-content-schema";

const localeOptions: SiteLocale[] = ["en", "es"];

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, globalContent, isUpdatingLocale, setLocale } = useSiteLocale();

  return (
    <div
      className={`panel inline-flex w-full items-center gap-1 rounded-full px-1.5 py-1.5 ${className}`.trim()}
      aria-label="Language selector"
    >
      {localeOptions.map((option) => {
        const active = locale === option;

        return (
          <button
            key={option}
            type="button"
            className={`nav-pill min-w-0 flex-1 rounded-full px-3 py-2 text-[0.74rem] font-medium tracking-[-0.01em] ${
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
