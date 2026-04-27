"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { CinematicBackground } from "@/components/CinematicBackground";

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <div className="admin-visual-scope">{children}</div>;
  }

  return (
    <div className="public-visual-scope">
      <CinematicBackground />
      {children}
    </div>
  );
}
