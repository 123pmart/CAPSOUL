import { resolveMediaSlotSource } from "@/lib/media";
import { sceneSlotIds } from "@/lib/media-slots";
import { getSiteContent } from "@/lib/site-content";
import type {
  EditableInquiryContent,
  EditableSceneContent,
  ResolvedInquiryContent,
  ResolvedSceneContent,
} from "@/lib/site-content-schema";

async function resolveSceneSteps(
  scene: EditableSceneContent,
  slotIds: readonly string[],
): Promise<ResolvedSceneContent["steps"]> {
  return Promise.all(
    scene.steps.map(async (step, index) => ({
      ...step,
      image: await resolveMediaSlotSource(slotIds[index] ?? ""),
    })),
  );
}

async function resolveInquirySupportStates(
  scene: EditableInquiryContent,
  slotIds: readonly string[],
): Promise<ResolvedInquiryContent["supportStates"]> {
  return Promise.all(
    scene.supportStates.map(async (state, index) => ({
      ...state,
      image: await resolveMediaSlotSource(slotIds[index] ?? ""),
    })),
  );
}

export async function getResolvedHomeScene(): Promise<ResolvedSceneContent> {
  const content = await getSiteContent();

  return {
    ...content.home,
    steps: await resolveSceneSteps(content.home, sceneSlotIds.home),
  };
}

export async function getResolvedExperienceScene(): Promise<ResolvedSceneContent> {
  const content = await getSiteContent();

  return {
    ...content.experience,
    steps: await resolveSceneSteps(content.experience, sceneSlotIds.experience),
  };
}

export async function getResolvedProcessScene(): Promise<ResolvedSceneContent> {
  const content = await getSiteContent();

  return {
    ...content.process,
    steps: await resolveSceneSteps(content.process, sceneSlotIds.process),
  };
}

export async function getResolvedPreserveScene(): Promise<ResolvedSceneContent> {
  const content = await getSiteContent();

  return {
    ...content.preserve,
    steps: await resolveSceneSteps(content.preserve, sceneSlotIds.preserve),
  };
}

export async function getResolvedInquiryScene(): Promise<ResolvedInquiryContent> {
  const content = await getSiteContent();

  return {
    ...content.inquire,
    supportStates: await resolveInquirySupportStates(content.inquire, sceneSlotIds.inquire),
  };
}
