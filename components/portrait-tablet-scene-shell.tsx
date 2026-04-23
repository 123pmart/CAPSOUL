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
  const viewportClasses = ["portrait-tablet-scene-viewport", viewportClassName, "md:w-full"]
    .filter(Boolean)
    .join(" ");
  const frameClasses = ["portrait-tablet-scene-frame", frameClassName, "scene-shell", toneClassName, "scene-pad", "md:w-full"]
    .filter(Boolean)
    .join(" ");
  const stackClasses = ["portrait-tablet-scene-stack", "relative", "z-10", "md:min-h-0"]
    .filter(Boolean)
    .join(" ");
  const contentGroupClasses = [
    "portrait-tablet-content-group",
    stackClassName,
    "flex",
    "flex-col",
    "overflow-visible",
    "md:min-h-0",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      data-portrait-shell={kind}
      className={`${shellClassName} shell py-2 sm:py-4 md:flex md:h-[calc(100svh-var(--header-offset-desktop))] md:min-h-0 md:items-center md:overflow-hidden md:py-2`}
    >
      <SceneViewport className={viewportClasses}>
        <div className={frameClasses} {...sceneBindings}>
          <div className={stackClasses}>
            <div className={contentGroupClasses}>{children}</div>
          </div>
        </div>
      </SceneViewport>
    </section>
  );
}
