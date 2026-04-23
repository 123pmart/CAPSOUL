"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { SceneViewport } from "@/components/scene-viewport";

type PortraitTabletSceneShellProps = {
  kind: "scene" | "inquiry";
  shellClassName: string;
  viewportClassName: string;
  frameClassName: string;
  stackClassName: string;
  toneClassName?: string;
  sceneBindings?: HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
};

export function PortraitTabletSceneShell({
  kind,
  shellClassName,
  viewportClassName,
  frameClassName,
  stackClassName,
  toneClassName,
  sceneBindings,
  children,
}: PortraitTabletSceneShellProps) {
  const frameClasses = [frameClassName, "scene-shell", toneClassName, "scene-pad", "md:w-full"]
    .filter(Boolean)
    .join(" ");
  const stackClasses = [stackClassName, "relative", "z-10", "flex", "flex-col", "overflow-visible", "md:min-h-0"]
    .filter(Boolean)
    .join(" ");
  const debugOutlineStyle =
    kind === "scene"
      ? {
          outline: "8px solid #ff2b2b",
          outlineOffset: "-8px",
        }
      : undefined;

  return (
    <section
      data-portrait-shell={kind}
      style={debugOutlineStyle}
      className={`${shellClassName} shell py-2 sm:py-4 md:flex md:h-[calc(100svh-var(--header-offset-desktop))] md:min-h-0 md:items-center md:overflow-hidden md:py-2`}
    >
      <SceneViewport className={`${viewportClassName} md:w-full`}>
        <div className={frameClasses} {...sceneBindings}>
          <div className={stackClasses}>{children}</div>
        </div>
      </SceneViewport>
    </section>
  );
}
