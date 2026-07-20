import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const clients = await db.client.findMany({
    include: { contacts: true, _count: { select: { enquiries: true, projects: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const body = await req.json();
  const client = await db.client.create({
    data: { name: body.name, company: body.company, timezone: body.timezone },
  });
  return NextResponse.json(client, { status: 201 });
}
