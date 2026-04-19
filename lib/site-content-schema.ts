import type { InquirySupportState, ScreenAction, ScreenStep } from "@/content/screen-scenes";
import {
  experienceScene,
  homeScene,
  inquiryScene,
  preserveScene,
  processScene,
} from "@/content/screen-scenes";

export type EditableSceneAction = ScreenAction;

export type EditableSceneStep = Omit<ScreenStep, "image">;

export type EditableSceneContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: EditableSceneAction;
  secondaryAction?: EditableSceneAction;
  stageLabel: string;
  compactNote: string;
  steps: EditableSceneStep[];
};

export type EditableInquirySupportState = Omit<InquirySupportState, "image">;

export type InquiryFormStepContent = {
  chip: string;
  title: string;
  description: string;
};

export type EditableInquiryContent = {
  eyebrow: string;
  title: string;
  description: string;
  trustPoints: string[];
  supportStates: EditableInquirySupportState[];
  formSteps: InquiryFormStepContent[];
  previousButtonLabel: string;
  nextButtonLabel: string;
  submitButtonLabel: string;
  progressionLabel: string;
  mediaNote: string;
  nextHeading: string;
  nextBody: string;
  footerNote: string;
  successEyebrow: string;
  successTitle: string;
  successBody: string;
  successResetLabel: string;
  successReturnLabel: string;
};

export type ResolvedSceneStep = EditableSceneStep & {
  image: string;
};

export type ResolvedSceneContent = Omit<EditableSceneContent, "steps"> & {
  steps: ResolvedSceneStep[];
};

export type ResolvedInquirySupportState = EditableInquirySupportState & {
  image: string;
};

export type ResolvedInquiryContent = Omit<EditableInquiryContent, "supportStates"> & {
  supportStates: ResolvedInquirySupportState[];
};

export type SiteContent = {
  home: EditableSceneContent;
  experience: EditableSceneContent;
  process: EditableSceneContent;
  preserve: EditableSceneContent;
  inquire: EditableInquiryContent;
};

export type SiteContentPageKey = keyof SiteContent;

export type SiteContentFieldConfig = {
  path: string;
  label: string;
  type: "text" | "textarea" | "list";
  description?: string;
  rows?: number;
};

export type SiteContentSectionConfig = {
  id: string;
  title: string;
  description?: string;
  fields: SiteContentFieldConfig[];
};

export type SiteContentPageConfig = {
  key: SiteContentPageKey;
  label: string;
  sections: SiteContentSectionConfig[];
};

function toEditableScene(scene: {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: ScreenAction;
  secondaryAction?: ScreenAction;
  stageLabel?: string;
  compactNote?: string;
  steps: ScreenStep[];
}): EditableSceneContent {
  return {
    eyebrow: scene.eyebrow,
    title: scene.title,
    description: scene.description,
    primaryAction: scene.primaryAction,
    secondaryAction: scene.secondaryAction,
    stageLabel: scene.stageLabel ?? "Scene progression",
    compactNote: scene.compactNote ?? "Scroll or tap through the states inside this screen.",
    steps: scene.steps.map(({ image: _image, ...step }) => step),
  };
}

export const defaultInquiryFormSteps: InquiryFormStepContent[] = [
  {
    chip: "Contact",
    title: "Private contact.",
    description: "Enough detail to respond personally and with the right urgency.",
  },
  {
    chip: "Story",
    title: "Story context.",
    description: "Who this film is for and why the timing matters right now.",
  },
  {
    chip: "Notes",
    title: "Practical notes.",
    description: "Location, values, and anything that helps us follow up with care.",
  },
];

export const defaultSiteContent: SiteContent = {
  home: toEditableScene(homeScene),
  experience: toEditableScene(experienceScene),
  process: toEditableScene(processScene),
  preserve: toEditableScene(preserveScene),
  inquire: {
    eyebrow: inquiryScene.eyebrow,
    title: inquiryScene.title,
    description: inquiryScene.description,
    trustPoints: [...inquiryScene.trustPoints],
    supportStates: inquiryScene.supportStates.map(({ image: _image, ...state }) => state),
    formSteps: defaultInquiryFormSteps.map((step) => ({ ...step })),
    previousButtonLabel: "Previous",
    nextButtonLabel: "Next",
    submitButtonLabel: "Submit Inquiry",
    progressionLabel: "Inquiry progression",
    mediaNote: "Each state keeps the inquiry compact without losing context.",
    nextHeading: "What happens next",
    nextBody:
      "Once the essentials are in place, the next move is a private conversation about fit, timing, and the tone the film should hold.",
    footerNote: "Reviewed personally with discretion before any follow-up.",
    successEyebrow: "Inquiry received",
    successTitle: "Thank you for the trust.",
    successBody:
      "Your inquiry has been saved inside the private CAPSOUL dashboard for personal follow-up. We now keep the lead detail in-app while preserving the same compact screen-based submission flow.",
    successResetLabel: "Send another inquiry",
    successReturnLabel: "Return Home",
  },
};

export function cloneDefaultSiteContent(): SiteContent {
  return JSON.parse(JSON.stringify(defaultSiteContent)) as SiteContent;
}

function createScenePageConfig(
  key: Exclude<SiteContentPageKey, "inquire">,
  label: string,
  scene: EditableSceneContent,
): SiteContentPageConfig {
  return {
    key,
    label,
    sections: [
      {
        id: `${key}-overview`,
        title: "Overview",
        fields: [
          { path: "eyebrow", label: "Eyebrow", type: "text" },
          { path: "title", label: "Headline", type: "text" },
          { path: "description", label: "Supporting text", type: "textarea", rows: 3 },
          { path: "primaryAction.label", label: "Primary CTA label", type: "text" },
          { path: "secondaryAction.label", label: "Secondary CTA label", type: "text" },
          { path: "stageLabel", label: "Stage label", type: "text" },
          { path: "compactNote", label: "Progress note", type: "text" },
        ],
      },
      ...scene.steps.map<SiteContentSectionConfig>((step, index) => ({
        id: `${key}-step-${index + 1}`,
        title: `State ${index + 1}`,
        description: step.label,
        fields: [
          { path: `steps.${index}.label`, label: "Chip label", type: "text" },
          { path: `steps.${index}.title`, label: "State headline", type: "text" },
          { path: `steps.${index}.summary`, label: "Media summary", type: "textarea", rows: 3 },
          { path: `steps.${index}.detail`, label: "Detail paragraph", type: "textarea", rows: 4 },
          { path: `steps.${index}.mediaLabel`, label: "Media eyebrow", type: "text" },
          { path: `steps.${index}.mediaCaption`, label: "Media caption", type: "textarea", rows: 3 },
          {
            path: `steps.${index}.bullets`,
            label: "Bullets",
            type: "list",
            description: "One item per line.",
            rows: 4,
          },
        ],
      })),
    ],
  };
}

export const siteContentEditorPages: SiteContentPageConfig[] = [
  createScenePageConfig("home", "Home", defaultSiteContent.home),
  createScenePageConfig("experience", "The Experience", defaultSiteContent.experience),
  createScenePageConfig("process", "How It Works", defaultSiteContent.process),
  createScenePageConfig("preserve", "What We Preserve", defaultSiteContent.preserve),
  {
    key: "inquire",
    label: "Inquire",
    sections: [
      {
        id: "inquire-overview",
        title: "Overview",
        fields: [
          { path: "eyebrow", label: "Eyebrow", type: "text" },
          { path: "title", label: "Headline", type: "text" },
          { path: "description", label: "Supporting text", type: "textarea", rows: 3 },
          {
            path: "trustPoints",
            label: "Trust points",
            type: "list",
            description: "One item per line.",
            rows: 4,
          },
        ],
      },
      {
        id: "inquire-form-buttons",
        title: "Form controls",
        fields: [
          { path: "previousButtonLabel", label: "Previous button", type: "text" },
          { path: "nextButtonLabel", label: "Next button", type: "text" },
          { path: "submitButtonLabel", label: "Submit button", type: "text" },
          { path: "footerNote", label: "Footer note", type: "text" },
        ],
      },
      ...defaultSiteContent.inquire.supportStates.map<SiteContentSectionConfig>((state, index) => ({
        id: `inquire-support-${index + 1}`,
        title: `Support state ${index + 1}`,
        description: state.label,
        fields: [
          { path: `supportStates.${index}.label`, label: "Step label", type: "text" },
          { path: `supportStates.${index}.title`, label: "Support title", type: "text" },
          { path: `supportStates.${index}.body`, label: "Support body", type: "textarea", rows: 3 },
        ],
      })),
      ...defaultSiteContent.inquire.formSteps.map<SiteContentSectionConfig>((step, index) => ({
        id: `inquire-form-step-${index + 1}`,
        title: `Form step ${index + 1}`,
        description: step.chip,
        fields: [
          { path: `formSteps.${index}.chip`, label: "Chip label", type: "text" },
          { path: `formSteps.${index}.title`, label: "Step title", type: "text" },
          { path: `formSteps.${index}.description`, label: "Step description", type: "textarea", rows: 3 },
        ],
      })),
      {
        id: "inquire-follow-up",
        title: "Support panel copy",
        fields: [
          { path: "progressionLabel", label: "Progression label", type: "text" },
          { path: "mediaNote", label: "Media note", type: "textarea", rows: 3 },
          { path: "nextHeading", label: "Next-step heading", type: "text" },
          { path: "nextBody", label: "Next-step body", type: "textarea", rows: 3 },
        ],
      },
      {
        id: "inquire-success",
        title: "Success state",
        fields: [
          { path: "successEyebrow", label: "Success eyebrow", type: "text" },
          { path: "successTitle", label: "Success headline", type: "text" },
          { path: "successBody", label: "Success body", type: "textarea", rows: 4 },
          { path: "successResetLabel", label: "Reset button label", type: "text" },
          { path: "successReturnLabel", label: "Return button label", type: "text" },
        ],
      },
    ],
  },
];
