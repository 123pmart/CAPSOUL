import { NextResponse } from "next/server";

import {
  getCurrentAdminFromSessionToken,
  getSessionTokenFromCookieHeader,
} from "@/lib/admin-auth";
import { deleteLead, updateLeadStatus, type LeadStatus } from "@/lib/leads";

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
  const body = (await request.json()) as { status?: LeadStatus };

  if (!body.status || !["new", "contacted", "closed"].includes(body.status)) {
    return NextResponse.json({ ok: false, error: "Invalid lead status." }, { status: 400 });
  }

  const updatedLead = await updateLeadStatus(leadId, body.status);

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
