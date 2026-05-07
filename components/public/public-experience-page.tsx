import { PublicExperience } from "@/components/public/PublicExperience";
import {
  getResolvedExperienceScene,
  getResolvedHomeScene,
  getResolvedInquiryScene,
  getResolvedPreserveScene,
  getResolvedProcessScene,
} from "@/lib/live-scenes";
import { getSiteContent } from "@/lib/site-content";
import { getRequestSiteLocale } from "@/lib/site-locale";

export async function PublicExperiencePage() {
  const locale = await getRequestSiteLocale();
  const siteContent = await getSiteContent(locale);
  const homeScene = await getResolvedHomeScene(locale);
  const experienceScene = await getResolvedExperienceScene(locale);
  const processScene = await getResolvedProcessScene(locale);
  const preserveScene = await getResolvedPreserveScene(locale);
  const inquiryScene = await getResolvedInquiryScene(locale);

  return (
    <PublicExperience
      globalContent={siteContent.global}
      home={homeScene}
      experience={experienceScene}
      process={processScene}
      preserve={preserveScene}
      inquiry={inquiryScene}
    />
  );
}
