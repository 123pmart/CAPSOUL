"use client";

import { usePathname } from "next/navigation";

import { TransitionLink } from "@/components/transition-link";
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

  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <span className="archive-chip rounded-full px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          {current.label} / {String(progress.current).padStart(2, "0")} / {String(progress.total).padStart(2, "0")}
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {previous ? (
          <TransitionLink href={previous.href} className={cardClassName}>
            <p className={`${labelClassName} font-semibold uppercase text-[var(--accent-deep)]`}>
              Previous
            </p>
            <p className={`${titleClassName} text-[var(--text-primary)]`}>{previous.label}</p>
          </TransitionLink>
        ) : (
          <div aria-hidden="true" className={`${cardClassName} hidden border-dashed opacity-0 sm:block`} />
        )}

        {next ? (
          <TransitionLink href={next.href} className={cardClassName}>
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
