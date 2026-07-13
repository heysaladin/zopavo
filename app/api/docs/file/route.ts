import "server-only";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import fs from "fs";
import path from "path";
import MarkdownIt from "markdown-it";
import { DOCS_BASE } from "@/lib/phase-docs";

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  if (!filePath) return NextResponse.json({ error: "No path provided" }, { status: 400 });

  const fullPath = path.resolve(DOCS_BASE, filePath);
  if (!fullPath.startsWith(path.resolve(DOCS_BASE))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  try {
    const raw = fs.readFileSync(fullPath, "utf-8");
    const html = md.render(raw);
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
