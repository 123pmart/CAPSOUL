"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <div className="admin-visual-scope">{children}</div>;
  }

  return (
    <div className="public-visual-scope public-liquid-stage">
      <div className="public-liquid-bg" aria-hidden="true">
        <span className="liquid-light-field liquid-light-field-one" />
        <span className="liquid-light-field liquid-light-field-two" />
        <span className="liquid-light-field liquid-light-field-three" />
        <span className="liquid-geometry-light" />
        <span className="liquid-glass-grain" />
      </div>
      {children}
    </div>
  );
}
