import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.decision !== undefined) data.decision = body.decision;
  if (body.signedOffBy !== undefined) data.signedOffBy = body.signedOffBy;
  if (body.signedOffAt !== undefined)
    data.signedOffAt = body.signedOffAt ? new Date(body.signedOffAt) : null;
  if (body.feedback !== undefined) data.feedback = body.feedback;
  const approval = await db.approval.update({ where: { id: params.id }, data });
  return NextResponse.json(approval);
}
