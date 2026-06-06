import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");
  const q = searchParams.get("q");

  const connections = await db.connection.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(channel && channel !== "ALL" ? { channel } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(connections);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const connection = await db.connection.create({
    data: {
      name: body.name,
      company: body.company || null,
      email: body.email || null,
      phone: body.phone || null,
      channel: body.channel || null,
      status: body.status || "PROSPECT",
      notes: body.notes || null,
      tags: body.tags || null,
      lastContact: body.lastContact ? new Date(body.lastContact) : null,
    },
  });

  return NextResponse.json(connection, { status: 201 });
}
