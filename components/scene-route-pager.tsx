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
  const isCompactViewport = useCompactViewport("(max-width: 1023px)");
  const { globalContent } = useSiteLocale();
  const labels = globalContent.navigation;
  const current = getSceneRouteEntry(pathname, labels);
  const previous = getAdjacentSceneRoute(pathname, "previous", labels);
  const next = getAdjacentSceneRoute(pathname, "next", labels);
  const progress = getSceneRouteProgress(pathname);

  if (!progress || !current) {
    return null;
  }

  const wrapperClassName = compact ? "grid gap-2.5" : "grid gap-3.5";
  const cardClassName = compact
    ? "panel rounded-[1.02rem] px-3.5 py-3"
    : "panel rounded-[1.18rem] px-4 py-3.5";
  const labelClassName = compact
    ? "text-[0.63rem] tracking-[0.16em]"
    : "text-[0.66rem] tracking-[0.18em]";
  const titleClassName = compact
    ? "mt-1.5 text-[0.9rem] leading-5"
    : "mt-1.5 text-[0.94rem] leading-6";
  const summaryClassName = compact
    ? "panel scene-route-summary flex flex-nowrap items-center justify-between gap-3 rounded-[1rem] px-3.5 py-2.5"
    : "panel-strong scene-route-summary grid rounded-[1.18rem] px-4 py-3.5";

  if (compact && isCompactViewport) {
    return (
      <div className={`${wrapperClassName} ${className}`.trim()}>
        <div className={summaryClassName}>
          <span className="archive-chip utility-pill utility-pill-tight min-w-0 max-w-[72%] truncate rounded-full text-[0.64rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
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
      <div className={summaryClassName}>
        <div className="flex flex-nowrap items-center justify-between gap-3">
          <span className="archive-chip utility-pill utility-pill-tight min-w-0 max-w-[72%] truncate rounded-full text-[0.64rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {current.label}
          </span>
          <span className="scene-counter text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {String(progress.current).padStart(2, "0")} / {String(progress.total).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="scene-route-links">
        {previous ? (
          <TransitionLink href={previous.href} className={`block min-w-0 ${cardClassName} scene-route-card`}>
            <p className={`${labelClassName} font-semibold uppercase text-[var(--accent-deep)]`}>
              {globalContent.routeLabels.previous}
            </p>
            <p className={`${titleClassName} scene-route-destination text-[var(--text-primary)]`}>
              {previous.label}
            </p>
          </TransitionLink>
        ) : null}

        {next ? (
          <TransitionLink href={next.href} className={`block min-w-0 ${cardClassName} scene-route-card`}>
            <p className={`${labelClassName} font-semibold uppercase text-[var(--accent-deep)]`}>
              {globalContent.routeLabels.next}
            </p>
            <p className={`${titleClassName} scene-route-destination text-[var(--text-primary)]`}>
              {next.label}
            </p>
          </TransitionLink>
        ) : null}
      </div>
    </div>
  );
}
