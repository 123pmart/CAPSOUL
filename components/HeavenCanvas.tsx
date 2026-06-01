"use client";

import { useEffect, useRef } from "react";

interface CloudField {
  x: number;
  y: number;
  radiusScale: number;
  opacity: number;
  driftX: number;
  driftY: number;
  phase: number;
  scaleVariation: number;
}

function clamp(value: number, lower: number, upper: number) {
  return Math.max(lower, Math.min(upper, value));
}

function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function wrapNormalized(value: number) {
  return ((value % 1) + 1) % 1;
}

export default function HeavenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let elapsed = 0;
    const random = createSeededRandom(0xc4a50f);
    const fields: CloudField[] = Array.from({ length: 12 }, () => ({
      x: random(),
      y: random() * 0.92,
      radiusScale: 0.2 + random() * 0.24,
      opacity: 0.76 + random() * 0.2,
      driftX: (random() - 0.5) * 0.000004,
      driftY: (random() - 0.5) * 0.0000018,
      phase: random() * Math.PI * 2,
      scaleVariation: 0.018 + random() * 0.018,
    }));

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const isDark = document.documentElement.dataset.theme === "dark";
      const time = prefersReducedMotion ? 0 : elapsed;

      context.globalAlpha = isDark ? 0.32 : 0.9;

      for (const field of fields) {
        const x = wrapNormalized(field.x + time * field.driftX) * width;
        const y = wrapNormalized(field.y + time * field.driftY) * height;
        const radius = clamp(
          Math.max(width, height) * field.radiusScale,
          240,
          820,
        ) * (Math.sin(time * 0.00045 + field.phase) * field.scaleVariation + 1);
        const alpha = field.opacity * (0.94 + Math.sin(time * 0.0003 + field.phase) * 0.06);
        const gradient = context.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          radius,
        );

        if (isDark) {
          gradient.addColorStop(0, `rgba(255,255,255,${(alpha * 0.075).toFixed(3)})`);
          gradient.addColorStop(0.36, `rgba(230,234,240,${(alpha * 0.055).toFixed(3)})`);
          gradient.addColorStop(0.68, `rgba(190,198,210,${(alpha * 0.028).toFixed(3)})`);
          gradient.addColorStop(1, "rgba(190,198,210,0)");
        } else {
          gradient.addColorStop(0, `rgba(255,255,255,${(alpha * 0.62).toFixed(3)})`);
          gradient.addColorStop(0.32, `rgba(255,255,255,${(alpha * 0.42).toFixed(3)})`);
          gradient.addColorStop(0.58, `rgba(228,234,240,${(alpha * 0.18).toFixed(3)})`);
          gradient.addColorStop(0.78, `rgba(214,222,230,${(alpha * 0.08).toFixed(3)})`);
          gradient.addColorStop(1, "rgba(214,222,230,0)");
        }

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
      }

      context.globalAlpha = isDark ? 0.28 : 0.78;
      const topGlow = context.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, width * 0.55);

      topGlow.addColorStop(0, `rgba(255,255,255,${isDark ? "0.055" : "0.24"})`);
      topGlow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = topGlow;
      context.fillRect(0, 0, width, height * 0.5);
      context.globalAlpha = 1;
      elapsed += 1;
    };

    const loop = () => {
      draw();
      rafRef.current = window.requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(canvas.parentElement ?? document.body);
    resize();

    if (prefersReducedMotion) {
      draw();
    } else {
      loop();
    }

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 1,
        mixBlendMode: "normal",
      }}
    />
  );
}
