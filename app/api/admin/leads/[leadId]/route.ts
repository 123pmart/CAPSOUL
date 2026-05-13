import { NextResponse } from "next/server";

import {
  getCurrentAdminFromSessionToken,
  getSessionTokenFromCookieHeader,
} from "@/lib/admin-auth";
import {
  deleteLead,
  updateLead,
  type LeadBookingStatus,
  type LeadStatus,
} from "@/lib/leads";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ leadId: string }> },
) {
  const session = await getCurrentAdminFromSessionToken(
    getSessionTokenFromCookieHeader(request.headers.get("cookie")),
  );

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { leadId } = await context.params;
  const body = (await request.json()) as {
    status?: LeadStatus;
    scheduledAt?: string | null;
    bookingNotes?: string;
    bookingStatus?: LeadBookingStatus;
  };

  if (body.status !== undefined && !["new", "contacted", "closed"].includes(body.status)) {
    return NextResponse.json({ ok: false, error: "Invalid lead status." }, { status: 400 });
  }

  if (
    body.bookingStatus !== undefined &&
    !["unscheduled", "scheduled", "completed"].includes(body.bookingStatus)
  ) {
    return NextResponse.json({ ok: false, error: "Invalid booking status." }, { status: 400 });
  }

  if (
    body.status === undefined &&
    body.scheduledAt === undefined &&
    body.bookingNotes === undefined &&
    body.bookingStatus === undefined
  ) {
    return NextResponse.json({ ok: false, error: "No lead updates provided." }, { status: 400 });
  }

  let updatedLead;

  try {
    updatedLead = await updateLead(leadId, {
      status: body.status,
      scheduledAt: body.scheduledAt,
      bookingNotes: body.bookingNotes,
      bookingStatus: body.bookingStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update this lead.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  if (!updatedLead) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: updatedLead });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ leadId: string }> },
) {
  const session = await getCurrentAdminFromSessionToken(
    getSessionTokenFromCookieHeader(request.headers.get("cookie")),
  );

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { leadId } = await context.params;
  const removedLead = await deleteLead(leadId);

  if (!removedLead) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: removedLead });
}
