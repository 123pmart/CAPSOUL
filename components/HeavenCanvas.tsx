"use client";

import { useEffect, useRef } from "react";

type CloudField = {
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  phase: number;
  speed: number;
  alpha: number;
  scaleX: number;
  scaleY: number;
};

function createSeededRandom(seed: number) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function getThemeIsDark() {
  const root = document.documentElement;
  const theme = `${root.getAttribute("data-theme") ?? ""} ${root.className}`;

  return theme.includes("dark");
}

function wrapRange(value: number, min: number, max: number) {
  const range = max - min;

  return ((((value - min) % range) + range) % range) + min;
}

function buildFields(width: number, height: number, isDark: boolean): CloudField[] {
  const random = createSeededRandom(isDark ? 77113 : 44191);
  const minViewport = Math.min(width, height);
  const maxViewport = Math.max(width, height);
  const count = isDark ? 18 : 26;

  return Array.from({ length: count }, (_, index) => {
    const band = index / Math.max(1, count - 1);

    return {
      x: -0.12 + random() * 1.24,
      y: -0.08 + band * 1.16 + (random() - 0.5) * 0.2,
      radius: minViewport * (0.34 + random() * 0.74) + maxViewport * 0.04,
      driftX: (random() - 0.5) * 0.000018,
      driftY: (random() - 0.5) * 0.000012,
      phase: random() * Math.PI * 2,
      speed: 0.000035 + random() * 0.000055,
      alpha: isDark ? 0.42 + random() * 0.22 : 0.7 + random() * 0.3,
      scaleX: 1.25 + random() * 1.35,
      scaleY: 0.54 + random() * 0.64,
    };
  });
}

export default function HeavenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isDark = getThemeIsDark();
    let fields: CloudField[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      fields = buildFields(width, height, isDark);
    };

    const drawBaseAtmosphere = () => {
      context.clearRect(0, 0, width, height);

      const base = context.createLinearGradient(0, 0, width, height);
      if (isDark) {
        base.addColorStop(0, "rgba(255,255,255,0.032)");
        base.addColorStop(0.46, "rgba(255,255,255,0.014)");
        base.addColorStop(1, "rgba(255,255,255,0.026)");
      } else {
        base.addColorStop(0, "rgba(245,245,245,0.34)");
        base.addColorStop(0.44, "rgba(255,255,255,0.26)");
        base.addColorStop(1, "rgba(232,232,232,0.30)");
      }

      context.globalAlpha = 1;
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);
    };

    const drawField = (field: CloudField, time: number) => {
      const breathe = 1 + Math.sin(time * field.speed + field.phase) * 0.045;
      const x =
        wrapRange(
          field.x +
            Math.sin(time * 0.000036 + field.phase) * 0.035 +
            time * field.driftX,
          -0.12,
          1.12,
        ) * width;
      const y =
        wrapRange(
          field.y +
            Math.cos(time * 0.000028 + field.phase) * 0.032 +
            time * field.driftY,
          -0.08,
          1.08,
        ) * height;
      const radius = field.radius * breathe;

      context.save();
      context.translate(x, y);
      context.scale(field.scaleX, field.scaleY);

      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
      if (isDark) {
        gradient.addColorStop(0, "rgba(255,255,255,0.155)");
        gradient.addColorStop(0.22, "rgba(235,235,235,0.105)");
        gradient.addColorStop(0.46, "rgba(190,190,190,0.070)");
        gradient.addColorStop(0.68, "rgba(130,130,130,0.045)");
        gradient.addColorStop(0.86, "rgba(90,90,90,0.022)");
        gradient.addColorStop(1, "rgba(90,90,90,0)");
      } else {
        gradient.addColorStop(0, "rgba(255,255,255,0.96)");
        gradient.addColorStop(0.2, "rgba(255,255,255,0.74)");
        gradient.addColorStop(0.42, "rgba(238,238,238,0.52)");
        gradient.addColorStop(0.62, "rgba(220,220,220,0.34)");
        gradient.addColorStop(0.8, "rgba(196,196,196,0.17)");
        gradient.addColorStop(1, "rgba(196,196,196,0)");
      }

      context.globalAlpha = field.alpha;
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const render = (time = 0) => {
      const nextIsDark = getThemeIsDark();
      if (nextIsDark !== isDark) {
        isDark = nextIsDark;
        fields = buildFields(width, height, isDark);
      }

      drawBaseAtmosphere();

      context.save();
      context.globalCompositeOperation = isDark ? "screen" : "multiply";
      fields.forEach((field) => drawField(field, reducedMotion ? 0 : time));
      context.restore();

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    const loop = (time: number) => {
      render(time);
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    render(0);
    window.addEventListener("resize", resize, { passive: true });
    if (!reducedMotion) frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="heaven-canvas capsoul-heaven-canvas"
      data-heaven-canvas
    />
  );
}
