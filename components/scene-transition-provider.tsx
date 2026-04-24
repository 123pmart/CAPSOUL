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
  type TransitionPhase,
} from "@/components/scene-transition-context";
import { routeEnterTransition, routeExitTransition } from "@/components/motion-config";
import { SceneTransitionOverlay } from "@/components/scene-transition-overlay";
import { useResponsiveSceneMode } from "@/components/use-compact-viewport";

type PendingNavigation = {
  href: string;
  replace: boolean;
  scroll: boolean;
};

export function SceneTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const responsiveSceneMode = useResponsiveSceneMode();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const previousPathRef = useRef(pathname);
  const shouldResetScrollRef = useRef(false);
  const prefersLiteRouteOverlay = responsiveSceneMode.prefersLiteRouteOverlay;
  const exitDurationMs = Math.round(
    (prefersLiteRouteOverlay ? 0.14 : routeExitTransition.duration) * 1000,
  );
  const enterDurationMs = Math.round(
    (prefersLiteRouteOverlay ? 0.18 : routeEnterTransition.duration) * 1000,
  );

  const navigate = useCallback(
    (href: string, options?: { replace?: boolean; scroll?: boolean }) => {
      const normalizedHref = href.trim();

      if (!normalizedHref || normalizedHref === pathname) {
        return;
      }

      if (reduceMotion) {
        shouldResetScrollRef.current = options?.scroll ?? true;

        if (options?.replace) {
          router.replace(normalizedHref, { scroll: shouldResetScrollRef.current });
        } else {
          router.push(normalizedHref, { scroll: shouldResetScrollRef.current });
        }
        return;
      }

      if (phase !== "idle") {
        return;
      }

      shouldResetScrollRef.current = options?.scroll ?? true;
      pendingRef.current = {
        href: normalizedHref,
        replace: options?.replace ?? false,
        scroll: shouldResetScrollRef.current,
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
      if (shouldResetScrollRef.current) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      pendingRef.current = null;
      setPendingPath(null);
      setPhase("idle");
      shouldResetScrollRef.current = false;
      return;
    }

    let rafId: number | null = null;

    if (shouldResetScrollRef.current) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      rafId = window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }

    setPhase("entering");

    const timeoutId = window.setTimeout(() => {
      pendingRef.current = null;
      setPendingPath(null);
      setPhase("idle");
      shouldResetScrollRef.current = false;
    }, enterDurationMs);

    return () => {
      window.clearTimeout(timeoutId);

      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
    };
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
