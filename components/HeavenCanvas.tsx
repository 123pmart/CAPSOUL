"use client";

import { useEffect, useRef } from "react";

type CloudField = {
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  phase: number;
  phaseSpeed: number;
  alpha: number;
  scaleVariation: number;
  squashX: number;
  squashY: number;
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

function wrapNormalized(value: number) {
  return ((value % 1) + 1) % 1;
}

function buildFields(width: number, height: number, isDark: boolean): CloudField[] {
  const random = createSeededRandom(isDark ? 94421 : 38291);
  const minViewport = Math.min(width, height);
  const count = isDark ? 16 : 22;

  return Array.from({ length: count }, (_, index) => {
    const band = index / Math.max(1, count - 1);

    return {
      x: random(),
      y: 0.04 + band * 0.94 + (random() - 0.5) * 0.16,
      radius: minViewport * (0.34 + random() * 0.62),
      driftX: (random() - 0.5) * 0.01,
      driftY: (random() - 0.5) * 0.006,
      phase: random() * Math.PI * 2,
      phaseSpeed: 0.000055 + random() * 0.000085,
      alpha: isDark ? 0.44 + random() * 0.22 : 0.72 + random() * 0.28,
      scaleVariation: 0.025 + random() * 0.02,
      squashX: 1.15 + random() * 1.2,
      squashY: 0.62 + random() * 0.55,
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
        base.addColorStop(0, "rgba(255,255,255,0.025)");
        base.addColorStop(0.5, "rgba(255,255,255,0.010)");
        base.addColorStop(1, "rgba(255,255,255,0.018)");
      } else {
        base.addColorStop(0, "rgba(219,231,240,0.30)");
        base.addColorStop(0.45, "rgba(255,255,255,0.20)");
        base.addColorStop(1, "rgba(215,228,238,0.24)");
      }

      context.globalAlpha = 1;
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);
    };

    const drawField = (field: CloudField, time: number) => {
      const breathe = 1 + Math.sin(time * field.phaseSpeed + field.phase) * field.scaleVariation;
      const x =
        wrapNormalized(
          field.x +
            Math.sin(time * 0.000045 + field.phase) * 0.045 +
            time * field.driftX * 0.000018,
        ) * width;
      const y =
        wrapNormalized(
          field.y +
            Math.cos(time * 0.000038 + field.phase) * 0.035 +
            time * field.driftY * 0.000018,
        ) * height;
      const radius = field.radius * breathe;

      context.save();
      context.translate(x, y);
      context.scale(field.squashX, field.squashY);

      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
      if (isDark) {
        gradient.addColorStop(0, "rgba(255,255,255,0.16)");
        gradient.addColorStop(0.25, "rgba(238,242,248,0.115)");
        gradient.addColorStop(0.52, "rgba(206,216,226,0.072)");
        gradient.addColorStop(0.74, "rgba(165,176,190,0.038)");
        gradient.addColorStop(1, "rgba(165,176,190,0)");
      } else {
        gradient.addColorStop(0, "rgba(255,255,255,0.92)");
        gradient.addColorStop(0.24, "rgba(255,255,255,0.68)");
        gradient.addColorStop(0.48, "rgba(229,236,242,0.44)");
        gradient.addColorStop(0.68, "rgba(202,214,225,0.24)");
        gradient.addColorStop(0.84, "rgba(170,188,204,0.105)");
        gradient.addColorStop(1, "rgba(170,188,204,0)");
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
