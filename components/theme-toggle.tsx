"use client";

import { useSiteTheme } from "@/components/site-theme-provider";

type ThemeToggleProps = {
  className?: string;
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[0.9rem] w-[0.9rem]">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[0.9rem] w-[0.9rem]">
      <path
        d="M19.2 14.8A7.8 7.8 0 1 1 9.2 4.8a6.4 6.4 0 1 0 10 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useSiteTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      data-theme={theme}
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-thumb" aria-hidden="true" />
      <span className="theme-toggle-icon theme-toggle-icon-sun" aria-hidden="true">
        <SunIcon />
      </span>
      <span className="theme-toggle-icon theme-toggle-icon-moon" aria-hidden="true">
        <MoonIcon />
      </span>
    </button>
  );
}
