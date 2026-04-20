import type { Metadata } from "next";

import { SceneScreen } from "@/components/scene-screen";
import { getResolvedProcessScene } from "@/lib/live-scenes";
import { getRequestSiteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "A full-screen CAPSOUL process scene showing the step-by-step path from inquiry and discovery through filming, editing, and delivery.",
};

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  const locale = await getRequestSiteLocale();
  const processScene = await getResolvedProcessScene(locale);
  return <SceneScreen {...processScene} tone="cool" />;
}
