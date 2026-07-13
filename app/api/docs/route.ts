import { NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";
import path from "path";
import { DOCS_BASE } from "@/lib/phase-docs";

export type FileNode = {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
};

function buildTree(dirPath: string, relativePath: string = ""): FileNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = buildTree(fullPath, relPath);
      if (children.length > 0) {
        nodes.push({ name: entry.name, path: relPath, type: "dir", children });
      }
    } else if (entry.name.endsWith(".md")) {
      nodes.push({ name: entry.name, path: relPath, type: "file" });
    }
  }

  return nodes;
}

export async function GET() {
  try {
    const tree = buildTree(DOCS_BASE);
    return NextResponse.json(tree);
  } catch {
    return NextResponse.json({ error: "Failed to read docs" }, { status: 500 });
  }
}
