"use client";

import { createContext, useContext } from "react";

export type TransitionPhase = "idle" | "exiting" | "entering";

export type SceneTransitionContextValue = {
  phase: TransitionPhase;
  pathname: string;
  pendingPath: string | null;
  navigate: (href: string, options?: { replace?: boolean; scroll?: boolean }) => void;
};

export const SceneTransitionContext = createContext<SceneTransitionContextValue | null>(null);

export function useSceneTransition() {
  const context = useContext(SceneTransitionContext);

  if (!context) {
    throw new Error("useSceneTransition must be used within SceneTransitionProvider.");
  }

  return context;
}
