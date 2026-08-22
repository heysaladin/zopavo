import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isValidStatus } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  const status = req.nextUrl.searchParams.get("status");

  if (status !== null && !isValidStatus(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const items = await db.backlogItem.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, notes, status } = body as Record<string, unknown>;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  if (status !== undefined && !isValidStatus(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const item = await db.backlogItem.create({
    data: {
      title: title.trim(),
      notes: typeof notes === "string" ? notes : null,
      status: isValidStatus(status) ? status : "BACKLOG",
    },
  });
  return NextResponse.json(item, { status: 201 });
}
