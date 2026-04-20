"use client";

import { usePathname } from "next/navigation";

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
  const current = getSceneRouteEntry(pathname);
  const previous = getAdjacentSceneRoute(pathname, "previous");
  const next = getAdjacentSceneRoute(pathname, "next");
  const progress = getSceneRouteProgress(pathname);

  if (!progress || !current) {
    return null;
  }

  const wrapperClassName = compact ? "grid gap-2.5" : "grid gap-3";
  const cardClassName = compact
    ? "panel rounded-[1.02rem] px-3.5 py-3"
    : "panel rounded-[1.15rem] px-4 py-3.5";
  const labelClassName = compact
    ? "text-[0.63rem] tracking-[0.16em]"
    : "text-[0.66rem] tracking-[0.18em]";
  const titleClassName = compact
    ? "mt-1.5 text-[0.9rem] leading-5"
    : "mt-1.5 text-[0.94rem] leading-6";

  if (compact && isCompactViewport) {
    return (
      <div className={`${wrapperClassName} ${className}`.trim()}>
        <div className="flex items-center justify-between gap-3">
          <span className="archive-chip min-w-0 max-w-[72%] truncate rounded-full px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {current.label}
          </span>
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {String(progress.current).padStart(2, "0")} / {String(progress.total).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <span className="archive-chip min-w-0 max-w-[72%] truncate rounded-full px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          {current.label}
        </span>
        <span className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          {String(progress.current).padStart(2, "0")} / {String(progress.total).padStart(2, "0")}
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {previous ? (
          <TransitionLink href={previous.href} className={`block min-w-0 ${cardClassName}`}>
            <p className={`${labelClassName} font-semibold uppercase text-[var(--accent-deep)]`}>
              Previous
            </p>
            <p className={`${titleClassName} text-[var(--text-primary)]`}>{previous.label}</p>
          </TransitionLink>
        ) : (
          <div aria-hidden="true" className={`${cardClassName} hidden border-dashed opacity-0 sm:block`} />
        )}

        {next ? (
          <TransitionLink href={next.href} className={`block min-w-0 ${cardClassName}`}>
            <p className={`${labelClassName} font-semibold uppercase text-[var(--accent-deep)]`}>
              Next
            </p>
            <p className={`${titleClassName} text-[var(--text-primary)]`}>{next.label}</p>
          </TransitionLink>
        ) : (
          <div aria-hidden="true" className={`${cardClassName} hidden border-dashed opacity-0 sm:block`} />
        )}
      </div>
    </div>
  );
}
