import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  const note = await db.note.findUnique({ where: { id: params.id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await db.note.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.content !== undefined) data.content = String(body.content);
  if (body.x !== undefined && typeof body.x === "number") data.x = body.x;
  if (body.y !== undefined && typeof body.y === "number") data.y = body.y;
  if (body.color !== undefined && typeof body.color === "string") data.color = body.color;
  if (body.workingOnBy !== undefined) data.workingOnBy = body.workingOnBy ?? null;
  if (body.done !== undefined && typeof body.done === "boolean") data.done = body.done;

  const updated = await db.note.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  const existing = await db.note.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.note.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
