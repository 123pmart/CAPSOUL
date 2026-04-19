import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

import { del, put } from "@vercel/blob";

import {
  getMediaSlotDefinition,
  mediaSlotDefinitions,
  type MediaSlotDefinition,
} from "@/lib/media-slots";
import { ensureDatabaseReady, getDatabaseClient } from "@/lib/database";
import {
  getFileNameFromPublicPath,
  readOptionalLegacyJson,
  readOptionalLegacyPublicFile,
} from "@/lib/legacy-import";
import {
  canUseLegacyMutableFallback,
  hasBlobStorage,
  hasPersistentDatabase,
} from "@/lib/server-env";
import {
  DATA_ROOT,
  MEDIA_UPLOAD_ROOT,
  ensureDir,
  fileExists,
  readJsonFile,
  resolvePublicPathToFile,
  toPublicMediaPath,
  writeJsonFile,
} from "@/lib/storage";

export type MediaAssignment = {
  slotId: string;
  src: string;
  fileName: string;
  updatedAt: string;
  updatedBy: string;
};

export type ResolvedMediaSlot = MediaSlotDefinition & {
  src: string;
  isCustom: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

type MediaAssignmentRecord = Record<string, MediaAssignment>;

type PersistentMediaRow = {
  slot_id: string;
  blob_url: string;
  blob_pathname: string | null;
  content_type: string | null;
  size_bytes: string | number | null;
  original_name: string | null;
  updated_at: string | Date;
  updated_by: string;
};

const MEDIA_ASSIGNMENTS_FILE = path.join(DATA_ROOT, "media-slots.json");
const persistentMediaSeedKey = Symbol.for("capsoul.persistent-media-seed");

function getSafeExtension(fileName: string, mimeType: string) {
  const extensionFromName = path.extname(fileName).toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/avif") return ".avif";
  if (mimeType === "image/svg+xml") return ".svg";

  return ".bin";
}

function guessMimeType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".gif") return "image/gif";

  return "";
}

function toSafeFileStem(slotId: string) {
  return slotId.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function readLegacyAssignments() {
  return readJsonFile<MediaAssignmentRecord>(MEDIA_ASSIGNMENTS_FILE, {});
}

async function resolveLegacyCustomSource(src?: string | null) {
  if (!src) {
    return null;
  }

  const filePath = resolvePublicPathToFile(src);

  if (!filePath) {
    return null;
  }

  return (await fileExists(filePath)) ? src : null;
}

async function resolveLegacyMediaSlotSource(slotId: string) {
  const slot = getMediaSlotDefinition(slotId);

  if (!slot) {
    return "/visuals/hero-frame.svg";
  }

  const assignments = await readLegacyAssignments();
  const customSource = await resolveLegacyCustomSource(assignments[slotId]?.src);

  return customSource ?? slot.fallbackSrc;
}

async function listLegacyResolvedMediaSlots(): Promise<ResolvedMediaSlot[]> {
  const assignments = await readLegacyAssignments();

  return Promise.all(
    mediaSlotDefinitions.map(async (slot) => {
      const customSource = await resolveLegacyCustomSource(assignments[slot.id]?.src);

      return {
        ...slot,
        src: customSource ?? slot.fallbackSrc,
        isCustom: Boolean(customSource),
        updatedAt: customSource ? assignments[slot.id]?.updatedAt ?? null : null,
        updatedBy: customSource ? assignments[slot.id]?.updatedBy ?? null : null,
      };
    }),
  );
}

async function saveLegacyMediaSlotUpload(input: {
  slotId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  updatedBy: string;
}) {
  const slot = getMediaSlotDefinition(input.slotId);

  if (!slot) {
    throw new Error("Unknown media slot.");
  }

  const extension = getSafeExtension(input.fileName, input.mimeType);
  const generatedFileName = `${toSafeFileStem(input.slotId)}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;

  await ensureDir(MEDIA_UPLOAD_ROOT);
  await fs.writeFile(path.join(MEDIA_UPLOAD_ROOT, generatedFileName), input.fileBuffer);

  const assignments = await readLegacyAssignments();
  assignments[input.slotId] = {
    slotId: input.slotId,
    src: toPublicMediaPath(generatedFileName),
    fileName: generatedFileName,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy,
  };

  await writeJsonFile(MEDIA_ASSIGNMENTS_FILE, assignments);

  const updatedSlots = await listLegacyResolvedMediaSlots();
  return (
    updatedSlots.find((entry) => entry.id === input.slotId) ?? {
      ...slot,
      src: assignments[input.slotId].src,
      isCustom: true,
      updatedAt: assignments[input.slotId].updatedAt,
      updatedBy: assignments[input.slotId].updatedBy,
    }
  );
}

async function removeLegacyFile(publicPath: string) {
  const filePath = resolvePublicPathToFile(publicPath);

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    const fileSystemError = error as NodeJS.ErrnoException;

    if (fileSystemError?.code !== "ENOENT") {
      throw error;
    }
  }
}

async function ensurePersistentMediaSeeded() {
  if (!hasPersistentDatabase()) {
    return;
  }

  const globalState = globalThis as unknown as typeof globalThis &
    Record<PropertyKey, Promise<void> | undefined>;

  if (!globalState[persistentMediaSeedKey]) {
    globalState[persistentMediaSeedKey] = (async () => {
      await ensureDatabaseReady();
      const sql = getDatabaseClient();
      const existingRows = await sql<{ slot_id: string }[]>`
        SELECT slot_id
        FROM media_slots
        LIMIT 1
      `;

      if (existingRows.length > 0 || !hasBlobStorage()) {
        return;
      }

      const legacyAssignments = await readOptionalLegacyJson<MediaAssignmentRecord>("media-slots.json");

      if (!legacyAssignments) {
        return;
      }

      for (const [slotId, assignment] of Object.entries(legacyAssignments)) {
        const slot = getMediaSlotDefinition(slotId);

        if (!slot) {
          continue;
        }

        const fileBuffer = await readOptionalLegacyPublicFile(assignment.src);

        if (!fileBuffer) {
          continue;
        }

        const originalName = assignment.fileName || getFileNameFromPublicPath(assignment.src);
        const mimeType = guessMimeType(originalName);
        const extension = getSafeExtension(originalName, mimeType);
        const blobPath = `capsoul/media/${toSafeFileStem(slotId)}/${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
        const blob = await put(blobPath, fileBuffer, {
          access: "public",
          addRandomSuffix: false,
          contentType: mimeType || undefined,
        });

        await sql`
          INSERT INTO media_slots (
            slot_id,
            blob_url,
            blob_pathname,
            content_type,
            size_bytes,
            original_name,
            updated_at,
            updated_by
          )
          VALUES (
            ${slotId},
            ${blob.url},
            ${blob.pathname},
            ${mimeType || null},
            ${fileBuffer.length},
            ${originalName},
            ${assignment.updatedAt},
            ${assignment.updatedBy}
          )
          ON CONFLICT (slot_id) DO NOTHING
        `;
      }
    })();
  }

  await globalState[persistentMediaSeedKey];
}

function toRowMap(rows: PersistentMediaRow[]) {
  return new Map(rows.map((row) => [row.slot_id, row]));
}

function toResolvedMediaSlot(slot: MediaSlotDefinition, row?: PersistentMediaRow): ResolvedMediaSlot {
  return {
    ...slot,
    src: row?.blob_url ?? slot.fallbackSrc,
    isCustom: Boolean(row?.blob_url),
    updatedAt: row ? toIsoString(row.updated_at) : null,
    updatedBy: row?.updated_by ?? null,
  };
}

async function listPersistentMediaRows() {
  await ensurePersistentMediaSeeded();
  const sql = getDatabaseClient();
  return sql<PersistentMediaRow[]>`
    SELECT
      slot_id,
      blob_url,
      blob_pathname,
      content_type,
      size_bytes,
      original_name,
      updated_at,
      updated_by
    FROM media_slots
  `;
}

export async function resolveMediaSlotSource(slotId: string) {
  const slot = getMediaSlotDefinition(slotId);

  if (!slot) {
    return "/visuals/hero-frame.svg";
  }

  if (hasPersistentDatabase()) {
    try {
      const sql = getDatabaseClient();
      await ensurePersistentMediaSeeded();
      const rows = await sql<PersistentMediaRow[]>`
        SELECT
          slot_id,
          blob_url,
          blob_pathname,
          content_type,
          size_bytes,
          original_name,
          updated_at,
          updated_by
        FROM media_slots
        WHERE slot_id = ${slotId}
        LIMIT 1
      `;

      return rows[0]?.blob_url ?? slot.fallbackSrc;
    } catch {
      return slot.fallbackSrc;
    }
  }

  if (canUseLegacyMutableFallback()) {
    return resolveLegacyMediaSlotSource(slotId);
  }

  return slot.fallbackSrc;
}

export async function listResolvedMediaSlots(): Promise<ResolvedMediaSlot[]> {
  if (hasPersistentDatabase()) {
    try {
      const rows = await listPersistentMediaRows();
      const rowMap = toRowMap(rows);

      return mediaSlotDefinitions.map((slot) => toResolvedMediaSlot(slot, rowMap.get(slot.id)));
    } catch {
      return mediaSlotDefinitions.map((slot) => ({
        ...slot,
        src: slot.fallbackSrc,
        isCustom: false,
        updatedAt: null,
        updatedBy: null,
      }));
    }
  }

  if (canUseLegacyMutableFallback()) {
    return listLegacyResolvedMediaSlots();
  }

  return mediaSlotDefinitions.map((slot) => ({
    ...slot,
    src: slot.fallbackSrc,
    isCustom: false,
    updatedAt: null,
    updatedBy: null,
  }));
}

export async function saveMediaSlotUpload(input: {
  slotId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  updatedBy: string;
}) {
  const slot = getMediaSlotDefinition(input.slotId);

  if (!slot) {
    throw new Error("Unknown media slot.");
  }

  if (hasPersistentDatabase()) {
    if (!hasBlobStorage()) {
      throw new Error("BLOB_READ_WRITE_TOKEN is required for media uploads.");
    }

    await ensurePersistentMediaSeeded();
    const sql = getDatabaseClient();
    const existingRows = await sql<PersistentMediaRow[]>`
      SELECT
        slot_id,
        blob_url,
        blob_pathname,
        content_type,
        size_bytes,
        original_name,
        updated_at,
        updated_by
      FROM media_slots
      WHERE slot_id = ${input.slotId}
      LIMIT 1
    `;

    const extension = getSafeExtension(input.fileName, input.mimeType);
    const blobPath = `capsoul/media/${toSafeFileStem(input.slotId)}/${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
    const blob = await put(blobPath, input.fileBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: input.mimeType || undefined,
    });
    const updatedAt = new Date().toISOString();

    const updatedRows = await sql<PersistentMediaRow[]>`
      INSERT INTO media_slots (
        slot_id,
        blob_url,
        blob_pathname,
        content_type,
        size_bytes,
        original_name,
        updated_at,
        updated_by
      )
      VALUES (
        ${input.slotId},
        ${blob.url},
        ${blob.pathname},
        ${input.mimeType || null},
        ${input.fileBuffer.length},
        ${input.fileName},
        ${updatedAt},
        ${input.updatedBy}
      )
      ON CONFLICT (slot_id)
      DO UPDATE SET
        blob_url = EXCLUDED.blob_url,
        blob_pathname = EXCLUDED.blob_pathname,
        content_type = EXCLUDED.content_type,
        size_bytes = EXCLUDED.size_bytes,
        original_name = EXCLUDED.original_name,
        updated_at = EXCLUDED.updated_at,
        updated_by = EXCLUDED.updated_by
      RETURNING
        slot_id,
        blob_url,
        blob_pathname,
        content_type,
        size_bytes,
        original_name,
        updated_at,
        updated_by
    `;

    const previousPathname = existingRows[0]?.blob_pathname;

    if (previousPathname && previousPathname !== blob.pathname) {
      void del(previousPathname).catch(() => undefined);
    }

    return toResolvedMediaSlot(slot, updatedRows[0]);
  }

  if (!canUseLegacyMutableFallback()) {
    throw new Error("Persistent media storage is not configured.");
  }

  return saveLegacyMediaSlotUpload(input);
}

export async function removeMediaSlotAssignment(slotId: string) {
  const slot = getMediaSlotDefinition(slotId);

  if (!slot) {
    throw new Error("Unknown media slot.");
  }

  if (hasPersistentDatabase()) {
    await ensurePersistentMediaSeeded();
    const sql = getDatabaseClient();
    const existingRows = await sql<PersistentMediaRow[]>`
      SELECT
        slot_id,
        blob_url,
        blob_pathname,
        content_type,
        size_bytes,
        original_name,
        updated_at,
        updated_by
      FROM media_slots
      WHERE slot_id = ${slotId}
      LIMIT 1
    `;

    const existingRow = existingRows[0];

    await sql`
      DELETE FROM media_slots
      WHERE slot_id = ${slotId}
    `;

    if (existingRow?.blob_pathname) {
      try {
        await del(existingRow.blob_pathname);
      } catch {
        // Keep the slot safely unassigned even if Blob cleanup fails.
      }
    }

    return toResolvedMediaSlot(slot);
  }

  if (!canUseLegacyMutableFallback()) {
    throw new Error("Persistent media storage is not configured.");
  }

  const assignments = await readLegacyAssignments();
  const existingAssignment = assignments[slotId];

  if (existingAssignment?.src) {
    try {
      await removeLegacyFile(existingAssignment.src);
    } catch {
      // Keep the slot safely unassigned even if local cleanup fails.
    }
  }

  delete assignments[slotId];
  await writeJsonFile(MEDIA_ASSIGNMENTS_FILE, assignments);

  return toResolvedMediaSlot(slot);
}
