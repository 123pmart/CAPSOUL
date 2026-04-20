import { SceneScreen } from "@/components/scene-screen";
import { getResolvedHomeScene } from "@/lib/live-scenes";
import { getRequestSiteLocale } from "@/lib/site-locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getRequestSiteLocale();
  const homeScene = await getResolvedHomeScene(locale);
  return <SceneScreen {...homeScene} tone="warm" />;
}
