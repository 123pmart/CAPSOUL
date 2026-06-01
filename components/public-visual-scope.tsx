"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AtmosphereBackdrop } from "@/components/AtmosphereBackdrop";
import HeavenCanvas from "@/components/HeavenCanvas";
import { useSiteTheme } from "@/components/site-theme-provider";

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme } = useSiteTheme();
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdminRoute) {
      return undefined;
    }

    // Do not override body background — let globals.css gradient show through
    return undefined;
  }, [isAdminRoute, theme]);

  useEffect(() => {
    if (isAdminRoute) {
      return undefined;
    }

    const scope = scopeRef.current;

    if (!scope) {
      return undefined;
    }

    let observer: MutationObserver | null = null;
    let rafId = 0;

    const syncActiveSection = () => {
      const experience = document.querySelector<HTMLElement>(".apple-archive-experience");
      const activeSection = experience?.dataset.activeSection || "hero";

      scope.dataset.activeSection = activeSection;

      if (!experience || observer) {
        return;
      }

      observer = new MutationObserver(syncActiveSection);
      observer.observe(experience, { attributes: true, attributeFilter: ["data-active-section"] });
    };

    rafId = window.requestAnimationFrame(syncActiveSection);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [isAdminRoute, pathname]);

  if (isAdminRoute) {
    return (
      <div className="admin-visual-scope" data-admin-theme={theme}>
        {children}
      </div>
    );
  }

  return (
    <div className="public-visual-scope" data-active-section="hero" ref={scopeRef}>
      <HeavenCanvas />
      <AtmosphereBackdrop />
      {children}
    </div>
  );
}
