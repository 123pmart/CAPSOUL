import type { MediaSlotDefinition } from "@/lib/media-slots";

export type MediaObjectPosition =
  | "center center"
  | "center top"
  | "center bottom"
  | "left center"
  | "right center";

export const mediaObjectPositionOptions: Array<{
  value: MediaObjectPosition;
  label: string;
}> = [
  { value: "center center", label: "Center" },
  { value: "center top", label: "Top" },
  { value: "center bottom", label: "Bottom" },
  { value: "left center", label: "Left" },
  { value: "right center", label: "Right" },
];

export const DEFAULT_MEDIA_OBJECT_POSITION: MediaObjectPosition = "center center";

export type ResolvedMediaSlot = MediaSlotDefinition & {
  src: string;
  objectPosition: string;
  isCustom: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};
