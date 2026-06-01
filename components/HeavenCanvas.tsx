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
  stretchX: number;
  stretchY: number;
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
    let previousFrameTime = 0;
    const random = createSeededRandom(0xc4a50f);
    const fields: CloudField[] = Array.from({ length: 18 }, () => ({
      x: random(),
      y: random(),
      radiusScale: 0.28 + random() * 0.47,
      opacity: 0.82 + random() * 0.18,
      driftX: (random() < 0.5 ? -1 : 1) * (0.003 + random() * 0.009),
      driftY: (random() < 0.5 ? -1 : 1) * (0.0015 + random() * 0.004),
      phase: random() * Math.PI * 2,
      scaleVariation: 0.025 + random() * 0.035,
      stretchX: 0.94 + random() * 0.46,
      stretchY: 0.72 + random() * 0.32,
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

      context.globalAlpha = isDark ? 0.5 : 1;

      for (const field of fields) {
        const x = wrapNormalized(field.x + time * field.driftX) * width;
        const y = wrapNormalized(field.y + time * field.driftY) * height;
        const radius = clamp(
          Math.min(width, height) * field.radiusScale,
          260,
          980,
        ) * (Math.sin(time * 0.08 + field.phase) * field.scaleVariation + 1);
        const alpha = field.opacity * (0.96 + Math.sin(time * 0.06 + field.phase) * 0.04);

        context.save();
        context.translate(x, y);
        context.scale(field.stretchX, field.stretchY);

        const gradient = context.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          radius,
        );

        if (isDark) {
          gradient.addColorStop(0, `rgba(255,255,255,${(alpha * 0.14).toFixed(3)})`);
          gradient.addColorStop(0.28, `rgba(235,240,248,${(alpha * 0.1).toFixed(3)})`);
          gradient.addColorStop(0.52, `rgba(200,210,222,${(alpha * 0.065).toFixed(3)})`);
          gradient.addColorStop(0.76, `rgba(160,170,185,${(alpha * 0.035).toFixed(3)})`);
          gradient.addColorStop(1, "rgba(160,170,185,0)");
        } else {
          gradient.addColorStop(0, `rgba(255,255,255,${(alpha * 0.78).toFixed(3)})`);
          gradient.addColorStop(0.22, `rgba(255,255,255,${(alpha * 0.58).toFixed(3)})`);
          gradient.addColorStop(0.45, `rgba(232,238,244,${(alpha * 0.34).toFixed(3)})`);
          gradient.addColorStop(0.66, `rgba(205,216,226,${(alpha * 0.18).toFixed(3)})`);
          gradient.addColorStop(0.84, `rgba(180,194,208,${(alpha * 0.08).toFixed(3)})`);
          gradient.addColorStop(1, "rgba(180,194,208,0)");
        }

        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
        context.restore();
      }

      context.globalAlpha = isDark ? 0.44 : 0.92;
      const topGlow = context.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, width * 0.55);

      topGlow.addColorStop(0, `rgba(255,255,255,${isDark ? "0.09" : "0.36"})`);
      topGlow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = topGlow;
      context.fillRect(0, 0, width, height * 0.5);
      context.globalAlpha = 1;
    };

    const loop = (frameTime: number) => {
      if (previousFrameTime) {
        elapsed += Math.min((frameTime - previousFrameTime) / 1000, 0.1);
      }
      previousFrameTime = frameTime;
      draw();
      rafRef.current = window.requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(canvas.parentElement ?? document.body);
    resize();

    if (prefersReducedMotion) {
      draw();
    } else {
      rafRef.current = window.requestAnimationFrame(loop);
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
      className="heaven-canvas"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "var(--z-atmosphere, 0)",
        opacity: 1,
        mixBlendMode: "normal",
      }}
    />
  );
}
