"use client";

import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  useReducedMotion,
} from "framer-motion";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useResponsiveSceneMode } from "@/components/use-compact-viewport";
import {
  ENABLE_CINEMATIC_MOTION,
  getMotionDevice,
  getMotionIntensity,
  premiumEase,
  type MotionDevice,
} from "@/components/motion/motion-config";

type CinematicMotionContextValue = {
  enabled: boolean;
  reducedMotion: boolean;
  device: MotionDevice;
  intensity: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  canUseScrollMotion: boolean;
  canUseHoverMotion: boolean;
};

const disabledMotionContext: CinematicMotionContextValue = {
  enabled: false,
  reducedMotion: true,
  device: "desktop",
  intensity: 0,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  canUseScrollMotion: false,
  canUseHoverMotion: false,
};

const CinematicMotionContext =
  createContext<CinematicMotionContextValue>(disabledMotionContext);

export function MotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const viewport = useResponsiveSceneMode();
  const device = getMotionDevice(viewport.width);
  const enabled = ENABLE_CINEMATIC_MOTION && !prefersReducedMotion;
  const intensity = enabled ? getMotionIntensity(device, false) : 0;

  const value = useMemo<CinematicMotionContextValue>(() => {
    const isMobile = device === "mobile";
    const isTablet = device === "tablet";
    const isDesktop = device === "desktop";

    return {
      enabled,
      reducedMotion: prefersReducedMotion || !ENABLE_CINEMATIC_MOTION,
      device,
      intensity,
      isMobile,
      isTablet,
      isDesktop,
      canUseScrollMotion: enabled && !isMobile,
      canUseHoverMotion:
        enabled &&
        !isMobile &&
        !viewport.isTouchDevice &&
        viewport.usesDesktopProgression,
    };
  }, [device, enabled, intensity, prefersReducedMotion, viewport.isTouchDevice, viewport.usesDesktopProgression]);

  const content = (
    <CinematicMotionContext.Provider value={value}>
      {children}
    </CinematicMotionContext.Provider>
  );

  if (!ENABLE_CINEMATIC_MOTION) {
    return content;
  }

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user" transition={{ ease: premiumEase }}>
        {content}
      </MotionConfig>
    </LazyMotion>
  );
}

export function useCinematicMotion() {
  return useContext(CinematicMotionContext);
}
