"use client";

import { usePathname } from "next/navigation";

import { useSiteLocale } from "@/components/site-locale-provider";
import { TransitionLink } from "@/components/transition-link";
import { getAdjacentSceneRoute } from "@/lib/scene-route-order";

type MobilePageNextLinkProps = {
  className?: string;
};

export function MobilePageNextLink({ className = "" }: MobilePageNextLinkProps) {
  const pathname = usePathname();
  const { globalContent } = useSiteLocale();
  const next = getAdjacentSceneRoute(pathname, "next", globalContent.navigation);

  if (!next) {
    return null;
  }

  return (
    <TransitionLink
      href={next.href}
      scroll
      className={`button-primary w-full px-4 ${className}`.trim()}
    >
      {`${globalContent.routeLabels.nextPagePrefix}: ${next.label}`}
    </TransitionLink>
  );
}
