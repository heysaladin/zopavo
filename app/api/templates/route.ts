import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const templates = await db.template.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(templates);
}
