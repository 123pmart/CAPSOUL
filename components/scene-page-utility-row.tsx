"use client";

import { usePathname } from "next/navigation";

import { useSiteLocale } from "@/components/site-locale-provider";
import { TransitionLink } from "@/components/transition-link";
import { getAdjacentSceneRoute } from "@/lib/scene-route-order";

type ScenePageUtilityRowProps = {
  className?: string;
};

export function ScenePageUtilityRow({
  className = "",
}: ScenePageUtilityRowProps) {
  const pathname = usePathname();
  const { globalContent } = useSiteLocale();
  const previous = getAdjacentSceneRoute(pathname, "previous", globalContent.navigation);
  const next = getAdjacentSceneRoute(pathname, "next", globalContent.navigation);

  return (
    <div
      className={`hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-2 min-[1025px]:gap-3 ${className}`.trim()}
    >
      <div className="flex min-w-0 justify-start">
        {previous ? (
          <TransitionLink
            href={previous.href}
            scroll
            aria-label={`${globalContent.routeLabels.previous}: ${previous.label}`}
            className="archive-chip inline-flex min-h-[2.16rem] max-w-full items-center gap-2 rounded-full px-3 py-1.25 text-[0.72rem] leading-none text-[var(--text-secondary)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-[var(--text-primary)] min-[1025px]:min-h-[2.4rem] min-[1025px]:px-3.5 min-[1025px]:py-1.5 min-[1025px]:text-[0.78rem]"
          >
            <span aria-hidden="true" className="text-[0.86rem]">
              &larr;
            </span>
            <span className="truncate">{previous.label}</span>
          </TransitionLink>
        ) : (
          <div aria-hidden="true" className="h-[2.16rem] min-[1025px]:h-[2.4rem]" />
        )}
      </div>

      <div className="flex items-center justify-center">
        <TransitionLink
          href="/admin"
          className="archive-chip inline-flex min-h-[1.92rem] items-center rounded-full px-2.5 py-1.25 text-[0.56rem] font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)] opacity-72 transition-opacity duration-200 hover:opacity-100 min-[1025px]:min-h-[2.1rem] min-[1025px]:px-3 min-[1025px]:py-1.5 min-[1025px]:text-[0.62rem]"
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
            className="archive-chip inline-flex min-h-[2.16rem] max-w-full items-center gap-2 rounded-full px-3 py-1.25 text-[0.72rem] leading-none text-[var(--text-secondary)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-[var(--text-primary)] min-[1025px]:min-h-[2.4rem] min-[1025px]:px-3.5 min-[1025px]:py-1.5 min-[1025px]:text-[0.78rem]"
          >
            <span className="truncate">{next.label}</span>
            <span aria-hidden="true" className="text-[0.86rem]">
              &rarr;
            </span>
          </TransitionLink>
        ) : (
          <div aria-hidden="true" className="h-[2.16rem] min-[1025px]:h-[2.4rem]" />
        )}
      </div>
    </div>
  );
}
