"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

type PremiumSectionVariant = "hero" | "archive" | "experience" | "process" | "preserve" | "inquire";

type PremiumSectionMotionProps = {
  children: ReactNode;
  className?: string;
  variant: PremiumSectionVariant;
};

const reducedVars = {
  sceneScale: 1,
  sceneZ: 0,
  sceneOpacity: 1,
  sceneDim: 0,
  sceneHaze: 0,
  contentScale: 1,
  mediaScale: 1,
  railScale: 1,
  galleryScale: 1,
  archiveScale: 1,
  cardDepth: 1,
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(progress: number, stops: number[], values: number[]) {
  if (progress <= stops[0]) return values[0];

  for (let index = 1; index < stops.length; index += 1) {
    if (progress <= stops[index]) {
      const localProgress = (progress - stops[index - 1]) / (stops[index] - stops[index - 1]);
      return values[index - 1] + (values[index] - values[index - 1]) * localProgress;
    }
  }

  return values[values.length - 1];
}

function resolveCameraVars(progress: number, variant: PremiumSectionVariant, isMobile: boolean) {
  const isHero = variant === "hero";

  if (isHero) {
    return {
      sceneScale: interpolate(progress, [0, 0.5, 1], isMobile ? [1, 1, 1.012] : [1, 1, 1.035]),
      sceneZ: interpolate(progress, [0, 0.5, 1], isMobile ? [0, 0, -72] : [0, 0, -160]),
      sceneOpacity: interpolate(progress, [0, 0.2, 0.78, 1], isMobile ? [1, 1, 1, 0.92] : [1, 1, 0.96, 0.84]),
      sceneDim: interpolate(progress, [0, 0.5, 1], isMobile ? [0, 0, 0.08] : [0, 0, 0.18]),
      sceneHaze: interpolate(progress, [0, 0.5, 1], isMobile ? [0.02, 0.04, 0.14] : [0.04, 0.08, 0.24]),
      contentScale: interpolate(progress, [0, 0.5, 1], isMobile ? [1, 1, 0.99] : [1, 0.992, 0.975]),
      mediaScale: interpolate(progress, [0, 0.52, 1], isMobile ? [0.985, 1, 0.995] : [0.955, 1, 0.985]),
      railScale: interpolate(progress, [0, 0.52, 1], isMobile ? [0.975, 1, 0.99] : [0.935, 1, 0.975]),
      galleryScale: interpolate(progress, [0, 0.52, 1], isMobile ? [0.98, 1, 0.99] : [0.92, 1, 0.97]),
      archiveScale: interpolate(progress, [0, 0.5, 1], isMobile ? [0.965, 1, 0.99] : [0.9, 1, 0.97]),
      cardDepth: interpolate(progress, [0, 0.5, 1], isMobile ? [0.97, 1, 0.99] : [0.92, 1, 0.96]),
    };
  }

  return {
    sceneScale: interpolate(progress, [0, 0.5, 1], isMobile ? [0.94, 1, 1.012] : [0.88, 1, 1.035]),
    sceneZ: interpolate(progress, [0, 0.5, 1], isMobile ? [-92, 0, -72] : [-240, 0, -160]),
    sceneOpacity: interpolate(progress, [0, 0.2, 0.78, 1], isMobile ? [0.62, 1, 1, 0.9] : [0.45, 1, 0.96, 0.82]),
    sceneDim: interpolate(progress, [0, 0.5, 1], isMobile ? [0.12, 0, 0.08] : [0.24, 0, 0.18]),
    sceneHaze: interpolate(progress, [0, 0.5, 1], isMobile ? [0.18, 0.04, 0.12] : [0.34, 0.04, 0.24]),
    contentScale: interpolate(progress, [0, 0.5, 1], isMobile ? [0.98, 1, 0.99] : [0.955, 1, 0.975]),
    mediaScale: interpolate(progress, [0, 0.52, 1], isMobile ? [0.985, 1, 0.995] : [0.94, 1, 0.985]),
    railScale: interpolate(progress, [0, 0.52, 1], isMobile ? [0.975, 1, 0.99] : [0.935, 1, 0.975]),
    galleryScale: interpolate(progress, [0, 0.52, 1], isMobile ? [0.98, 1, 0.99] : [0.92, 1, 0.97]),
    archiveScale: interpolate(progress, [0, 0.5, 1], isMobile ? [0.965, 1, 0.99] : [0.9, 1, 0.97]),
    cardDepth: interpolate(progress, [0, 0.5, 1], isMobile ? [0.97, 1, 0.99] : [0.92, 1, 0.96]),
  };
}

function setCameraVars(element: HTMLDivElement, vars: typeof reducedVars) {
  element.style.setProperty("--camera-scene-scale", vars.sceneScale.toFixed(4));
  element.style.setProperty("--camera-scene-z", `${vars.sceneZ.toFixed(1)}px`);
  element.style.setProperty("--camera-scene-opacity", vars.sceneOpacity.toFixed(4));
  element.style.setProperty("--camera-scene-dim", vars.sceneDim.toFixed(4));
  element.style.setProperty("--camera-scene-haze", vars.sceneHaze.toFixed(4));
  element.style.setProperty("--camera-content-scale", vars.contentScale.toFixed(4));
  element.style.setProperty("--camera-media-scale", vars.mediaScale.toFixed(4));
  element.style.setProperty("--camera-rail-scale", vars.railScale.toFixed(4));
  element.style.setProperty("--camera-gallery-scale", vars.galleryScale.toFixed(4));
  element.style.setProperty("--camera-archive-scale", vars.archiveScale.toFixed(4));
  element.style.setProperty("--camera-card-depth", vars.cardDepth.toFixed(4));
}

export function PremiumSectionMotion({
  children,
  className = "",
  variant,
}: PremiumSectionMotionProps) {
  return (
    <div
      className={["premium-section-motion", `premium-section-motion-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      data-premium-motion={variant}
      data-camera-scene={variant}
    >
      <div className="premium-scene-plane">
        {children}
      </div>
    </div>
  );
}

export function startCameraDepthController() {
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  const update = () => {
    frame = 0;
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-camera-scene]"));

    if (reducedMotionQuery.matches) {
      scenes.forEach((scene) => setCameraVars(scene as HTMLDivElement, reducedVars));
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    scenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
      const variant = scene.dataset.cameraScene as PremiumSectionVariant;
      setCameraVars(scene as HTMLDivElement, resolveCameraVars(progress, variant, mobileQuery.matches));
    });
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  requestUpdate();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  mobileQuery.addEventListener("change", requestUpdate);
  reducedMotionQuery.addEventListener("change", requestUpdate);

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    mobileQuery.removeEventListener("change", requestUpdate);
    reducedMotionQuery.removeEventListener("change", requestUpdate);
  };
}

export function CameraDepthController() {
  useEffect(() => startCameraDepthController(), []);

  return null;
}
