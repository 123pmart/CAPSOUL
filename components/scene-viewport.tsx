"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { routeEnterTransition, routeExitTransition } from "@/components/motion-config";
import { useSceneTransition } from "@/components/scene-transition-context";
import { useResponsiveSceneMode } from "@/components/use-compact-viewport";

export function SceneViewport({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { phase } = useSceneTransition();
  const reduceMotion = useReducedMotion();
  const responsiveSceneMode = useResponsiveSceneMode();
  const prefersLiteViewportMotion = responsiveSceneMode.prefersLiteViewportMotion;

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : prefersLiteViewportMotion
            ? {
                opacity: 0.76,
                y: 4,
                scale: 1,
                rotateX: 0,
              }
            : {
                opacity: 0.36,
                y: 12,
                scale: 1.003,
                rotateX: 0,
              }
      }
      animate={
        reduceMotion
          ? { opacity: 1, y: 0, scale: 1, rotateX: 0 }
          : phase === "exiting"
            ? prefersLiteViewportMotion
              ? { opacity: 0.44, y: -2, scale: 1, rotateX: 0 }
              : { opacity: 0.22, y: -5, scale: 0.994, rotateX: 0 }
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
