"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  routeEnterTransition,
  routeExitTransition,
  routeVeilTransition,
} from "@/components/motion-config";
import { useSceneTransition } from "@/components/scene-transition-context";
import { navigation } from "@/content/site";

export function SceneTransitionOverlay() {
  const { phase, pathname, pendingPath } = useSceneTransition();
  const reduceMotion = useReducedMotion();

  if (reduceMotion || phase === "idle") {
    return null;
  }

  const activePath = phase === "exiting" ? pendingPath ?? pathname : pathname;
  const activeLabel =
    navigation.find((item) => item.href === activePath)?.label ?? "CAPSOUL";

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
          className="absolute inset-0 bg-[rgba(243,247,252,0.82)]"
          initial={{ opacity: phase === "exiting" ? 0 : 0.22 }}
          animate={{ opacity: phase === "exiting" ? 0.92 : 0.16 }}
          exit={{ opacity: 0 }}
          transition={routeExitTransition}
        />

        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(238,244,250,0.82)_44%,rgba(233,240,247,0.76)_100%)] backdrop-blur-[8px]"
          initial={phase === "exiting" ? { opacity: 0 } : { opacity: 0.76 }}
          animate={phase === "exiting" ? { opacity: 1 } : { opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={routeVeilTransition}
        />

        <motion.div
          className="absolute inset-[5vh_3vw] rounded-[2.8rem] border border-white/82 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(236,242,248,0.82))] shadow-[0_36px_90px_rgba(152,169,189,0.2)] backdrop-blur-[12px]"
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
          <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94),transparent_52%)]" />
          <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_82%_12%,rgba(194,210,224,0.22),transparent_28%)]" />
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
