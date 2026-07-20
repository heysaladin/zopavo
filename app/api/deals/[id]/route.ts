import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const deal = await db.deal.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      enquiry: true,
      agreement: true,
      project: { include: { deliverables: true } },
    },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.outcome !== undefined) data.outcome = body.outcome;
  if (body.lostReason !== undefined) data.lostReason = body.lostReason;
  if (body.value !== undefined) data.value = body.value ? parseFloat(body.value) : null;
  if (body.scopeSummary !== undefined) data.scopeSummary = body.scopeSummary;
  if (body.expectedCloseDate !== undefined)
    data.expectedCloseDate = body.expectedCloseDate ? new Date(body.expectedCloseDate) : null;
  if (body.closedAt !== undefined)
    data.closedAt = body.closedAt ? new Date(body.closedAt) : null;
  if (body.agreedRevisionRounds !== undefined)
    data.agreedRevisionRounds = parseInt(body.agreedRevisionRounds);
  const deal = await db.deal.update({
    where: { id: params.id },
    data,
    include: { client: true, enquiry: true, agreement: true },
  });
  return NextResponse.json(deal);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.deal.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
