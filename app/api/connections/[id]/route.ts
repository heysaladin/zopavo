import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const connection = await db.connection.findUnique({ where: { id } });
  if (!connection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(connection);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const connection = await db.connection.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.company !== undefined && { company: body.company || null }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.channel !== undefined && { channel: body.channel || null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.tags !== undefined && { tags: body.tags || null }),
      ...(body.lastContact !== undefined && {
        lastContact: body.lastContact ? new Date(body.lastContact) : null,
      }),
    },
  });

  return NextResponse.json(connection);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.connection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
