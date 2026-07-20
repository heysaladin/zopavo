import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { DealOutcome } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const outcome = searchParams.get("outcome");
  const deals = await db.deal.findMany({
    where: outcome ? { outcome: outcome as DealOutcome } : undefined,
    include: { client: true, enquiry: true, agreement: true, project: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const body = await req.json();
  const deal = await db.deal.create({
    data: {
      enquiryId: body.enquiryId,
      clientId: body.clientId,
      scopeSummary: body.scopeSummary,
      value: body.value ? parseFloat(body.value) : null,
      currency: body.currency || "IDR",
      expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
      agreedRevisionRounds: body.agreedRevisionRounds ?? 2,
    },
    include: { client: true, enquiry: true, agreement: true },
  });
  return NextResponse.json(deal, { status: 201 });
}
