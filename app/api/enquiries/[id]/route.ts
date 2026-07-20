import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const enquiry = await db.enquiry.findUnique({
    where: { id: params.id },
    include: { client: true, deal: { include: { agreement: true } } },
  });
  if (!enquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(enquiry);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.closedReason !== undefined) data.closedReason = body.closedReason;
  if (body.firstRepliedAt !== undefined)
    data.firstRepliedAt = body.firstRepliedAt ? new Date(body.firstRepliedAt) : null;
  if (body.qualifiedAt !== undefined)
    data.qualifiedAt = body.qualifiedAt ? new Date(body.qualifiedAt) : null;
  const enquiry = await db.enquiry.update({ where: { id: params.id }, data });
  return NextResponse.json(enquiry);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.enquiry.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
