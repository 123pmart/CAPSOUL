"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";

import {
  SceneTransitionContext,
  type SceneTransitionContextValue,
  type TransitionPhase,
} from "@/components/scene-transition-context";
import { routeEnterTransition, routeExitTransition } from "@/components/motion-config";
import { SceneTransitionOverlay } from "@/components/scene-transition-overlay";

type PendingNavigation = {
  href: string;
  replace: boolean;
  scroll: boolean;
};

const EXIT_DURATION_MS = Math.round(routeExitTransition.duration * 1000);
const ENTER_DURATION_MS = Math.round(routeEnterTransition.duration * 1000);

export function SceneTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const previousPathRef = useRef(pathname);

  const navigate = useCallback(
    (href: string, options?: { replace?: boolean; scroll?: boolean }) => {
      const normalizedHref = href.trim();

      if (!normalizedHref || normalizedHref === pathname) {
        return;
      }

      if (reduceMotion) {
        if (options?.replace) {
          router.replace(normalizedHref, { scroll: options?.scroll ?? false });
        } else {
          router.push(normalizedHref, { scroll: options?.scroll ?? false });
        }
        return;
      }

      if (phase !== "idle") {
        return;
      }

      pendingRef.current = {
        href: normalizedHref,
        replace: options?.replace ?? false,
        scroll: options?.scroll ?? false,
      };
      setPendingPath(normalizedHref);
      setPhase("exiting");
    },
    [pathname, phase, reduceMotion, router],
  );

  useEffect(() => {
    if (phase !== "exiting" || !pendingRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const next = pendingRef.current;

      if (!next) {
        return;
      }

      if (next.replace) {
        router.replace(next.href, { scroll: next.scroll });
      } else {
        router.push(next.href, { scroll: next.scroll });
      }
    }, EXIT_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [phase, router]);

  useEffect(() => {
    const pathnameChanged = previousPathRef.current !== pathname;

    if (!pathnameChanged) {
      return;
    }

    previousPathRef.current = pathname;

    if (reduceMotion) {
      pendingRef.current = null;
      setPendingPath(null);
      setPhase("idle");
      return;
    }

    setPhase("entering");

    const timeoutId = window.setTimeout(() => {
      pendingRef.current = null;
      setPendingPath(null);
      setPhase("idle");
    }, ENTER_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, reduceMotion]);

  const value = useMemo(
    () => ({
      phase,
      pathname,
      pendingPath,
      navigate,
    }),
    [navigate, pathname, pendingPath, phase],
  );

  return (
    <SceneTransitionContext.Provider value={value}>
      {children}
      <SceneTransitionOverlay />
    </SceneTransitionContext.Provider>
  );
}
