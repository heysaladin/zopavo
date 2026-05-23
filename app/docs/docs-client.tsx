"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  Folder,
  FolderOpen,
  Package,
  BarChart2,
  Scale,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FileNode = {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
};

function prettifyName(name: string): string {
  return name
    .replace(/\.md$/, "")
    .replace(/^\d{2}-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  templates: FileText,
  artifacts: Package,
  reports: BarChart2,
  legal: Scale,
};

const SECTION_COLORS: Record<string, string> = {
  templates: "text-blue-500",
  artifacts: "text-purple-500",
  reports: "text-orange-500",
  legal: "text-rose-500",
};

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const topSection = node.path.split("/")[0];
  const [open, setOpen] = useState(depth < 2);

  if (node.type === "dir") {
    const Icon = depth === 0 ? (SECTION_ICONS[node.name] ?? Folder) : open ? FolderOpen : Folder;
    const colorClass = depth === 0 ? (SECTION_COLORS[node.name] ?? "text-muted-foreground") : "text-muted-foreground";

    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <ChevronRight
            className={cn("w-3 h-3 shrink-0 transition-transform duration-150", open && "rotate-90")}
          />
          <Icon className={cn("w-4 h-4 shrink-0", colorClass)} />
          <span className="font-medium truncate">{prettifyName(node.name)}</span>
          <span className="ml-auto text-xs text-muted-foreground/50 shrink-0">
            {node.children?.filter((c) => c.type === "file").length ?? 0}
          </span>
        </button>
        {open && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;
  const color = SECTION_COLORS[topSection] ?? "text-muted-foreground";

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={cn(
        "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="w-3 shrink-0" />
      <FileText className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-foreground" : color)} />
      <span className="truncate">{prettifyName(node.name)}</span>
    </button>
  );
}

export function DocsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPath = searchParams.get("path");

  const [tree, setTree] = useState<FileNode[]>([]);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => {
        setTree(data);
        setTreeLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedPath) {
      setContent(null);
      return;
    }
    setLoading(true);
    fetch(`/api/docs/file?path=${encodeURIComponent(selectedPath)}`)
      .then((r) => r.text())
      .then((html) => {
        setContent(html);
        setLoading(false);
      })
      .catch(() => {
        setContent("<p>Could not load file.</p>");
        setLoading(false);
      });
  }, [selectedPath]);

  const handleSelect = useCallback(
    (path: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("path", path);
      router.push(`/docs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const selectedName = selectedPath ? prettifyName(selectedPath.split("/").pop() ?? "") : null;
  const selectedSection = selectedPath ? selectedPath.split("/")[0] : null;
  const sectionColor = selectedSection ? SECTION_COLORS[selectedSection] : "";

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar tree */}
      <aside
        className={cn(
          "shrink-0 border-r border-border flex flex-col h-full overflow-hidden transition-all duration-200",
          sidebarCollapsed ? "w-10" : "w-64"
        )}
      >
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center py-3 gap-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="Expand"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="px-4 py-4 border-b border-border shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Documents</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Templates · Artifacts · Reports · Legal</p>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0"
                title="Collapse"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {treeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                tree.map((node) => (
                  <TreeNode
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedPath={selectedPath}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* Preview panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedPath ? (
          <>
            <div className="px-8 py-4 border-b border-border shrink-0 flex items-center gap-3">
              {selectedSection && (
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                    selectedSection === "templates" && "text-blue-500 border-blue-500/30 bg-blue-500/10",
                    selectedSection === "artifacts" && "text-purple-500 border-purple-500/30 bg-purple-500/10",
                    selectedSection === "reports" && "text-orange-500 border-orange-500/30 bg-orange-500/10",
                    selectedSection === "legal" && "text-rose-500 border-rose-500/30 bg-rose-500/10"
                  )}
                >
                  {selectedSection}
                </span>
              )}
              <h1 className="text-sm font-semibold text-foreground">{selectedName}</h1>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{selectedPath}</span>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div
                  className="docs-prose max-w-3xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: content ?? "" }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <FileText className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Select a document to preview</p>
          </div>
        )}
      </main>
    </div>
  );
}
