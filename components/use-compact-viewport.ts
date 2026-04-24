"use client";

import { useEffect, useState } from "react";

export type ResponsiveSceneMode =
  | "phonePortrait"
  | "phoneLandscapeShort"
  | "tabletPortrait"
  | "tabletLandscape"
  | "desktopShortHeight"
  | "desktop";

export type ResponsiveSceneState = {
  mode: ResponsiveSceneMode;
  width: number;
  height: number;
  isLandscape: boolean;
  isTouchDevice: boolean;
  isCompact: boolean;
  isPhonePortrait: boolean;
  isPhoneLandscapeShort: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
  isDesktop: boolean;
  isDesktopShortHeight: boolean;
  usesDesktopProgression: boolean;
  prefersLiteViewportMotion: boolean;
  prefersLiteRouteOverlay: boolean;
};

const PHONE_BREAKPOINT = 768;
const SHORT_LANDSCAPE_HEIGHT = 560;
const SHORT_DESKTOP_HEIGHT = 820;
const DESKTOP_BREAKPOINT = 1025;

const defaultResponsiveSceneState: ResponsiveSceneState = {
  mode: "desktopShortHeight",
  width: 0,
  height: 0,
  isLandscape: false,
  isTouchDevice: false,
  isCompact: false,
  isPhonePortrait: false,
  isPhoneLandscapeShort: false,
  isTabletPortrait: false,
  isTabletLandscape: false,
  isDesktop: false,
  isDesktopShortHeight: true,
  usesDesktopProgression: false,
  prefersLiteViewportMotion: true,
  prefersLiteRouteOverlay: true,
};

function matchMediaQuery(query: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(query).matches;
}

export function getResponsiveSceneState(): ResponsiveSceneState {
  if (typeof window === "undefined") {
    return defaultResponsiveSceneState;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;
  const hasCoarsePointer =
    matchMediaQuery("(pointer: coarse)") || matchMediaQuery("(any-pointer: coarse)");
  const hasFinePointer =
    matchMediaQuery("(pointer: fine)") || matchMediaQuery("(any-pointer: fine)");
  const hasHover =
    matchMediaQuery("(hover: hover)") || matchMediaQuery("(any-hover: hover)");
  const touchPoints = window.navigator.maxTouchPoints ?? 0;
  const isTouchDevice = hasCoarsePointer || touchPoints > 0;
  const isPhonePortrait = !isLandscape && width < PHONE_BREAKPOINT;
  const isPhoneLandscapeShort =
    isLandscape &&
    height <= SHORT_LANDSCAPE_HEIGHT &&
    (isTouchDevice || width < DESKTOP_BREAKPOINT);
  const isTabletPortrait =
    !isPhonePortrait && !isPhoneLandscapeShort && !isLandscape && isTouchDevice;
  const isTabletLandscape =
    !isPhoneLandscapeShort && isLandscape && isTouchDevice;
  const isDesktopShortHeight =
    !isPhonePortrait &&
    !isPhoneLandscapeShort &&
    !isTabletPortrait &&
    !isTabletLandscape &&
    height <= SHORT_DESKTOP_HEIGHT;
  const isDesktop = !isPhonePortrait && !isPhoneLandscapeShort && !isTabletPortrait && !isTabletLandscape && !isDesktopShortHeight;

  const mode: ResponsiveSceneMode = isPhonePortrait
    ? "phonePortrait"
    : isPhoneLandscapeShort
      ? "phoneLandscapeShort"
      : isTabletPortrait
        ? "tabletPortrait"
        : isTabletLandscape
          ? "tabletLandscape"
          : isDesktopShortHeight
            ? "desktopShortHeight"
            : "desktop";

  const usesDesktopProgression =
    mode === "desktop" && hasFinePointer && hasHover && !isTouchDevice;
  const isCompact = mode === "phonePortrait" || mode === "phoneLandscapeShort";
  const prefersLiteViewportMotion =
    isCompact || mode === "tabletPortrait" || mode === "desktopShortHeight";
  const prefersLiteRouteOverlay =
    isCompact || mode === "tabletPortrait" || mode === "desktopShortHeight";

  return {
    mode,
    width,
    height,
    isLandscape,
    isTouchDevice,
    isCompact,
    isPhonePortrait,
    isPhoneLandscapeShort,
    isTabletPortrait,
    isTabletLandscape,
    isDesktop,
    isDesktopShortHeight,
    usesDesktopProgression,
    prefersLiteViewportMotion,
    prefersLiteRouteOverlay,
  };
}

function subscribeViewportChange(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const queries = [
    "(pointer: coarse)",
    "(any-pointer: coarse)",
    "(pointer: fine)",
    "(any-pointer: fine)",
    "(hover: hover)",
    "(any-hover: hover)",
    "(orientation: portrait)",
  ].map((query) => window.matchMedia(query));

  const handleChange = () => {
    onChange();
  };

  window.addEventListener("resize", handleChange);
  window.addEventListener("orientationchange", handleChange);

  for (const mediaQuery of queries) {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      continue;
    }

    mediaQuery.addListener(handleChange);
  }

  return () => {
    window.removeEventListener("resize", handleChange);
    window.removeEventListener("orientationchange", handleChange);

    for (const mediaQuery of queries) {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
        continue;
      }

      mediaQuery.removeListener(handleChange);
    }
  };
}

function areSceneStatesEqual(
  current: ResponsiveSceneState,
  next: ResponsiveSceneState,
) {
  return (
    current.mode === next.mode &&
    current.width === next.width &&
    current.height === next.height &&
    current.isLandscape === next.isLandscape &&
    current.isTouchDevice === next.isTouchDevice &&
    current.isCompact === next.isCompact &&
    current.isPhonePortrait === next.isPhonePortrait &&
    current.isPhoneLandscapeShort === next.isPhoneLandscapeShort &&
    current.isTabletPortrait === next.isTabletPortrait &&
    current.isTabletLandscape === next.isTabletLandscape &&
    current.isDesktop === next.isDesktop &&
    current.isDesktopShortHeight === next.isDesktopShortHeight &&
    current.usesDesktopProgression === next.usesDesktopProgression &&
    current.prefersLiteViewportMotion === next.prefersLiteViewportMotion &&
    current.prefersLiteRouteOverlay === next.prefersLiteRouteOverlay
  );
}

export function useResponsiveSceneMode() {
  const [sceneState, setSceneState] = useState<ResponsiveSceneState>(() =>
    getResponsiveSceneState(),
  );

  useEffect(() => {
    const syncSceneState = () => {
      setSceneState((current) => {
        const next = getResponsiveSceneState();

        return areSceneStatesEqual(current, next) ? current : next;
      });
    };

    syncSceneState();

    return subscribeViewportChange(syncSceneState);
  }, []);

  return sceneState;
}
