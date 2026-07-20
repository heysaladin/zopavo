import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { advance, rollupStatus } from "@/lib/stage-gates";
import type { DeliverableStage } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const actor = body.actor || "system";

  const d = await db.deliverable.findUnique({
    where: { id: params.id },
    include: {
      approvals: true,
      issues: true,
      handover: true,
      project: { include: { deliverables: true } },
    },
  });
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = advance(d);
  if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason }, { status: 422 });

  const fromStage = d.stage;
  const updated = await db.deliverable.update({
    where: { id: params.id },
    data: { stage: result.to as DeliverableStage },
  });

  await db.stageEvent.create({
    data: {
      deliverableId: params.id,
      projectId: d.projectId,
      fromStage,
      toStage: result.to,
      actor,
    },
  });

  // Recompute project rollup
  const project = await db.project.findUnique({
    where: { id: d.projectId },
    include: { deliverables: true },
  });
  if (project) {
    const computedStatus = rollupStatus(project);
    if (project.status !== computedStatus) {
      await db.project.update({ where: { id: d.projectId }, data: { status: computedStatus } });
    }
  }

  return NextResponse.json({ ok: true, stage: result.to, deliverable: updated });
}
