"use client";

import { usePathname } from "next/navigation";

import { TransitionLink } from "@/components/transition-link";
import { getAdjacentSceneRoute } from "@/lib/scene-route-order";

type MobilePageNextLinkProps = {
  className?: string;
};

export function MobilePageNextLink({ className = "" }: MobilePageNextLinkProps) {
  const pathname = usePathname();
  const next = getAdjacentSceneRoute(pathname, "next");

  if (!next) {
    return null;
  }

  return (
    <TransitionLink
      href={next.href}
      scroll
      className={`button-primary w-full px-4 ${className}`.trim()}
    >
      {`Next Page: ${next.label}`}
    </TransitionLink>
  );
}
