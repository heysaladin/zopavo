import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// GET /api/backlog?boardId=xxx&done=true|false
export async function GET(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  const boardId = req.nextUrl.searchParams.get("boardId");
  const doneParam = req.nextUrl.searchParams.get("done");

  const where: Record<string, unknown> = {};
  if (boardId) where.boardId = boardId;
  if (doneParam !== null) where.done = doneParam === "true";

  const notes = await db.note.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(notes);
}

// POST /api/backlog
export async function POST(req: NextRequest) {
  const unauth = requireAuth(req);
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { content, boardId, x, y, color, workingOnBy } = body as Record<string, unknown>;

  if (!boardId || typeof boardId !== "string") {
    return NextResponse.json({ error: "boardId required" }, { status: 400 });
  }

  const board = await db.board.findUnique({ where: { id: boardId } });
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });

  const note = await db.note.create({
    data: {
      content: typeof content === "string" ? content : "",
      boardId,
      x: typeof x === "number" ? x : 0,
      y: typeof y === "number" ? y : 0,
      color: typeof color === "string" ? color : "yellow",
      workingOnBy: typeof workingOnBy === "string" ? workingOnBy : null,
    },
  });
  return NextResponse.json(note, { status: 201 });
}
