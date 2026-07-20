import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const assets = await db.asset.findMany({
    where: { deliverableId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assets);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  // When adding a new asset, demote previous "latest" for same label
  if (body.isLatest !== false) {
    await db.asset.updateMany({
      where: { deliverableId: params.id, label: body.label, isLatest: true },
      data: { isLatest: false },
    });
  }

  const asset = await db.asset.create({
    data: {
      deliverableId: params.id,
      label: body.label,
      version: body.version,
      url: body.url,
      isLatest: body.isLatest !== false,
    },
  });
  return NextResponse.json(asset, { status: 201 });
}
