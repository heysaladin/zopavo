import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const d = await db.deliverable.findUnique({
    where: { id: params.id },
    select: { approvals: { select: { revisionRound: true } } },
  });
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const round =
    (d.approvals.length > 0 ? Math.max(...d.approvals.map((a) => a.revisionRound)) : 0) + 1;
  const approval = await db.approval.create({
    data: {
      deliverableId: params.id,
      revisionRound: round,
      version: body.version || `v${round}`,
      decision: "PENDING",
    },
  });
  return NextResponse.json(approval, { status: 201 });
}
