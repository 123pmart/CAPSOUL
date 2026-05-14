"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AtmosphereBackdrop } from "@/components/AtmosphereBackdrop";
import { useSiteTheme } from "@/components/site-theme-provider";

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme } = useSiteTheme();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

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
