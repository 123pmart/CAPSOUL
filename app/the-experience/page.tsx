import type { Metadata } from "next";

import { SceneScreen } from "@/components/scene-screen";
import { getResolvedExperienceScene } from "@/lib/live-scenes";

export const metadata: Metadata = {
  title: "The Experience",
  description:
    "A full-screen CAPSOUL scene showing how the experience stays calm, prepared, and emotionally considerate from first conversation through final delivery.",
};

export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  const experienceScene = await getResolvedExperienceScene();
  return <SceneScreen {...experienceScene} tone="cool" />;
}
