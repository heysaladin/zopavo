import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { DeliverableStage } from "@prisma/client";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const d = await db.deliverable.findUnique({
    where: { id: params.id },
    include: {
      project: { include: { client: true, deal: true } },
      tasks: { orderBy: { id: "asc" } },
      approvals: { orderBy: { revisionRound: "asc" } },
      issues: { orderBy: { createdAt: "desc" } },
      assets: { orderBy: { createdAt: "desc" } },
      handover: true,
      stageEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(d);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.progress !== undefined) data.progress = parseInt(body.progress);
  if (body.name !== undefined) data.name = body.name;
  if (body.stage !== undefined) data.stage = body.stage as DeliverableStage;
  const deliverable = await db.deliverable.update({ where: { id: params.id }, data });
  return NextResponse.json(deliverable);
}
