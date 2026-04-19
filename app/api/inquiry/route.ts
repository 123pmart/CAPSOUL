import { NextResponse } from "next/server";

import { createLead, type LeadSubmissionInput } from "@/lib/leads";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<LeadSubmissionInput>;

    const lead = await createLead({
      fullName: body.fullName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      region: body.region ?? "",
      filmFor: body.filmFor ?? "",
      relationship: body.relationship ?? "",
      stillLiving: body.stillLiving ?? "",
      timeline: body.timeline ?? "",
      storyImportance: body.storyImportance ?? "",
      filmingLocation: body.filmingLocation ?? "",
      faithContext: body.faithContext ?? "",
      extraNotes: body.extraNotes ?? "",
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save inquiry.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
