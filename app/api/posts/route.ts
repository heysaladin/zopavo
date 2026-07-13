import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");

  const posts = await db.post.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(platform && platform !== "ALL" ? { platform } : {}),
    },
    orderBy: [
      { scheduledAt: "asc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const post = await db.post.create({
    data: {
      title: body.title,
      platform: body.platform || "INSTAGRAM",
      caption: body.caption,
      hashtags: body.hashtags || null,
      mediaPath: body.mediaPath || null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      status: body.status || "DRAFT",
      notes: body.notes || null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
