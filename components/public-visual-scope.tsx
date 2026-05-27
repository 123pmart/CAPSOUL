"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AtmosphereBackdrop } from "@/components/AtmosphereBackdrop";
import { useSiteTheme } from "@/components/site-theme-provider";

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme } = useSiteTheme();
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

  if (isAdminRoute) {
    return (
      <div className="admin-visual-scope" data-admin-theme={theme}>
        {children}
      </div>
    );
  }

  return (
    <div className="public-visual-scope">
      <AtmosphereBackdrop />
      {children}
    </div>
  );
}
