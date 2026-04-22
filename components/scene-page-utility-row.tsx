"use client";

import { usePathname } from "next/navigation";

import { useSiteLocale } from "@/components/site-locale-provider";
import { TransitionLink } from "@/components/transition-link";
import { getAdjacentSceneRoute } from "@/lib/scene-route-order";

type ScenePageUtilityRowProps = {
  className?: string;
  visibility?: "all" | "tablet" | "desktop";
  compact?: boolean;
};

export function ScenePageUtilityRow({
  className = "",
  visibility = "all",
  compact = false,
}: ScenePageUtilityRowProps) {
  const pathname = usePathname();
  const { globalContent } = useSiteLocale();
  const previous = getAdjacentSceneRoute(pathname, "previous", globalContent.navigation);
  const next = getAdjacentSceneRoute(pathname, "next", globalContent.navigation);
  const visibilityClass =
    visibility === "tablet"
      ? "hidden md:grid min-[1025px]:hidden"
      : visibility === "desktop"
        ? "hidden min-[1025px]:grid"
        : "hidden md:grid";
  const linkClass = compact
    ? "archive-chip inline-flex min-h-[2.15rem] max-w-full items-center gap-2 rounded-full px-3 py-1.25 text-[0.74rem] leading-none text-[var(--text-secondary)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-[var(--text-primary)]"
    : "archive-chip inline-flex min-h-[2.4rem] max-w-full items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] leading-none text-[var(--text-secondary)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-[var(--text-primary)]";
  const emptyHeightClass = compact ? "h-[2.15rem]" : "h-[2.4rem]";
  const adminClass = compact
    ? "archive-chip inline-flex min-h-[1.95rem] items-center rounded-full px-2.75 py-1.25 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)] opacity-72 transition-opacity duration-200 hover:opacity-100"
    : "archive-chip inline-flex min-h-[2.1rem] items-center rounded-full px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)] opacity-72 transition-opacity duration-200 hover:opacity-100";

  return (
    <div
      className={`${visibilityClass} md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-2.5 min-[1025px]:gap-3 ${className}`.trim()}
    >
      <div className="flex min-w-0 justify-start">
        {previous ? (
          <TransitionLink
            href={previous.href}
            scroll
            aria-label={`${globalContent.routeLabels.previous}: ${previous.label}`}
            className={linkClass}
          >
            <span aria-hidden="true" className="text-[0.86rem]">
              &larr;
            </span>
            <span className="truncate">{previous.label}</span>
          </TransitionLink>
        ) : (
          <div aria-hidden="true" className={emptyHeightClass} />
        )}
      </div>

      <div className="flex items-center justify-center">
        <TransitionLink
          href="/admin"
          className={adminClass}
        >
          {globalContent.adminEntryLabel}
        </TransitionLink>
      </div>

      <div className="flex min-w-0 justify-end">
        {next ? (
          <TransitionLink
            href={next.href}
            scroll
            aria-label={`${globalContent.routeLabels.next}: ${next.label}`}
            className={linkClass}
          >
            <span className="truncate">{next.label}</span>
            <span aria-hidden="true" className="text-[0.86rem]">
              &rarr;
            </span>
          </TransitionLink>
        ) : (
          <div aria-hidden="true" className={emptyHeightClass} />
        )}
      </div>
    </div>
  );
}
