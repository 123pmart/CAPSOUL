import path from "path";

import { ensureDatabaseReady, getDatabaseClient } from "@/lib/database";
import { readOptionalLegacyJson } from "@/lib/legacy-import";
import { canUseLegacyMutableFallback, hasPersistentDatabase } from "@/lib/server-env";
import { DATA_ROOT, readJsonFile, writeJsonFile } from "@/lib/storage";
import {
  cloneDefaultSiteContent,
  defaultSiteContent,
  type EditableInquiryContent,
  type EditableInquirySupportState,
  type EditableSceneAction,
  type EditableSceneContent,
  type EditableSceneStep,
  type InquiryFormStepContent,
  type SiteContent,
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

export function normalizeSiteContent(value: unknown): SiteContent {
  const record = isRecord(value) ? value : {};

  return {
    home: mergeSceneContent(record.home, defaultSiteContent.home),
    experience: mergeSceneContent(record.experience, defaultSiteContent.experience),
    process: mergeSceneContent(record.process, defaultSiteContent.process),
    preserve: mergeSceneContent(record.preserve, defaultSiteContent.preserve),
    inquire: mergeInquiryContent(record.inquire, defaultSiteContent.inquire),
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
        (await readOptionalLegacyJson<unknown>("site-content.json")) ?? cloneDefaultSiteContent();
      const normalizedContent = normalizeSiteContent(legacyContent);

      await sql`
        INSERT INTO site_content (content_key, content, updated_at)
        VALUES (${SITE_CONTENT_PRIMARY_KEY}, ${JSON.stringify(normalizedContent)}::jsonb, NOW())
        ON CONFLICT (content_key) DO NOTHING
      `;
    })();
  }

  await globalState[persistentContentSeedKey];
}

export async function getSiteContent(): Promise<SiteContent> {
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

      const storedContent = rows[0]?.content ?? cloneDefaultSiteContent();
      const normalizedContent = normalizeSiteContent(
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
      return cloneDefaultSiteContent();
    }
  }

  if (!canUseLegacyMutableFallback()) {
    return cloneDefaultSiteContent();
  }

  const fallback = cloneDefaultSiteContent();
  const storedContent = await readJsonFile<unknown>(SITE_CONTENT_FILE, fallback);
  const normalizedContent = normalizeSiteContent(storedContent);

  if (JSON.stringify(storedContent) !== JSON.stringify(normalizedContent)) {
    await writeJsonFile(SITE_CONTENT_FILE, normalizedContent);
  }

  return normalizedContent;
}

export async function saveSiteContent(content: unknown): Promise<SiteContent> {
  const normalizedContent = normalizeSiteContent(content);

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
