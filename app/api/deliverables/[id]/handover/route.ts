import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const handover = await db.handover.upsert({
    where: { deliverableId: params.id },
    create: {
      deliverableId: params.id,
      checklistPassed: body.checklistPassed ?? false,
      filesTransferred: body.filesTransferred ?? false,
      credentialsPassed: body.credentialsPassed ?? false,
      acceptanceSignedBy: body.acceptanceSignedBy,
      acceptanceSignedAt: body.acceptanceSignedAt ? new Date(body.acceptanceSignedAt) : null,
      warrantyUntil: body.warrantyUntil ? new Date(body.warrantyUntil) : null,
    },
    update: {
      checklistPassed: body.checklistPassed ?? false,
      filesTransferred: body.filesTransferred ?? false,
      credentialsPassed: body.credentialsPassed ?? false,
      acceptanceSignedBy: body.acceptanceSignedBy,
      acceptanceSignedAt: body.acceptanceSignedAt ? new Date(body.acceptanceSignedAt) : null,
      warrantyUntil: body.warrantyUntil ? new Date(body.warrantyUntil) : null,
    },
  });
  return NextResponse.json(handover);
}
