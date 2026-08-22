import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isValidStatus } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  const item = await db.backlogItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
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

  const existing = await db.backlogItem.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    data.title = body.title.trim();
  }

  if (body.notes !== undefined) {
    data.notes = typeof body.notes === "string" ? body.notes : null;
  }

  if (body.status !== undefined) {
    if (!isValidStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === "DONE" && !existing.doneAt) {
      data.doneAt = new Date();
    } else if (body.status !== "DONE") {
      data.doneAt = null;
    }
  }

  const updated = await db.backlogItem.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  const existing = await db.backlogItem.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.backlogItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
