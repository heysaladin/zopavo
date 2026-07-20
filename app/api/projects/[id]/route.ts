import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rollupStatus } from "@/lib/stage-gates";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      client: { include: { contacts: true } },
      deal: { include: { agreement: true } },
      milestones: { orderBy: { dueDate: "asc" } },
      deliverables: {
        include: {
          approvals: true,
          issues: true,
          handover: true,
          assets: { orderBy: { createdAt: "desc" } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      stageEvents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.planAgreedAt !== undefined)
    data.planAgreedAt = body.planAgreedAt ? new Date(body.planAgreedAt) : null;
  if (body.planUrl !== undefined) data.planUrl = body.planUrl;
  const project = await db.project.update({
    where: { id: params.id },
    data,
    include: { deliverables: true },
  });
  const computedStatus = rollupStatus(project);
  if (project.status !== computedStatus) {
    await db.project.update({ where: { id: params.id }, data: { status: computedStatus } });
  }
  return NextResponse.json({ ...project, status: computedStatus });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.project.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
