import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { DeliverableStage, IssueStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const projectId = searchParams.get("projectId");
  const deliverables = await db.deliverable.findMany({
    where: {
      ...(stage ? { stage: stage as DeliverableStage } : {}),
      ...(projectId ? { projectId } : {}),
    },
    include: {
      project: { include: { client: true } },
      approvals: true,
      issues: { where: { blocking: true, status: "OPEN" as IssueStatus } },
      handover: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deliverables);
}

export async function POST(req: Request) {
  const body = await req.json();
  const deliverable = await db.deliverable.create({
    data: {
      projectId: body.projectId,
      name: body.name,
      type: body.type,
      subUnit: body.subUnit,
    },
  });
  return NextResponse.json(deliverable, { status: 201 });
}
