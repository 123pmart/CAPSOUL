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

    const background = theme === "dark" ? "#000000" : "#fbfbfb";
    const main = document.getElementById("main-content");
    const previousHtmlBackground = document.documentElement.style.backgroundColor;
    const previousBodyBackground = document.body.style.backgroundColor;
    const previousMainBackground = main?.style.backgroundColor ?? "";

    document.documentElement.style.backgroundColor = background;
    document.body.style.backgroundColor = background;
    if (main) {
      main.style.backgroundColor = background;
    }

    return () => {
      document.documentElement.style.backgroundColor = previousHtmlBackground;
      document.body.style.backgroundColor = previousBodyBackground;
      if (main) {
        main.style.backgroundColor = previousMainBackground;
      }
    };
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
