import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await db.template.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(templates);
}
