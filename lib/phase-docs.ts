import "server-only";
import fs from "fs";
import path from "path";
import MarkdownIt from "markdown-it";
import type { DocSection } from "@/components/docs/phase-file-browser";

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const BASE = "/Users/saladin/Documents/Claude/Projects/HYPERFANTASY/000-LAB/zopavo";

export function readSection(
  type: "templates" | "artifacts" | "reports" | "legal",
  phase: string
): DocSection | null {
  const dir = path.join(BASE, type, phase);
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((name) => ({
      name,
      html: md.render(fs.readFileSync(path.join(dir, name), "utf-8")),
    }));
  if (!files.length) return null;
  return { label: type, files };
}

export function readPhaseDocs(phase: string): DocSection[] {
  return (["templates", "artifacts", "reports", "legal"] as const)
    .map((type) => readSection(type, phase))
    .filter((s): s is DocSection => s !== null);
}
