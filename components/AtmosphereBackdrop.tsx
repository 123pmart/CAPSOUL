"use client";

import { useEffect, useRef } from "react";

export function AtmosphereBackdrop() {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = backdropRef.current;

    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animationFrame = 0;

    const updateDrift = () => {
      animationFrame = 0;
      const drift = Math.min(72, window.scrollY * 0.018);
      element.style.setProperty("--atmosphere-drift", `${drift}px`);
      element.style.setProperty("--atmosphere-drift-soft", `${drift * -0.2}px`);
      element.style.setProperty("--atmosphere-drift-frost", `${drift * -0.35}px`);
      element.style.setProperty("--atmosphere-drift-grain", `${drift * -0.55}px`);
    };

    const requestDrift = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateDrift);
    };

    updateDrift();
    window.addEventListener("scroll", requestDrift, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestDrift);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      className="atmosphere-backdrop"
    >
      <span className="atmosphere-layer atmosphere-layer-ambient" />
      <span className="atmosphere-layer atmosphere-layer-frost" />
      <span className="atmosphere-layer atmosphere-layer-mineral" />
      <span className="atmosphere-layer atmosphere-layer-grain" />
      <span className="atmosphere-layer atmosphere-layer-vignette" />
    </div>
  );
}
