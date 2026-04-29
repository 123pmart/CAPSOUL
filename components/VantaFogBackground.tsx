"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

import { useSiteTheme } from "@/components/site-theme-provider";

type VantaEffect = {
  destroy: () => void;
};

type VantaFogFactory = (options: Record<string, unknown>) => VantaEffect;

type VantaFogModule =
  | VantaFogFactory
  | {
  default?: VantaFogFactory | { default?: VantaFogFactory };
};

function resolveVantaFog(module: VantaFogModule): VantaFogFactory | null {
  if (typeof module === "function") {
    return module;
  }

  if (typeof module.default === "function") {
    return module.default;
  }

  if (module.default && typeof module.default.default === "function") {
    return module.default.default;
  }

  return null;
}

const fogThemes = {
  light: {
    highlightColor: 0xffffff,
    midtoneColor: 0x87b4e3,
    lowlightColor: 0x4f7da9,
    baseColor: 0xe2edf8,
    blurFactor: 0.48,
    speed: 0.48,
    zoom: 0.72,
  },
  dark: {
    highlightColor: 0xc4e0ff,
    midtoneColor: 0x2c4567,
    lowlightColor: 0x07111f,
    baseColor: 0x040912,
    blurFactor: 0.54,
    speed: 0.52,
    zoom: 0.72,
  },
} as const;

export default function VantaFogBackground() {
  const ref = useRef<HTMLDivElement | null>(null);
  const effect = useRef<VantaEffect | null>(null);
  const reduceMotion = useReducedMotion();
  const { theme } = useSiteTheme();

  useEffect(() => {
    let cancelled = false;

    async function loadVanta() {
      if (effect.current) {
        effect.current.destroy();
        effect.current = null;
      }

      if (!ref.current || reduceMotion) {
        return;
      }

      try {
        const VANTA = (await import("vanta/dist/vanta.fog.min")) as VantaFogModule;
        const fog = resolveVantaFog(VANTA);

        if (cancelled || !ref.current || !fog) {
          return;
        }

        (window as typeof window & { THREE?: typeof THREE }).THREE = THREE;

        effect.current = fog({
          el: ref.current,
          THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          backgroundAlpha: 0,
          forceAnimate: true,
          scale: 1.15,
          scaleMobile: 1.35,
          ...fogThemes[theme],
        });
      } catch {
        effect.current = null;
      }
    }

    loadVanta();

    return () => {
      cancelled = true;

      if (effect.current) {
        effect.current.destroy();
        effect.current = null;
      }
    };
  }, [reduceMotion, theme]);

  return (
    <div ref={ref} aria-hidden="true" className="vanta-fog-background">
      <span className="vanta-fog-atmosphere" />
      <span className="vanta-fog-scroll-glow" />
      <span className="vanta-fog-grain" />
    </div>
  );
}
