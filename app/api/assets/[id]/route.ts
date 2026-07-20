import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: { isLatest?: boolean; label?: string; url?: string } = {};
  if (body.isLatest !== undefined) data.isLatest = body.isLatest;
  if (body.label !== undefined) data.label = body.label;
  if (body.url !== undefined) data.url = body.url;
  const asset = await db.asset.update({ where: { id: params.id }, data });
  return NextResponse.json(asset);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.asset.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
