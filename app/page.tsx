import { SceneScreen } from "@/components/scene-screen";
import { getResolvedHomeScene } from "@/lib/live-scenes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homeScene = await getResolvedHomeScene();
  return <SceneScreen {...homeScene} tone="warm" />;
}
