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
const animationDuration = 1200;

function getScenes() {
  return Array.from(document.querySelectorAll<HTMLElement>(".scroll-container > .scene"));
}

function normalizeSceneClasses(scenes: HTMLElement[], currentIdx: number) {
  scenes.forEach((scene, index) => {
    scene.classList.toggle("active", index === currentIdx);
    scene.classList.toggle("exit", index < currentIdx);
    scene.setAttribute("aria-hidden", index === currentIdx ? "false" : "true");
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
    return () => undefined;
  }

  let currentIdx = Math.max(0, scenes.findIndex((scene) => scene.classList.contains("active")));
  let isAnimating = false;

  normalizeSceneClasses(scenes, currentIdx);
  dispatchSceneChange(scenes[currentIdx], currentIdx);

  const goTo = (nextIdx: number) => {
    if (isAnimating || nextIdx === currentIdx || nextIdx < 0 || nextIdx > scenes.length - 1) {
      return;
    }

    isAnimating = true;
    currentIdx = nextIdx;
    normalizeSceneClasses(scenes, currentIdx);
    dispatchSceneChange(scenes[currentIdx], currentIdx);

    window.setTimeout(() => {
      isAnimating = false;
    }, animationDuration);
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (isAnimating) return;

    if (event.deltaY > 0 && currentIdx < scenes.length - 1) {
      goTo(currentIdx + 1);
    } else if (event.deltaY < 0 && currentIdx > 0) {
      goTo(currentIdx - 1);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isAnimating) return;

    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      goTo(currentIdx + 1);
    } else if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
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

  let touchStartY = 0;
  const handleTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0]?.clientY ?? 0;
  };
  const handleTouchEnd = (event: TouchEvent) => {
    if (isAnimating) return;

    const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - touchEndY;

    if (Math.abs(delta) < 44) return;

    if (delta > 0) {
      goTo(currentIdx + 1);
    } else {
      goTo(currentIdx - 1);
    }
  };

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
  };
}

export function PremiumSectionMotion({
  children,
  className = "",
  variant,
}: PremiumSectionMotionProps) {
  return (
    <div
      className={["content", className].filter(Boolean).join(" ")}
      data-premium-motion={variant}
    >
      {children}
    </div>
  );
}

export function TunnelScrollController() {
  useEffect(() => startTunnelScrollNavigation(), []);

  return null;
}

export { TUNNEL_SCENE_CHANGE_EVENT };
