"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";

import { useSceneTransition } from "@/components/scene-transition-context";

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

export function TransitionLink({
  href,
  children,
  onClick,
  scroll = true,
  replace = false,
  target,
  rel,
  ...props
}: TransitionLinkProps) {
  const { navigate } = useSceneTransition();
  const hrefValue = typeof href === "string" ? href : href.pathname ?? "";
  const isInternal = typeof hrefValue === "string" && hrefValue.startsWith("/");

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          !isInternal ||
          target === "_blank" ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        navigate(hrefValue, { replace, scroll });
      }}
      scroll={scroll}
      replace={replace}
      target={target}
      rel={rel}
      {...props}
    >
      {children}
    </Link>
  );
}
