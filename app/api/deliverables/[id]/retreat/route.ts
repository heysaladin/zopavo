import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (!body.reason)
    return NextResponse.json({ error: "reason required for backward move" }, { status: 400 });

  const d = await db.deliverable.findUnique({ where: { id: params.id } });
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (d.stage !== "QC")
    return NextResponse.json({ error: "Can only retreat from QC" }, { status: 422 });

  const updated = await db.deliverable.update({
    where: { id: params.id },
    data: { stage: "DEVELOPMENT" },
  });

  await db.stageEvent.create({
    data: {
      deliverableId: params.id,
      projectId: d.projectId,
      fromStage: "QC",
      toStage: "DEVELOPMENT",
      reason: body.reason,
      actor: body.actor || "system",
    },
  });

  return NextResponse.json({ ok: true, deliverable: updated });
}
