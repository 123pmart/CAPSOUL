import type { Metadata } from "next";

import { SceneScreen } from "@/components/scene-screen";
import { getResolvedExperienceScene } from "@/lib/live-scenes";
import { getRequestSiteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  title: "The Experience",
  description:
    "A full-screen CAPSOUL scene showing how the experience stays calm, prepared, and emotionally considerate from first conversation through final delivery.",
};

export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  const locale = await getRequestSiteLocale();
  const experienceScene = await getResolvedExperienceScene(locale);
  return <SceneScreen {...experienceScene} tone="cool" />;
}
