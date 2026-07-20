import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const issues = await db.issue.findMany({
    where: { deliverableId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(issues);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const issue = await db.issue.create({
    data: {
      deliverableId: params.id,
      title: body.title,
      blocking: body.blocking ?? true,
    },
  });
  return NextResponse.json(issue, { status: 201 });
}
