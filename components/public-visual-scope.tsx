"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Atmosphere } from "@/components/Atmosphere";

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <div className="admin-visual-scope">{children}</div>;
  }

  return (
    <div className="public-visual-scope">
      <div className="film-grain" aria-hidden="true" />
      <Atmosphere />
      {children}
    </div>
  );
}
