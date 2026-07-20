import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { EnquiryStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const enquiries = await db.enquiry.findMany({
    where: status ? { status: status as EnquiryStatus } : undefined,
    include: { client: true, deal: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(enquiries);
}

export async function POST(req: Request) {
  const body = await req.json();
  const enquiry = await db.enquiry.create({
    data: {
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      needSummary: body.needSummary,
      source: body.source,
      clientId: body.clientId || null,
    },
  });
  return NextResponse.json(enquiry, { status: 201 });
}
