"use client";

import { useEffect, type ReactNode } from "react";

type PremiumSectionVariant = "hero" | "archive" | "experience" | "process" | "preserve" | "inquire";

type PremiumSectionMotionProps = {
  children: ReactNode;
  className?: string;
  variant: PremiumSectionVariant;
};

const TUNNEL_SCENE_CHANGE_EVENT = "capsoul:tunnel-scene-change";
const TUNNEL_SCENE_NAVIGATE_EVENT = "capsoul:tunnel-scene-navigate";
const sectionSpacing = 1500;
const lerpAmount = 0.05;
const wheelMultiplier = 0.5;
const touchMultiplier = 2.25;
const keyboardStep = 460;
const opacityRange = 900;
const interactiveSelector =
  'input, textarea, select, [contenteditable="true"]';

function getScenes() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      ".tunnel-wrapper > .section-layer, .scroll-container > .scene",
    ),
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function normalizeSceneClasses(scenes: HTMLElement[], currentIdx: number, currentProgress: number) {
  scenes.forEach((scene, index) => {
    const zPosition = index * sectionSpacing - currentProgress;
    const visible = Math.abs(zPosition) < sectionSpacing * 1.55;
    scene.classList.toggle("active", index === currentIdx);
    scene.classList.toggle("exit", index < currentIdx);
    scene.dataset.sceneState = index === currentIdx ? "active" : index < currentIdx ? "exit" : "background";
    scene.setAttribute("aria-hidden", index === currentIdx ? "false" : "true");
    scene.setAttribute("tabIndex", "-1");
    scene.style.pointerEvents = index === currentIdx ? "auto" : "none";
    scene.style.visibility = visible ? "visible" : "hidden";

    const inertScene = scene as HTMLElement & { inert?: boolean };
    inertScene.inert = index !== currentIdx;
  });
}

function dispatchSceneChange(scene: HTMLElement, index: number) {
  window.dispatchEvent(
    new CustomEvent(TUNNEL_SCENE_CHANGE_EVENT, {
      detail: {
        id: scene.id,
        index,
        atmosphereSection: scene.dataset.atmosphereSection,
      },
    }),
  );
}

function findSceneIndex(scenes: HTMLElement[], id: string) {
  return scenes.findIndex((scene) => scene.id === id);
}

function shouldIgnoreKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

export function navigateTunnelToScene(id: string) {
  window.dispatchEvent(
    new CustomEvent(TUNNEL_SCENE_NAVIGATE_EVENT, {
      detail: { id },
    }),
  );
}

class TunnelScroll {
  private container: HTMLElement;
  private sections: HTMLElement[];
  private currentProgress: number;
  private targetProgress: number;
  private maxProgress: number;
  private activeIndex: number;
  private rafId = 0;
  private touchLastY = 0;
  private reducedMotionQuery: MediaQueryList;

  constructor(container: HTMLElement, sections: HTMLElement[]) {
    this.container = container;
    this.sections = sections;
    const initialIndex = Math.max(0, sections.findIndex((section) => section.classList.contains("active")));
    this.currentProgress = initialIndex * sectionSpacing;
    this.targetProgress = this.currentProgress;
    this.maxProgress = Math.max(0, (sections.length - 1) * sectionSpacing);
    this.activeIndex = initialIndex;
    this.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  }

  start() {
    this.container.dataset.tunnelEngine = "lerp";
    document.documentElement.dataset.tunnelReducedMotion = this.reducedMotionQuery.matches ? "true" : "false";
    this.applySceneTransforms(true);
    this.syncActiveScene(true);

    window.addEventListener("wheel", this.handleWheel, { passive: false });
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("touchstart", this.handleTouchStart, { passive: true });
    window.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    window.addEventListener(TUNNEL_SCENE_NAVIGATE_EVENT, this.handleNavigate);
    window.addEventListener("resize", this.handleResize);
    this.reducedMotionQuery.addEventListener("change", this.handleReducedMotionChange);

    this.rafId = window.requestAnimationFrame(this.animate);
  }

  destroy() {
    window.cancelAnimationFrame(this.rafId);
    window.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("touchstart", this.handleTouchStart);
    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener(TUNNEL_SCENE_NAVIGATE_EVENT, this.handleNavigate);
    window.removeEventListener("resize", this.handleResize);
    this.reducedMotionQuery.removeEventListener("change", this.handleReducedMotionChange);
  }

  private addProgress(delta: number) {
    this.targetProgress = clamp(this.targetProgress + delta, 0, this.maxProgress);
  }

  private goToIndex(index: number) {
    this.targetProgress = clamp(index * sectionSpacing, 0, this.maxProgress);
  }

  private applySceneTransforms(force = false) {
    const reducedMotion = this.reducedMotionQuery.matches;

    this.sections.forEach((section, index) => {
      const zPosition = index * sectionSpacing - this.currentProgress;
      const opacity = reducedMotion ? (index === this.activeIndex ? 1 : 0) : clamp(1 - Math.abs(zPosition / opacityRange), 0, 1);
      const shouldHide = !reducedMotion && Math.abs(zPosition) > sectionSpacing * 1.55;

      if (force || section.style.transform !== `translate3d(0px, 0px, ${zPosition}px)`) {
        section.style.transform = reducedMotion ? "translate3d(0, 0, 0)" : `translate3d(0, 0, ${zPosition.toFixed(2)}px)`;
      }

      section.style.opacity = opacity.toFixed(3);
      section.style.visibility = shouldHide ? "hidden" : "visible";
    });
  }

  private syncActiveScene(force = false) {
    const nextIndex = clamp(Math.round(this.currentProgress / sectionSpacing), 0, this.sections.length - 1);

    if (!force && nextIndex === this.activeIndex) {
      return;
    }

    this.activeIndex = nextIndex;
    normalizeSceneClasses(this.sections, this.activeIndex, this.currentProgress);
    dispatchSceneChange(this.sections[this.activeIndex], this.activeIndex);
  }

  private animate = () => {
    this.currentProgress += (this.targetProgress - this.currentProgress) * lerpAmount;

    if (Math.abs(this.targetProgress - this.currentProgress) < 0.05) {
      this.currentProgress = this.targetProgress;
    }

    this.container.style.setProperty("--tunnel-progress", this.currentProgress.toFixed(2));
    this.applySceneTransforms();
    this.syncActiveScene();
    this.rafId = window.requestAnimationFrame(this.animate);
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.addProgress(event.deltaY * wheelMultiplier);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (shouldIgnoreKeyboardTarget(event.target)) return;

    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      this.addProgress(event.key === "ArrowDown" ? keyboardStep : sectionSpacing);
      return;
    }

    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      this.addProgress(event.key === "ArrowUp" ? -keyboardStep : -sectionSpacing);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      this.goToIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      this.goToIndex(this.sections.length - 1);
    }
  };

  private handleTouchStart = (event: TouchEvent) => {
    this.touchLastY = event.touches[0]?.clientY ?? 0;
  };

  private handleTouchMove = (event: TouchEvent) => {
    const nextY = event.touches[0]?.clientY ?? this.touchLastY;
    const delta = this.touchLastY - nextY;
    this.touchLastY = nextY;
    event.preventDefault();
    this.addProgress(delta * touchMultiplier);
  };

  private handleNavigate = (event: Event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id;

    if (!id) return;

    const nextIdx = findSceneIndex(this.sections, id);

    if (nextIdx >= 0) {
      this.goToIndex(nextIdx);
    }
  };

  private handleResize = () => {
    this.maxProgress = Math.max(0, (this.sections.length - 1) * sectionSpacing);
    this.targetProgress = clamp(this.targetProgress, 0, this.maxProgress);
    this.currentProgress = clamp(this.currentProgress, 0, this.maxProgress);
    this.applySceneTransforms(true);
  };

  private handleReducedMotionChange = () => {
    document.documentElement.dataset.tunnelReducedMotion = this.reducedMotionQuery.matches ? "true" : "false";
    this.applySceneTransforms(true);
  };
}

export function startTunnelScrollNavigation() {
  const container = document.querySelector<HTMLElement>(".tunnel-wrapper, .scroll-container");
  const scenes = getScenes();

  if (!container || !scenes.length) {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      cleanup = startTunnelScrollNavigation();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      cleanup?.();
    };
  }

  const tunnel = new TunnelScroll(container, scenes);

  tunnel.start();

  return () => {
    tunnel.destroy();
  };
}

export function PremiumSectionMotion({
  children,
  className = "",
  variant,
}: PremiumSectionMotionProps) {
  return (
    <div className="scene-scroll" data-premium-motion-scroll={variant}>
      <div
        className={["content", className].filter(Boolean).join(" ")}
        data-premium-motion={variant}
      >
        {children}
      </div>
    </div>
  );
}

export function TunnelScrollController() {
  useEffect(() => startTunnelScrollNavigation(), []);

  return null;
}

export { TUNNEL_SCENE_CHANGE_EVENT };
