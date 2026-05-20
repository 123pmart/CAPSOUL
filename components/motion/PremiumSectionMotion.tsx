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
const animationDuration = 1100;
const boundaryEpsilon = 2;
const wheelBoundaryThreshold = 8;
const touchBoundaryThreshold = 54;
const keyboardScrollRatio = 0.78;
const interactiveSelector =
  'input, textarea, select, button, a, [contenteditable="true"], [role="button"], [role="link"]';

function getScenes() {
  return Array.from(document.querySelectorAll<HTMLElement>(".scroll-container > .scene"));
}

function normalizeSceneClasses(scenes: HTMLElement[], currentIdx: number) {
  scenes.forEach((scene, index) => {
    scene.classList.toggle("active", index === currentIdx);
    scene.classList.toggle("exit", index < currentIdx);
    scene.dataset.sceneState = index === currentIdx ? "active" : index < currentIdx ? "exit" : "background";
    scene.setAttribute("aria-hidden", index === currentIdx ? "false" : "true");
    scene.setAttribute("tabIndex", index === currentIdx ? "-1" : "-1");

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

function getSceneScroll(scene: HTMLElement | undefined) {
  if (!scene || scene.dataset.scrollMode !== "internal") {
    return null;
  }

  return scene.querySelector<HTMLElement>(".scene-scroll");
}

function isScrollable(scroller: HTMLElement | null) {
  return Boolean(scroller && scroller.scrollHeight > scroller.clientHeight + boundaryEpsilon);
}

function isAtTop(scroller: HTMLElement) {
  return scroller.scrollTop <= boundaryEpsilon;
}

function isAtBottom(scroller: HTMLElement) {
  return scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - boundaryEpsilon;
}

function routeInternalScroll(scene: HTMLElement | undefined, deltaY: number) {
  const scroller = getSceneScroll(scene);

  if (!isScrollable(scroller)) {
    return false;
  }

  if (!scroller) {
    return false;
  }

  if (deltaY > 0 && !isAtBottom(scroller)) {
    scroller.scrollBy({ top: deltaY, behavior: "auto" });
    return true;
  }

  if (deltaY < 0 && !isAtTop(scroller)) {
    scroller.scrollBy({ top: deltaY, behavior: "auto" });
    return true;
  }

  return false;
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(interactiveSelector));
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

export function startTunnelScrollNavigation() {
  const scenes = getScenes();

  if (!scenes.length) {
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

  let currentIdx = Math.max(0, scenes.findIndex((scene) => scene.classList.contains("active")));
  let isAnimating = false;
  let touchStartY = 0;
  let touchStartSceneIndex = currentIdx;

  normalizeSceneClasses(scenes, currentIdx);
  dispatchSceneChange(scenes[currentIdx], currentIdx);

  const goTo = (nextIdx: number) => {
    if (isAnimating || nextIdx === currentIdx || nextIdx < 0 || nextIdx > scenes.length - 1) {
      return;
    }

    isAnimating = true;
    const previousScene = scenes[currentIdx];
    const activeElement = document.activeElement;
    const shouldMoveFocus =
      activeElement === document.body ||
      activeElement === null ||
      (activeElement instanceof HTMLElement && previousScene.contains(activeElement));
    currentIdx = nextIdx;
    normalizeSceneClasses(scenes, currentIdx);
    dispatchSceneChange(scenes[currentIdx], currentIdx);

    if (shouldMoveFocus) {
      scenes[currentIdx].focus({ preventScroll: true });
    }

    window.setTimeout(() => {
      isAnimating = false;
    }, animationDuration);
  };

  const handleWheel = (event: WheelEvent) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    if (isAnimating) return;

    const activeScene = scenes[currentIdx];

    if (routeInternalScroll(activeScene, event.deltaY)) {
      event.preventDefault();
      return;
    }

    if (Math.abs(event.deltaY) < wheelBoundaryThreshold) {
      return;
    }

    event.preventDefault();

    if (event.deltaY > 0 && currentIdx < scenes.length - 1) {
      goTo(currentIdx + 1);
    } else if (event.deltaY < 0 && currentIdx > 0) {
      goTo(currentIdx - 1);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (shouldIgnoreKeyboardTarget(event.target)) return;
    if (isAnimating) return;

    const activeScene = scenes[currentIdx];
    const scroller = getSceneScroll(activeScene);
    const scrollDistance = scroller ? Math.max(240, scroller.clientHeight * keyboardScrollRatio) : 0;

    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      if (scroller && isScrollable(scroller) && !isAtBottom(scroller)) {
        scroller.scrollBy({ top: event.key === "ArrowDown" ? 160 : scrollDistance, behavior: "smooth" });
        return;
      }
      goTo(currentIdx + 1);
    } else if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      if (scroller && isScrollable(scroller) && !isAtTop(scroller)) {
        scroller.scrollBy({ top: event.key === "ArrowUp" ? -160 : -scrollDistance, behavior: "smooth" });
        return;
      }
      goTo(currentIdx - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(scenes.length - 1);
    }
  };

  const handleNavigate = (event: Event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id;

    if (!id) return;

    const nextIdx = findSceneIndex(scenes, id);

    if (nextIdx >= 0) {
      goTo(nextIdx);
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0]?.clientY ?? 0;
    touchStartSceneIndex = currentIdx;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (isAnimating) return;
    if (touchStartSceneIndex !== currentIdx) return;

    const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - touchEndY;

    if (Math.abs(delta) < touchBoundaryThreshold) return;

    const activeScene = scenes[currentIdx];
    const scroller = getSceneScroll(activeScene);

    if (scroller && isScrollable(scroller)) {
      if (delta > 0 && !isAtBottom(scroller)) {
        return;
      }

      if (delta < 0 && !isAtTop(scroller)) {
        return;
      }
    }

    if (delta > 0) {
      goTo(currentIdx + 1);
    } else {
      goTo(currentIdx - 1);
    }
  };

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncReducedMotion = () => {
    document.documentElement.dataset.tunnelReducedMotion = reducedMotionQuery.matches ? "true" : "false";
  };

  syncReducedMotion();
  reducedMotionQuery.addEventListener("change", syncReducedMotion);
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener(TUNNEL_SCENE_NAVIGATE_EVENT, handleNavigate);
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  return () => {
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener(TUNNEL_SCENE_NAVIGATE_EVENT, handleNavigate);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
    reducedMotionQuery.removeEventListener("change", syncReducedMotion);
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
