"use client";

import { useEffect, useRef } from "react";

export function AtmosphereBackdrop() {
  const orb1Ref = useRef<HTMLDivElement | null>(null);
  const orb2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let raf = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let orb1X = mouseX;
    let orb1Y = mouseY;
    let orb2X = mouseX;
    let orb2Y = mouseY;

    const handleMouse = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const animate = () => {
      orb1X += (mouseX - orb1X) * 0.032;
      orb1Y += (mouseY - orb1Y) * 0.032;
      orb2X += (window.innerWidth - mouseX - orb2X) * 0.018;
      orb2Y += (window.innerHeight - mouseY - orb2Y) * 0.018;

      if (orb1Ref.current) {
        const xPercent = (orb1X / window.innerWidth) * 100 - 50;
        const yPercent = (orb1Y / window.innerHeight) * 100 - 50;
        orb1Ref.current.style.transform = `translate(${xPercent * 0.22}px, ${yPercent * 0.22}px)`;
      }

      if (orb2Ref.current) {
        const xPercent = (orb2X / window.innerWidth) * 100 - 50;
        const yPercent = (orb2Y / window.innerHeight) * 100 - 50;
        orb2Ref.current.style.transform = `translate(${xPercent * 0.12}px, ${yPercent * 0.12}px)`;
      }

      raf = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    raf = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="atmosphere-backdrop">
      <span className="atmosphere-layer atmosphere-layer-frost" />
      <span className="atmosphere-layer atmosphere-layer-mineral" />
      <span className="atmosphere-layer atmosphere-layer-vignette" />
      <span className="atmosphere-layer atmosphere-layer-ambient" />
      <div ref={orb1Ref} className="atmosphere-orb atmosphere-orb-1" />
      <div ref={orb2Ref} className="atmosphere-orb atmosphere-orb-2" />
      <div className="atmosphere-orb atmosphere-orb-3" />
    </div>
  );
}
