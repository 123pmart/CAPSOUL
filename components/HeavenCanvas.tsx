"use client";

import { useEffect, useRef } from "react";

interface CloudParticle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedX: number;
  speedY: number;
  phase: number;
}

function clamp(value: number, lower: number, upper: number) {
  return Math.max(lower, Math.min(upper, value));
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
    let particles: CloudParticle[] = [];

    const spawnParticles = () => {
      particles = Array.from({ length: 10 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.72,
        radius: clamp(width * 0.14 + Math.random() * width * 0.2, 150, 560),
        opacity: 0.16 + Math.random() * 0.12,
        speedX: (Math.random() - 0.5) * 0.08,
        speedY: (Math.random() - 0.5) * 0.025,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      spawnParticles();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const isDark = document.documentElement.dataset.theme === "dark";

      for (const particle of particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -particle.radius) {
          particle.x = width + particle.radius;
        }

        if (particle.x > width + particle.radius) {
          particle.x = -particle.radius;
        }

        const radius = particle.radius * (Math.sin(elapsed * 0.0008 + particle.phase) * 0.015 + 1);
        const alpha = particle.opacity * (0.9 + Math.sin(elapsed * 0.00045 + particle.phase) * 0.1);
        const coreAlpha = isDark ? alpha * 0.22 : alpha;
        const edgeAlpha = isDark ? alpha * 0.14 : alpha * 0.34;
        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          radius,
        );

        gradient.addColorStop(0, `rgba(255,255,255,${coreAlpha.toFixed(3)})`);
        gradient.addColorStop(0.56, `rgba(220,232,242,${edgeAlpha.toFixed(3)})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.beginPath();
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
      }

      const topGlow = context.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, width * 0.55);

      topGlow.addColorStop(0, `rgba(255,255,255,${isDark ? "0.035" : "0.14"})`);
      topGlow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = topGlow;
      context.fillRect(0, 0, width, height * 0.5);
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
        opacity: 0.62,
        mixBlendMode: "normal",
      }}
    />
  );
}
