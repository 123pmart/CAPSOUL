"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

function ArchiveAtmosphere() {
  return (
    <div className="archive-atmosphere" aria-hidden="true">
      <span className="archive-atmosphere__tone" />
      <span className="archive-atmosphere__plane archive-atmosphere__plane-one" />
      <span className="archive-atmosphere__plane archive-atmosphere__plane-two" />
      <span className="archive-atmosphere__plane archive-atmosphere__plane-three" />
      <span className="archive-atmosphere__frame" />
      <span className="archive-atmosphere__mesh" />
      <span className="archive-atmosphere__beam archive-atmosphere__beam-one" />
      <span className="archive-atmosphere__beam archive-atmosphere__beam-two" />
      <span className="archive-atmosphere__bloom archive-atmosphere__bloom-one" />
      <span className="archive-atmosphere__bloom archive-atmosphere__bloom-two" />
      <span className="archive-atmosphere__section-light" />
      <span className="archive-atmosphere__contour" />
      <span className="archive-atmosphere__grain" />
      <span className="archive-atmosphere__vignette" />
    </div>
  );
}

export function PublicVisualScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <div className="admin-visual-scope">{children}</div>;
  }

  return (
    <div className="public-visual-scope">
      <ArchiveAtmosphere />
      {children}
    </div>
  );
}
