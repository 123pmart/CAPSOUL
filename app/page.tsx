import { InquiryScene } from "@/components/inquiry-scene";
import { SceneScreen } from "@/components/scene-screen";
import { SectionScroller } from "@/components/SectionScroller";
import type { ImmersiveSectionId } from "@/components/immersive-scroll-context";
import {
  getResolvedExperienceScene,
  getResolvedHomeScene,
  getResolvedInquiryScene,
  getResolvedPreserveScene,
  getResolvedProcessScene,
} from "@/lib/live-scenes";
import { getSiteContent } from "@/lib/site-content";
import { getRequestSiteLocale } from "@/lib/site-locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getRequestSiteLocale();
  const siteContent = await getSiteContent(locale);
  const homeScene = await getResolvedHomeScene(locale);
  const experienceScene = await getResolvedExperienceScene(locale);
  const processScene = await getResolvedProcessScene(locale);
  const preserveScene = await getResolvedPreserveScene(locale);
  const inquiryScene = await getResolvedInquiryScene(locale);

  const sections: Array<{ id: ImmersiveSectionId; label: string }> = [
    { id: "home", label: siteContent.global.navigation.home },
    { id: "the-experience", label: siteContent.global.navigation.experience },
    { id: "how-it-works", label: siteContent.global.navigation.process },
    { id: "what-we-preserve", label: siteContent.global.navigation.preserve },
    { id: "inquire", label: siteContent.global.navigation.inquire },
  ];

  return (
    <SectionScroller sections={sections}>
      <SceneScreen {...homeScene} tone="warm" immersiveSectionMode />
      <SceneScreen {...experienceScene} tone="cool" immersiveSectionMode />
      <SceneScreen {...processScene} tone="cool" immersiveSectionMode />
      <SceneScreen {...preserveScene} tone="warm" immersiveSectionMode />
      <InquiryScene sceneData={inquiryScene} immersiveSectionMode />
    </SectionScroller>
  );
}
