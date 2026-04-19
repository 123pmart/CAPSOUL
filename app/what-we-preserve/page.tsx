import type { Metadata } from "next";

import { SceneScreen } from "@/components/scene-screen";
import { getResolvedPreserveScene } from "@/lib/live-scenes";

export const metadata: Metadata = {
  title: "What We Preserve",
  description:
    "A full-screen CAPSOUL scene exploring the story chapters a family can preserve through a private legacy documentary.",
};

export const dynamic = "force-dynamic";

export default async function WhatWePreservePage() {
  const preserveScene = await getResolvedPreserveScene();
  return <SceneScreen {...preserveScene} tone="warm" />;
}
