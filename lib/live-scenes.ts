import { resolveMediaSlotPresentation } from "@/lib/media";
import { sceneSlotIds } from "@/lib/media-slots";
import { getSiteContent } from "@/lib/site-content";
import type {
  EditableInquiryContent,
  EditableSceneContent,
  ResolvedInquiryContent,
  ResolvedSceneContent,
  SiteLocale,
} from "@/lib/site-content-schema";

async function resolveSceneSteps(
  scene: EditableSceneContent,
  slotIds: readonly string[],
): Promise<ResolvedSceneContent["steps"]> {
  return Promise.all(
    scene.steps.map(async (step, index) => {
      const media = await resolveMediaSlotPresentation(slotIds[index] ?? "");

      return {
        ...step,
        image: media.src,
        objectPosition: media.objectPosition,
      };
    }),
  );
}

async function resolveInquirySupportStates(
  scene: EditableInquiryContent,
  slotIds: readonly string[],
): Promise<ResolvedInquiryContent["supportStates"]> {
  return Promise.all(
    scene.supportStates.map(async (state, index) => {
      const media = await resolveMediaSlotPresentation(slotIds[index] ?? "");

      return {
        ...state,
        image: media.src,
        objectPosition: media.objectPosition,
      };
    }),
  );
}

export async function getResolvedHomeScene(locale: SiteLocale = "en"): Promise<ResolvedSceneContent> {
  const content = await getSiteContent(locale);

  return {
    ...content.home,
    steps: await resolveSceneSteps(content.home, sceneSlotIds.home),
  };
}

export async function getResolvedExperienceScene(
  locale: SiteLocale = "en",
): Promise<ResolvedSceneContent> {
  const content = await getSiteContent(locale);

  return {
    ...content.experience,
    steps: await resolveSceneSteps(content.experience, sceneSlotIds.experience),
  };
}

export async function getResolvedProcessScene(
  locale: SiteLocale = "en",
): Promise<ResolvedSceneContent> {
  const content = await getSiteContent(locale);

  return {
    ...content.process,
    steps: await resolveSceneSteps(content.process, sceneSlotIds.process),
  };
}

export async function getResolvedPreserveScene(
  locale: SiteLocale = "en",
): Promise<ResolvedSceneContent> {
  const content = await getSiteContent(locale);

  return {
    ...content.preserve,
    steps: await resolveSceneSteps(content.preserve, sceneSlotIds.preserve),
  };
}

export async function getResolvedInquiryScene(
  locale: SiteLocale = "en",
): Promise<ResolvedInquiryContent> {
  const content = await getSiteContent(locale);

  return {
    ...content.inquire,
    supportStates: await resolveInquirySupportStates(content.inquire, sceneSlotIds.inquire),
  };
}
