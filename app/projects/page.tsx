"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FolderKanban, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectStatus = "ACTIVE" | "DONE";

type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  client: { id: string; name: string; company: string | null };
  _count: { deliverables: number };
};

const TABS: { label: string; value: ProjectStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Done", value: "DONE" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ProjectStatus | "ALL">("ALL");

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = tab === "ALL" ? projects : projects.filter((p) => p.status === tab);
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-emerald-500" />
          Projects
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {activeCount} active project{activeCount !== 1 ? "s" : ""} in production
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const count =
            t.value === "ALL"
              ? projects.length
              : projects.filter((p) => p.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                tab === t.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="surface rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <FolderKanban className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Projects are created from won deals
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-4 surface surface-hover rounded-lg px-4 py-3 group"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold",
                  project.status === "DONE"
                    ? "bg-muted text-muted-foreground"
                    : "bg-emerald-500/10 text-emerald-600"
                )}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{project.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {project.client.name}
                  {project.client.company && ` · ${project.client.company}`}
                  {" · "}
                  {project._count.deliverables} deliverable{project._count.deliverables !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground hidden md:block shrink-0">
                {format(new Date(project.createdAt), "MMM d, yyyy")}
              </p>
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                  project.status === "DONE"
                    ? "bg-muted text-muted-foreground"
                    : "bg-emerald-500/10 text-emerald-500"
                )}
              >
                {project.status}
              </span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
