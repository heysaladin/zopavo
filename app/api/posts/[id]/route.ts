import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const post = await db.post.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.platform !== undefined ? { platform: body.platform } : {}),
      ...(body.caption !== undefined ? { caption: body.caption } : {}),
      ...(body.hashtags !== undefined ? { hashtags: body.hashtags } : {}),
      ...(body.mediaPath !== undefined ? { mediaPath: body.mediaPath } : {}),
      ...(body.scheduledAt !== undefined ? { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.post.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
