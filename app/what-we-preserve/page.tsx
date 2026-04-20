import type { Metadata } from "next";

import { SceneScreen } from "@/components/scene-screen";
import { getResolvedPreserveScene } from "@/lib/live-scenes";
import { getRequestSiteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  title: "What We Preserve",
  description:
    "A full-screen CAPSOUL scene exploring the story chapters a family can preserve through a private legacy documentary.",
};

export const dynamic = "force-dynamic";

export default async function WhatWePreservePage() {
  const locale = await getRequestSiteLocale();
  const preserveScene = await getResolvedPreserveScene(locale);
  return <SceneScreen {...preserveScene} tone="warm" />;
}
