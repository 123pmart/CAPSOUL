"use client";

import { usePathname } from "next/navigation";

import { useSiteLocale } from "@/components/site-locale-provider";
import { TransitionLink } from "@/components/transition-link";
import { useCompactViewport } from "@/components/use-compact-viewport";
import {
  getAdjacentSceneRoute,
  getSceneRouteEntry,
  getSceneRouteProgress,
} from "@/lib/scene-route-order";

type SceneRoutePagerProps = {
  compact?: boolean;
  className?: string;
};

export function SceneRoutePager({
  compact = false,
  className = "",
}: SceneRoutePagerProps) {
  const pathname = usePathname();
  const isCompactViewport = useCompactViewport("(max-width: 767px)");
  const { globalContent } = useSiteLocale();
  const labels = globalContent.navigation;
  const current = getSceneRouteEntry(pathname, labels);
  const previous = getAdjacentSceneRoute(pathname, "previous", labels);
  const next = getAdjacentSceneRoute(pathname, "next", labels);
  const progress = getSceneRouteProgress(pathname);

  if (!progress || !current) {
    return null;
  }

  const wrapperClassName = compact ? "grid gap-2.5" : "grid gap-2.75";

  if (compact && isCompactViewport) {
    return (
      <div className={`${wrapperClassName} ${className}`.trim()}>
        <div className="panel flex flex-nowrap items-center justify-between gap-3 rounded-[1rem] px-3.5 py-2.5">
          <span className="archive-chip utility-pill utility-pill-tight min-w-0 max-w-[72%] truncate rounded-full px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {current.label}
          </span>
          <span className="scene-counter text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {String(progress.current).padStart(2, "0")} / {String(progress.total).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      <div className="panel grid gap-3 rounded-[1.18rem] px-4 py-3.5">
        <div className="flex flex-nowrap items-center justify-between gap-3">
          <span className="archive-chip utility-pill utility-pill-tight min-w-0 max-w-[72%] truncate rounded-full px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {current.label}
          </span>
          <span className="scene-counter text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {String(progress.current).padStart(2, "0")} / {String(progress.total).padStart(2, "0")}
          </span>
        </div>

        <div className="home-divider" />

        <div className="grid gap-2.5 sm:grid-cols-2">
          {previous ? (
            <TransitionLink
              href={previous.href}
              className="archive-chip flex min-w-0 flex-col rounded-[1rem] px-3.5 py-3"
            >
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                {globalContent.routeLabels.previous}
              </p>
              <p className="mt-1.5 truncate text-[0.92rem] leading-6 text-[var(--text-primary)]">
                {previous.label}
              </p>
            </TransitionLink>
          ) : (
            <div
              aria-hidden="true"
              className="hidden rounded-[1rem] border border-dashed border-[rgba(181,196,211,0.2)] px-3.5 py-3 opacity-0 sm:block"
            />
          )}

          {next ? (
            <TransitionLink
              href={next.href}
              className="archive-chip flex min-w-0 flex-col rounded-[1rem] px-3.5 py-3"
            >
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                {globalContent.routeLabels.next}
              </p>
              <p className="mt-1.5 truncate text-[0.92rem] leading-6 text-[var(--text-primary)]">
                {next.label}
              </p>
            </TransitionLink>
          ) : (
            <div
              aria-hidden="true"
              className="hidden rounded-[1rem] border border-dashed border-[rgba(181,196,211,0.2)] px-3.5 py-3 opacity-0 sm:block"
            />
          )}
        </div>
      </div>
    </div>
  );
}
