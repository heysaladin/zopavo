import { NextRequest, NextResponse } from "next/server";
import { BacklogStatus } from "@prisma/client";

export function requireAuth(req: NextRequest): NextResponse | null {
  const auth = req.cookies.get("zopavo_auth");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export const VALID_STATUSES = Object.values(BacklogStatus);

export function isValidStatus(s: unknown): s is BacklogStatus {
  return typeof s === "string" && VALID_STATUSES.includes(s as BacklogStatus);
}
