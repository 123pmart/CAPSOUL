import path from "path";

import { ensureDatabaseReady, getDatabaseClient } from "@/lib/database";
import { readOptionalLegacyJson } from "@/lib/legacy-import";
import { canUseLegacyMutableFallback, hasPersistentDatabase } from "@/lib/server-env";
import { DATA_ROOT, readJsonFile, writeJsonFile } from "@/lib/storage";
import {
  cloneDefaultSiteContent,
  cloneDefaultSiteContentDocument,
  defaultSiteContent,
  defaultSiteContentDocument,
  defaultSpanishSiteContent,
  type EditableInquiryContent,
  type EditableInquirySupportState,
  type EditableSceneAction,
  type EditableSceneContent,
  type EditableSceneStep,
  type GlobalSiteContent,
  type InquiryFieldCopy,
  type InquiryFormStepContent,
  type SiteContent,
  type SiteContentDocument,
  type SiteLocale,
} from "@/lib/site-content-schema";

const SITE_CONTENT_FILE = path.join(DATA_ROOT, "site-content.json");
const persistentContentSeedKey = Symbol.for("capsoul.persistent-site-content-seed");
const SITE_CONTENT_PRIMARY_KEY = "primary";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : fallback;
}

function mergeAction(value: unknown, fallback?: EditableSceneAction) {
  if (!fallback) {
    return undefined;
  }

  const record = isRecord(value) ? value : {};
  return {
    label: normalizeText(record.label, fallback.label),
    href: normalizeText(record.href, fallback.href),
  };
}

function mergeStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value) || value.length === 0) {
    return [...fallback];
  }

  return fallback.map((fallbackItem, index) => normalizeText(value[index], fallbackItem));
}

function mergeSceneStep(value: unknown, fallback: EditableSceneStep): EditableSceneStep {
  const record = isRecord(value) ? value : {};

  return {
    label: normalizeText(record.label, fallback.label),
    title: normalizeText(record.title, fallback.title),
    summary: normalizeText(record.summary, fallback.summary),
    detail: normalizeText(record.detail, fallback.detail),
    bullets: mergeStringList(record.bullets, fallback.bullets),
    mediaLabel: normalizeText(record.mediaLabel, fallback.mediaLabel),
    mediaCaption: normalizeText(record.mediaCaption, fallback.mediaCaption),
  };
}

function mergeSceneContent(value: unknown, fallback: EditableSceneContent): EditableSceneContent {
  const record = isRecord(value) ? value : {};
  const steps = Array.isArray(record.steps) ? record.steps : [];

  return {
    eyebrow: normalizeText(record.eyebrow, fallback.eyebrow),
    title: normalizeText(record.title, fallback.title),
    description: normalizeText(record.description, fallback.description),
    primaryAction: mergeAction(record.primaryAction, fallback.primaryAction),
    secondaryAction: mergeAction(record.secondaryAction, fallback.secondaryAction),
    stageLabel: normalizeText(record.stageLabel, fallback.stageLabel),
    compactNote: normalizeText(record.compactNote, fallback.compactNote),
    steps: fallback.steps.map((step, index) => mergeSceneStep(steps[index], step)),
  };
}

function mergeSupportState(
  value: unknown,
  fallback: EditableInquirySupportState,
): EditableInquirySupportState {
  const record = isRecord(value) ? value : {};

  return {
    label: normalizeText(record.label, fallback.label),
    title: normalizeText(record.title, fallback.title),
    body: normalizeText(record.body, fallback.body),
  };
}

function mergeFormStep(value: unknown, fallback: InquiryFormStepContent): InquiryFormStepContent {
  const record = isRecord(value) ? value : {};

  return {
    chip: normalizeText(record.chip, fallback.chip),
    title: normalizeText(record.title, fallback.title),
    description: normalizeText(record.description, fallback.description),
  };
}

function mergeInquiryFieldCopy(value: unknown, fallback: InquiryFieldCopy): InquiryFieldCopy {
  const record = isRecord(value) ? value : {};

  return {
    fullNameLabel: normalizeText(record.fullNameLabel, fallback.fullNameLabel),
    fullNamePlaceholder: normalizeText(record.fullNamePlaceholder, fallback.fullNamePlaceholder),
    emailLabel: normalizeText(record.emailLabel, fallback.emailLabel),
    emailPlaceholder: normalizeText(record.emailPlaceholder, fallback.emailPlaceholder),
    phoneLabel: normalizeText(record.phoneLabel, fallback.phoneLabel),
    phonePlaceholder: normalizeText(record.phonePlaceholder, fallback.phonePlaceholder),
    regionLabel: normalizeText(record.regionLabel, fallback.regionLabel),
    regionPlaceholder: normalizeText(record.regionPlaceholder, fallback.regionPlaceholder),
    filmForLabel: normalizeText(record.filmForLabel, fallback.filmForLabel),
    filmForPlaceholder: normalizeText(record.filmForPlaceholder, fallback.filmForPlaceholder),
    relationshipLabel: normalizeText(record.relationshipLabel, fallback.relationshipLabel),
    relationshipPlaceholder: normalizeText(
      record.relationshipPlaceholder,
      fallback.relationshipPlaceholder,
    ),
    stillLivingLabel: normalizeText(record.stillLivingLabel, fallback.stillLivingLabel),
    stillLivingPlaceholder: normalizeText(
      record.stillLivingPlaceholder,
      fallback.stillLivingPlaceholder,
    ),
    stillLivingYes: normalizeText(record.stillLivingYes, fallback.stillLivingYes),
    stillLivingNo: normalizeText(record.stillLivingNo, fallback.stillLivingNo),
    stillLivingPreferNot: normalizeText(
      record.stillLivingPreferNot,
      fallback.stillLivingPreferNot,
    ),
    timelineLabel: normalizeText(record.timelineLabel, fallback.timelineLabel),
    timelinePlaceholder: normalizeText(record.timelinePlaceholder, fallback.timelinePlaceholder),
    storyImportanceLabel: normalizeText(
      record.storyImportanceLabel,
      fallback.storyImportanceLabel,
    ),
    storyImportancePlaceholder: normalizeText(
      record.storyImportancePlaceholder,
      fallback.storyImportancePlaceholder,
    ),
    filmingLocationLabel: normalizeText(
      record.filmingLocationLabel,
      fallback.filmingLocationLabel,
    ),
    filmingLocationPlaceholder: normalizeText(
      record.filmingLocationPlaceholder,
      fallback.filmingLocationPlaceholder,
    ),
    faithContextLabel: normalizeText(record.faithContextLabel, fallback.faithContextLabel),
    faithContextPlaceholder: normalizeText(
      record.faithContextPlaceholder,
      fallback.faithContextPlaceholder,
    ),
    faithContextCentral: normalizeText(
      record.faithContextCentral,
      fallback.faithContextCentral,
    ),
    faithContextPresent: normalizeText(
      record.faithContextPresent,
      fallback.faithContextPresent,
    ),
    faithContextNotReally: normalizeText(
      record.faithContextNotReally,
      fallback.faithContextNotReally,
    ),
    faithContextNotSure: normalizeText(record.faithContextNotSure, fallback.faithContextNotSure),
    extraNotesLabel: normalizeText(record.extraNotesLabel, fallback.extraNotesLabel),
    extraNotesPlaceholder: normalizeText(
      record.extraNotesPlaceholder,
      fallback.extraNotesPlaceholder,
    ),
    submittingLabel: normalizeText(record.submittingLabel, fallback.submittingLabel),
  };
}

function mergeInquiryContent(value: unknown, fallback: EditableInquiryContent): EditableInquiryContent {
  const record = isRecord(value) ? value : {};
  const supportStates = Array.isArray(record.supportStates) ? record.supportStates : [];
  const formSteps = Array.isArray(record.formSteps) ? record.formSteps : [];

  return {
    eyebrow: normalizeText(record.eyebrow, fallback.eyebrow),
    title: normalizeText(record.title, fallback.title),
    description: normalizeText(record.description, fallback.description),
    trustPoints: mergeStringList(record.trustPoints, fallback.trustPoints),
    supportStates: fallback.supportStates.map((state, index) =>
      mergeSupportState(supportStates[index], state),
    ),
    formSteps: fallback.formSteps.map((step, index) => mergeFormStep(formSteps[index], step)),
    fieldCopy: mergeInquiryFieldCopy(record.fieldCopy, fallback.fieldCopy),
    previousButtonLabel: normalizeText(record.previousButtonLabel, fallback.previousButtonLabel),
    nextButtonLabel: normalizeText(record.nextButtonLabel, fallback.nextButtonLabel),
    submitButtonLabel: normalizeText(record.submitButtonLabel, fallback.submitButtonLabel),
    progressionLabel: normalizeText(record.progressionLabel, fallback.progressionLabel),
    mediaNote: normalizeText(record.mediaNote, fallback.mediaNote),
    nextHeading: normalizeText(record.nextHeading, fallback.nextHeading),
    nextBody: normalizeText(record.nextBody, fallback.nextBody),
    footerNote: normalizeText(record.footerNote, fallback.footerNote),
    successEyebrow: normalizeText(record.successEyebrow, fallback.successEyebrow),
    successTitle: normalizeText(record.successTitle, fallback.successTitle),
    successBody: normalizeText(record.successBody, fallback.successBody),
    successResetLabel: normalizeText(record.successResetLabel, fallback.successResetLabel),
    successReturnLabel: normalizeText(record.successReturnLabel, fallback.successReturnLabel),
  };
}

function mergeGlobalContent(value: unknown, fallback: GlobalSiteContent): GlobalSiteContent {
  const record = isRecord(value) ? value : {};
  const navigation = isRecord(record.navigation) ? record.navigation : {};
  const routeLabels = isRecord(record.routeLabels) ? record.routeLabels : {};
  const sceneLabels = isRecord(record.sceneLabels) ? record.sceneLabels : {};
  const languageLabels = isRecord(record.languageLabels) ? record.languageLabels : {};

  return {
    brandDescriptor: normalizeText(record.brandDescriptor, fallback.brandDescriptor),
    headerTagline: normalizeText(record.headerTagline, fallback.headerTagline),
    headerInquireLabel: normalizeText(record.headerInquireLabel, fallback.headerInquireLabel),
    mobileHeaderInquireLabel: normalizeText(
      record.mobileHeaderInquireLabel,
      fallback.mobileHeaderInquireLabel,
    ),
    adminEntryLabel: normalizeText(record.adminEntryLabel, fallback.adminEntryLabel),
    navigation: {
      home: normalizeText(navigation.home, fallback.navigation.home),
      experience: normalizeText(navigation.experience, fallback.navigation.experience),
      process: normalizeText(navigation.process, fallback.navigation.process),
      preserve: normalizeText(navigation.preserve, fallback.navigation.preserve),
      inquire: normalizeText(navigation.inquire, fallback.navigation.inquire),
    },
    routeLabels: {
      previous: normalizeText(routeLabels.previous, fallback.routeLabels.previous),
      next: normalizeText(routeLabels.next, fallback.routeLabels.next),
      nextPagePrefix: normalizeText(
        routeLabels.nextPagePrefix,
        fallback.routeLabels.nextPagePrefix,
      ),
    },
    sceneLabels: {
      tapImageHint: normalizeText(sceneLabels.tapImageHint, fallback.sceneLabels.tapImageHint),
      arrowInstruction: normalizeText(
        sceneLabels.arrowInstruction,
        fallback.sceneLabels.arrowInstruction,
      ),
      activeState: normalizeText(sceneLabels.activeState, fallback.sceneLabels.activeState),
    },
    languageLabels: {
      en: normalizeText(languageLabels.en, fallback.languageLabels.en),
      es: normalizeText(languageLabels.es, fallback.languageLabels.es),
    },
  };
}

export function normalizeSiteContent(
  value: unknown,
  fallback: SiteContent = defaultSiteContent,
): SiteContent {
  const record = isRecord(value) ? value : {};

  return {
    global: mergeGlobalContent(record.global, fallback.global),
    home: mergeSceneContent(record.home, fallback.home),
    experience: mergeSceneContent(record.experience, fallback.experience),
    process: mergeSceneContent(record.process, fallback.process),
    preserve: mergeSceneContent(record.preserve, fallback.preserve),
    inquire: mergeInquiryContent(record.inquire, fallback.inquire),
  };
}

export function normalizeSiteContentDocument(value: unknown): SiteContentDocument {
  const record = isRecord(value) ? value : {};
  const locales = isRecord(record.locales) ? record.locales : null;

  if (locales) {
    return {
      locales: {
        en: normalizeSiteContent(locales.en, defaultSiteContent),
        es: normalizeSiteContent(locales.es, defaultSpanishSiteContent),
      },
    };
  }

  return {
    locales: {
      en: normalizeSiteContent(record, defaultSiteContent),
      es: cloneDefaultSiteContent("es"),
    },
  };
}

async function ensurePersistentSiteContentSeeded() {
  if (!hasPersistentDatabase()) {
    return;
  }

  const globalState = globalThis as unknown as typeof globalThis &
    Record<PropertyKey, Promise<void> | undefined>;

  if (!globalState[persistentContentSeedKey]) {
    globalState[persistentContentSeedKey] = (async () => {
      await ensureDatabaseReady();
      const sql = getDatabaseClient();
      const existingRows = await sql<{ content_key: string }[]>`
        SELECT content_key
        FROM site_content
        WHERE content_key = ${SITE_CONTENT_PRIMARY_KEY}
        LIMIT 1
      `;

      if (existingRows.length > 0) {
        return;
      }

      const legacyContent =
        (await readOptionalLegacyJson<unknown>("site-content.json")) ??
        cloneDefaultSiteContentDocument();
      const normalizedContent = normalizeSiteContentDocument(legacyContent);

      await sql`
        INSERT INTO site_content (content_key, content, updated_at)
        VALUES (${SITE_CONTENT_PRIMARY_KEY}, ${JSON.stringify(normalizedContent)}::jsonb, NOW())
        ON CONFLICT (content_key) DO NOTHING
      `;
    })();
  }

  await globalState[persistentContentSeedKey];
}

export async function getSiteContentDocument(): Promise<SiteContentDocument> {
  if (hasPersistentDatabase()) {
    try {
      await ensurePersistentSiteContentSeeded();
      const sql = getDatabaseClient();
      const rows = await sql<{ content: unknown }[]>`
        SELECT content
        FROM site_content
        WHERE content_key = ${SITE_CONTENT_PRIMARY_KEY}
        LIMIT 1
      `;

      const storedContent = rows[0]?.content ?? cloneDefaultSiteContentDocument();
      const normalizedContent = normalizeSiteContentDocument(
        typeof storedContent === "string" ? JSON.parse(storedContent) : storedContent,
      );

      if (JSON.stringify(storedContent) !== JSON.stringify(normalizedContent)) {
        await sql`
          INSERT INTO site_content (content_key, content, updated_at)
          VALUES (${SITE_CONTENT_PRIMARY_KEY}, ${JSON.stringify(normalizedContent)}::jsonb, NOW())
          ON CONFLICT (content_key)
          DO UPDATE SET content = EXCLUDED.content, updated_at = EXCLUDED.updated_at
        `;
      }

      return normalizedContent;
    } catch {
      return cloneDefaultSiteContentDocument();
    }
  }

  if (!canUseLegacyMutableFallback()) {
    return cloneDefaultSiteContentDocument();
  }

  const fallback = cloneDefaultSiteContentDocument();
  const storedContent = await readJsonFile<unknown>(SITE_CONTENT_FILE, fallback);
  const normalizedContent = normalizeSiteContentDocument(storedContent);

  if (JSON.stringify(storedContent) !== JSON.stringify(normalizedContent)) {
    await writeJsonFile(SITE_CONTENT_FILE, normalizedContent);
  }

  return normalizedContent;
}

export async function getSiteContent(locale: SiteLocale = "en"): Promise<SiteContent> {
  const document = await getSiteContentDocument();
  return document.locales[locale] ?? document.locales.en ?? cloneDefaultSiteContent();
}

export async function saveSiteContentDocument(content: unknown): Promise<SiteContentDocument> {
  const normalizedContent = normalizeSiteContentDocument(content);

  if (hasPersistentDatabase()) {
    await ensurePersistentSiteContentSeeded();
    const sql = getDatabaseClient();
    await sql`
      INSERT INTO site_content (content_key, content, updated_at)
      VALUES (${SITE_CONTENT_PRIMARY_KEY}, ${JSON.stringify(normalizedContent)}::jsonb, NOW())
      ON CONFLICT (content_key)
      DO UPDATE SET content = EXCLUDED.content, updated_at = EXCLUDED.updated_at
    `;

    return normalizedContent;
  }

  if (!canUseLegacyMutableFallback()) {
    throw new Error("Persistent site content storage is not configured.");
  }

  await writeJsonFile(SITE_CONTENT_FILE, normalizedContent);
  return normalizedContent;
}

export async function saveSiteContent(content: unknown): Promise<SiteContentDocument> {
  return saveSiteContentDocument(content);
}
