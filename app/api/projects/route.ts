import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ProjectStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const projects = await db.project.findMany({
    where: status ? { status: status as ProjectStatus } : undefined,
    include: {
      client: true,
      deal: true,
      deliverables: { select: { id: true, stage: true, name: true, type: true, subUnit: true } },
      _count: { select: { deliverables: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const project = await db.project.create({
    data: {
      dealId: body.dealId,
      clientId: body.clientId,
      name: body.name,
      planAgreedAt: body.planAgreedAt ? new Date(body.planAgreedAt) : null,
      planUrl: body.planUrl,
    },
    include: { client: true, deliverables: true },
  });
  return NextResponse.json(project, { status: 201 });
}
