"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { routeEnterTransition, routeExitTransition } from "@/components/motion-config";
import { useSceneTransition } from "@/components/scene-transition-context";
import { useCompactViewport } from "@/components/use-compact-viewport";

export function SceneViewport({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { phase } = useSceneTransition();
  const reduceMotion = useReducedMotion();
  const isCompactViewport = useCompactViewport();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : isCompactViewport
            ? {
                opacity: 0.56,
                y: 8,
                scale: 1,
                rotateX: 0,
              }
            : {
                opacity: 0.36,
                y: 16,
                scale: 1.006,
                rotateX: 0,
              }
      }
      animate={
        reduceMotion
          ? { opacity: 1, y: 0, scale: 1, rotateX: 0 }
          : phase === "exiting"
            ? isCompactViewport
              ? { opacity: 0.36, y: -4, scale: 0.998, rotateX: 0 }
              : { opacity: 0.22, y: -6, scale: 0.992, rotateX: 0 }
            : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
      }
      transition={phase === "exiting" ? routeExitTransition : routeEnterTransition}
      style={{ transformOrigin: "center center" }}
      className={className.trim()}
    >
      {children}
    </motion.div>
  );
}
