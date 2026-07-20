import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const agreement = await db.agreement.upsert({
    where: { dealId: params.id },
    create: {
      dealId: params.id,
      kind: body.kind,
      documentUrl: body.documentUrl,
      signedAt: body.signedAt ? new Date(body.signedAt) : null,
    },
    update: {
      kind: body.kind,
      documentUrl: body.documentUrl,
      signedAt: body.signedAt ? new Date(body.signedAt) : null,
    },
  });
  return NextResponse.json(agreement);
}
