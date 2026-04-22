import { randomUUID } from "crypto";
import path from "path";

import { ensureDatabaseReady, getDatabaseClient } from "@/lib/database";
import { readOptionalLegacyJson } from "@/lib/legacy-import";
import { canUseLegacyMutableFallback, hasPersistentDatabase } from "@/lib/server-env";
import { DATA_ROOT, readJsonFile, writeJsonFile } from "@/lib/storage";

export type LeadStatus = "new" | "contacted" | "closed";

export type LeadSubmissionInput = {
  fullName: string;
  email: string;
  phone: string;
  region: string;
  estimatedBudget: string;
  filmFor: string;
  relationship: string;
  stillLiving: string;
  timeline: string;
  storyImportance: string;
  filmingLocation: string;
  faithContext: string;
  extraNotes: string;
};

export type LeadRecord = LeadSubmissionInput & {
  id: string;
  submittedAt: string;
  status: LeadStatus;
};

const LEADS_FILE = path.join(DATA_ROOT, "leads.json");
const persistentLeadSeedKey = Symbol.for("capsoul.persistent-lead-seed");

type PersistentLeadRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  region: string;
  estimated_budget: string;
  film_for: string;
  relationship: string;
  still_living: string;
  timeline: string;
  story_importance: string;
  filming_location: string;
  faith_context: string;
  extra_notes: string;
  status: LeadStatus;
  submitted_at: string | Date;
};

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeValue(value: string) {
  return value.trim();
}

function normalizeLeadInput(input: LeadSubmissionInput): LeadSubmissionInput {
  return {
    fullName: normalizeValue(input.fullName),
    email: normalizeValue(input.email).toLowerCase(),
    phone: normalizeValue(input.phone),
    region: normalizeValue(input.region),
    estimatedBudget: normalizeValue(input.estimatedBudget),
    filmFor: normalizeValue(input.filmFor),
    relationship: normalizeValue(input.relationship),
    stillLiving: normalizeValue(input.stillLiving),
    timeline: normalizeValue(input.timeline),
    storyImportance: normalizeValue(input.storyImportance),
    filmingLocation: normalizeValue(input.filmingLocation),
    faithContext: normalizeValue(input.faithContext),
    extraNotes: normalizeValue(input.extraNotes),
  };
}

function validateLeadInput(input: LeadSubmissionInput) {
  if (!input.fullName) {
    throw new Error("Full name is required.");
  }

  if (!input.email || !input.email.includes("@")) {
    throw new Error("A valid email address is required.");
  }

  if (!input.filmFor) {
    throw new Error("Please share who the film is for.");
  }

  if (!input.relationship) {
    throw new Error("Please share the relationship.");
  }

  if (!input.stillLiving) {
    throw new Error("Please tell us whether they are still living.");
  }

  if (!input.storyImportance) {
    throw new Error("Please share why this feels important now.");
  }
}

function mapPersistentLead(row: PersistentLeadRow): LeadRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    region: row.region,
    estimatedBudget: row.estimated_budget,
    filmFor: row.film_for,
    relationship: row.relationship,
    stillLiving: row.still_living,
    timeline: row.timeline,
    storyImportance: row.story_importance,
    filmingLocation: row.filming_location,
    faithContext: row.faith_context,
    extraNotes: row.extra_notes,
    status: row.status,
    submittedAt: toIsoString(row.submitted_at),
  };
}

async function listLegacyLeads() {
  const leads = await readJsonFile<LeadRecord[]>(LEADS_FILE, []);

  return [...leads].sort(
    (left, right) => Date.parse(right.submittedAt) - Date.parse(left.submittedAt),
  );
}

async function ensurePersistentLeadsSeeded() {
  if (!hasPersistentDatabase()) {
    return;
  }

  const globalState = globalThis as unknown as typeof globalThis &
    Record<PropertyKey, Promise<void> | undefined>;

  if (!globalState[persistentLeadSeedKey]) {
    globalState[persistentLeadSeedKey] = (async () => {
      await ensureDatabaseReady();
      const sql = getDatabaseClient();
      const existingRows = await sql<{ count: string }[]>`
        SELECT COUNT(*)::text AS count
        FROM leads
      `;

      if (Number(existingRows[0]?.count ?? "0") > 0) {
        return;
      }

      const legacyLeads = await readOptionalLegacyJson<LeadRecord[]>("leads.json");

      if (!legacyLeads?.length) {
        return;
      }

      for (const lead of legacyLeads) {
        await sql`
          INSERT INTO leads (
            id,
            full_name,
            email,
            phone,
            region,
            estimated_budget,
            film_for,
            relationship,
            still_living,
            timeline,
            story_importance,
            filming_location,
            faith_context,
            extra_notes,
            status,
            submitted_at
          )
          VALUES (
            ${lead.id},
            ${lead.fullName},
            ${lead.email},
            ${lead.phone},
            ${lead.region},
            ${lead.estimatedBudget ?? ""},
            ${lead.filmFor},
            ${lead.relationship},
            ${lead.stillLiving},
            ${lead.timeline},
            ${lead.storyImportance},
            ${lead.filmingLocation},
            ${lead.faithContext},
            ${lead.extraNotes},
            ${lead.status},
            ${lead.submittedAt}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }
    })();
  }

  await globalState[persistentLeadSeedKey];
}

export async function listLeads() {
  if (hasPersistentDatabase()) {
    try {
      await ensurePersistentLeadsSeeded();
      const sql = getDatabaseClient();
      const rows = await sql<PersistentLeadRow[]>`
        SELECT
          id,
          full_name,
          email,
          phone,
          region,
          estimated_budget,
          film_for,
          relationship,
          still_living,
          timeline,
          story_importance,
          filming_location,
          faith_context,
          extra_notes,
          status,
          submitted_at
        FROM leads
        ORDER BY submitted_at DESC
      `;

      return rows.map(mapPersistentLead);
    } catch {
      return [];
    }
  }

  if (canUseLegacyMutableFallback()) {
    return listLegacyLeads();
  }

  return [];
}

export async function createLead(input: LeadSubmissionInput) {
  const normalizedInput = normalizeLeadInput(input);
  validateLeadInput(normalizedInput);

  const lead: LeadRecord = {
    id: randomUUID(),
    status: "new",
    submittedAt: new Date().toISOString(),
    ...normalizedInput,
  };

  if (hasPersistentDatabase()) {
    await ensurePersistentLeadsSeeded();
    const sql = getDatabaseClient();
    await sql`
      INSERT INTO leads (
        id,
        full_name,
        email,
        phone,
        region,
        estimated_budget,
        film_for,
        relationship,
        still_living,
        timeline,
        story_importance,
        filming_location,
        faith_context,
        extra_notes,
        status,
        submitted_at
      )
      VALUES (
        ${lead.id},
        ${lead.fullName},
        ${lead.email},
        ${lead.phone},
        ${lead.region},
        ${lead.estimatedBudget},
        ${lead.filmFor},
        ${lead.relationship},
        ${lead.stillLiving},
        ${lead.timeline},
        ${lead.storyImportance},
        ${lead.filmingLocation},
        ${lead.faithContext},
        ${lead.extraNotes},
        ${lead.status},
        ${lead.submittedAt}
      )
    `;

    return lead;
  }

  if (!canUseLegacyMutableFallback()) {
    throw new Error("Persistent lead storage is not configured.");
  }

  const leads = await listLegacyLeads();
  await writeJsonFile(LEADS_FILE, [lead, ...leads]);

  return lead;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  if (hasPersistentDatabase()) {
    await ensurePersistentLeadsSeeded();
    const sql = getDatabaseClient();
    const rows = await sql<PersistentLeadRow[]>`
      UPDATE leads
      SET status = ${status}
      WHERE id = ${leadId}
      RETURNING
        id,
        full_name,
        email,
        phone,
        region,
        estimated_budget,
        film_for,
        relationship,
        still_living,
        timeline,
        story_importance,
        filming_location,
        faith_context,
        extra_notes,
        status,
        submitted_at
    `;

    return rows[0] ? mapPersistentLead(rows[0]) : null;
  }

  if (!canUseLegacyMutableFallback()) {
    return null;
  }

  const leads = await listLeads();
  const leadIndex = leads.findIndex((lead) => lead.id === leadId);

  if (leadIndex === -1) {
    return null;
  }

  leads[leadIndex] = {
    ...leads[leadIndex],
    status,
  };

  await writeJsonFile(LEADS_FILE, leads);
  return leads[leadIndex];
}

export async function deleteLead(leadId: string) {
  if (hasPersistentDatabase()) {
    await ensurePersistentLeadsSeeded();
    const sql = getDatabaseClient();
    const rows = await sql<PersistentLeadRow[]>`
      DELETE FROM leads
      WHERE id = ${leadId}
      RETURNING
        id,
        full_name,
        email,
        phone,
        region,
        estimated_budget,
        film_for,
        relationship,
        still_living,
        timeline,
        story_importance,
        filming_location,
        faith_context,
        extra_notes,
        status,
        submitted_at
    `;

    return rows[0] ? mapPersistentLead(rows[0]) : null;
  }

  if (!canUseLegacyMutableFallback()) {
    return null;
  }

  const leads = await listLeads();
  const leadIndex = leads.findIndex((lead) => lead.id === leadId);

  if (leadIndex === -1) {
    return null;
  }

  const [removedLead] = leads.splice(leadIndex, 1);
  await writeJsonFile(LEADS_FILE, leads);

  return removedLead;
}
