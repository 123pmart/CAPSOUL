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
import { useCompactViewport } from "@/components/use-compact-viewport";

type PendingNavigation = {
  href: string;
  replace: boolean;
  scroll: boolean;
};

export function SceneTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isCompactViewport = useCompactViewport();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const previousPathRef = useRef(pathname);
  const exitDurationMs = Math.round((isCompactViewport ? 0.22 : routeExitTransition.duration) * 1000);
  const enterDurationMs = Math.round((isCompactViewport ? 0.28 : routeEnterTransition.duration) * 1000);

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
    }, exitDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [exitDurationMs, phase, router]);

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
    }, enterDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [enterDurationMs, pathname, reduceMotion]);

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
