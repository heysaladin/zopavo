import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.status === "RESOLVED") data.resolvedAt = new Date();
  const issue = await db.issue.update({ where: { id: params.id }, data });
  return NextResponse.json(issue);
}
