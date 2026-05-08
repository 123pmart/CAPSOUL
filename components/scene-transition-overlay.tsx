"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  routeEnterTransition,
  routeExitTransition,
  routeVeilTransition,
} from "@/components/motion-config";
import { useSiteTheme } from "@/components/site-theme-provider";
import { useSceneTransition } from "@/components/scene-transition-context";
import { useResponsiveSceneMode } from "@/components/use-compact-viewport";
import { getSceneRouteLabel } from "@/lib/scene-route-order";

export function SceneTransitionOverlay() {
  const { phase, pathname, pendingPath } = useSceneTransition();
  const reduceMotion = useReducedMotion();
  const responsiveSceneMode = useResponsiveSceneMode();
  const { theme } = useSiteTheme();

  if (reduceMotion || phase === "idle") {
    return null;
  }

  const activePath = phase === "exiting" ? pendingPath ?? pathname : pathname;
  const activeLabel = getSceneRouteLabel(activePath);
  const isDark = theme === "dark";
  const prefersLiteRouteOverlay = responsiveSceneMode.prefersLiteRouteOverlay;

  const compactOverlayClass = isDark
    ? "absolute inset-0 bg-[rgba(0,0,0,0.76)]"
    : "absolute inset-0 bg-[rgba(255,255,255,0.76)]";
  const largeBackdropClass = isDark
    ? "absolute inset-0 bg-[rgba(0,0,0,0.86)]"
    : "absolute inset-0 bg-[rgba(255,255,255,0.84)]";
  const largeVeilClass = isDark
    ? "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,34,34,0.82),rgba(14,14,14,0.9)_44%,rgba(0,0,0,0.94)_100%)] backdrop-blur-[4px]"
    : "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94),rgba(250,250,250,0.86)_44%,rgba(238,238,238,0.78)_100%)] backdrop-blur-[4px]";
  const largePanelClass = isDark
    ? "absolute inset-[5vh_3vw] rounded-[2.8rem] border border-white/14 bg-[linear-gradient(180deg,rgba(24,24,24,0.92),rgba(7,7,7,0.96))] shadow-[0_28px_64px_rgba(0,0,0,0.34)] backdrop-blur-[6px]"
    : "absolute inset-[5vh_3vw] rounded-[2.8rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(242,242,242,0.86))] shadow-[0_28px_64px_rgba(0,0,0,0.12)] backdrop-blur-[6px]";
  const largePanelHighlightPrimaryClass = isDark
    ? "absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_54%)]"
    : "absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94),transparent_52%)]";
  const largePanelHighlightSecondaryClass = isDark
    ? "absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.08),transparent_28%)]"
    : "absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_82%_12%,rgba(0,0,0,0.06),transparent_28%)]";

  if (prefersLiteRouteOverlay) {
    return (
      <AnimatePresence>
        <motion.div
          key={phase}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[120]"
          initial={{ opacity: phase === "exiting" ? 0 : 0.16 }}
          animate={{ opacity: phase === "exiting" ? 0.34 : 0 }}
          exit={{ opacity: 0 }}
          transition={phase === "exiting" ? routeExitTransition : routeEnterTransition}
        >
          <div className={compactOverlayClass} />
          <motion.div
            className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: phase === "exiting" ? 1 : 0, y: phase === "exiting" ? 0 : -4 }}
            exit={{ opacity: 0, y: -4 }}
            transition={routeExitTransition}
          >
            <div className="archive-chip rounded-full px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {activeLabel}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key={phase}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[120] overflow-hidden [perspective:1800px]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={largeBackdropClass}
          initial={{ opacity: phase === "exiting" ? 0 : 0.22 }}
          animate={{ opacity: phase === "exiting" ? 0.92 : 0.16 }}
          exit={{ opacity: 0 }}
          transition={routeExitTransition}
        />

        <motion.div
          className={largeVeilClass}
          initial={phase === "exiting" ? { opacity: 0 } : { opacity: 0.76 }}
          animate={phase === "exiting" ? { opacity: 1 } : { opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={routeVeilTransition}
        />

        <motion.div
          className={largePanelClass}
          initial={
            phase === "exiting"
              ? { opacity: 0, scale: 1.012, y: 10 }
              : { opacity: 0.64, scale: 1, y: 0 }
          }
          animate={
            phase === "exiting"
              ? { opacity: 0.92, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.996, y: -4 }
          }
          exit={{ opacity: 0, scale: 0.99, y: -8 }}
          transition={routeEnterTransition}
        >
          <div className={largePanelHighlightPrimaryClass} />
          <div className={largePanelHighlightSecondaryClass} />
        </motion.div>

        <motion.div
          className="absolute inset-x-0 top-1/2 z-[1] flex -translate-y-1/2 justify-center"
          initial={phase === "exiting" ? { opacity: 0, y: 10 } : { opacity: 0.84, y: 0 }}
          animate={phase === "exiting" ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          exit={{ opacity: 0, y: -8 }}
          transition={routeExitTransition}
        >
          <div className="archive-chip rounded-full px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {activeLabel}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
