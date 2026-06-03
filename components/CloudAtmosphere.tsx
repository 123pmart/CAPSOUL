"use client";

import { useEffect } from "react";

import styles from "./CloudAtmosphere.module.css";

function setVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

export default function CloudAtmosphere() {
  useEffect(() => {
    let raf = 0;
    let lastY = -1;
    let lastW = -1;
    let lastH = -1;

    const update = () => {
      raf = 0;

      const doc = document.documentElement;
      const y = window.scrollY || window.pageYOffset || 0;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, y / max));
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (y === lastY && w === lastW && h === lastH) {
        return;
      }

      lastY = y;
      lastW = w;
      lastH = h;

      const slowX = Math.sin(progress * Math.PI * 2) * 160;
      const mediumX = Math.cos(progress * Math.PI * 2.5) * 220;
      const fastX = Math.sin(progress * Math.PI * 3.25) * 280;

      setVar("--cloud-scroll", progress.toFixed(5));
      setVar("--cloud-y", `${(-y * 0.11).toFixed(2)}px`);
      setVar("--cloud-y-soft", `${(-y * 0.055).toFixed(2)}px`);
      setVar("--cloud-y-deep", `${(-y * 0.16).toFixed(2)}px`);
      setVar("--cloud-x-slow", `${slowX.toFixed(2)}px`);
      setVar("--cloud-x-medium", `${mediumX.toFixed(2)}px`);
      setVar("--cloud-x-fast", `${fastX.toFixed(2)}px`);
    };

    const requestUpdate = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("orientationchange", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);

      if (raf) {
        window.cancelAnimationFrame(raf);
      }

      [
        "--cloud-scroll",
        "--cloud-y",
        "--cloud-y-soft",
        "--cloud-y-deep",
        "--cloud-x-slow",
        "--cloud-x-medium",
        "--cloud-x-fast",
      ].forEach((key) => document.documentElement.style.removeProperty(key));
    };
  }, []);

  return (
    <div className={styles.root} data-cloud-atmosphere aria-hidden="true">
      <div className={styles.baseMist} />
      <div className={`${styles.cloudPlane} ${styles.planeA}`} />
      <div className={`${styles.cloudPlane} ${styles.planeB}`} />
      <div className={`${styles.cloudPlane} ${styles.planeC}`} />
      <div className={`${styles.cloudPlane} ${styles.planeD}`} />
      <div className={`${styles.cloudPlane} ${styles.planeE}`} />
      <div className={styles.documentClouds} />
      <div className={styles.grain} />
    </div>
  );
}
