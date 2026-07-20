"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, ArrowUpRight, Inbox, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPELINE_STEPS, stepNum } from "@/lib/pipeline";

type EnquiryStatus = "NEW" | "REPLIED" | "QUALIFIED" | "CLOSED";

type Enquiry = {
  id: string;
  contactName: string;
  contactEmail: string | null;
  source: string;
  status: EnquiryStatus;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
  status: string;
  client: { name: string };
  _count: { deliverables: number };
  createdAt: string;
};

const ENQUIRY_STATUS_COLORS: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-500",
  REPLIED: "bg-amber-500/10 text-amber-500",
  QUALIFIED: "bg-emerald-500/10 text-emerald-500",
  CLOSED: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [posts, enquiries, deals, projects, approvalD, developmentD, qcD, handoverD] =
          await Promise.all([
            fetch("/api/posts").then((r) => r.json()).catch(() => []),
            fetch("/api/enquiries").then((r) => r.json()).catch(() => []),
            fetch("/api/deals?outcome=OPEN").then((r) => r.json()).catch(() => []),
            fetch("/api/projects?status=ACTIVE").then((r) => r.json()).catch(() => []),
            fetch("/api/deliverables?stage=APPROVAL").then((r) => r.json()).catch(() => []),
            fetch("/api/deliverables?stage=DEVELOPMENT").then((r) => r.json()).catch(() => []),
            fetch("/api/deliverables?stage=QC").then((r) => r.json()).catch(() => []),
            fetch("/api/deliverables?stage=HANDOVER").then((r) => r.json()).catch(() => []),
          ]);

        const postsArr = Array.isArray(posts) ? posts : [];
        const marketingCount = postsArr.filter(
          (p: { status: string }) => p.status === "READY" || p.status === "SCHEDULED"
        ).length;

        setCounts({
          MARKETING: marketingCount,
          ENQUIRY: Array.isArray(enquiries) ? enquiries.length : 0,
          DEAL: Array.isArray(deals) ? deals.length : 0,
          PROJECT: Array.isArray(projects) ? projects.length : 0,
          APPROVAL: Array.isArray(approvalD) ? approvalD.length : 0,
          DEVELOPMENT: Array.isArray(developmentD) ? developmentD.length : 0,
          QC: Array.isArray(qcD) ? qcD.length : 0,
          HANDOVER: Array.isArray(handoverD) ? handoverD.length : 0,
        });

        if (Array.isArray(enquiries)) {
          setRecentEnquiries(enquiries.slice(0, 5));
        }
        if (Array.isArray(projects)) {
          setActiveProjects(projects.slice(0, 5));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Hyperfantasy studio — 8-stage pipeline overview
        </p>
      </div>

      {/* Pipeline funnel */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
          Pipeline
        </p>
        <div className="flex items-stretch gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center shrink-0 md:flex-1 md:min-w-0">
                {i > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mx-0.5" />
                )}
                <Link
                  href={step.href}
                  className="group relative w-28 md:w-full surface surface-hover rounded-lg p-2.5 text-left transition-all block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground/60">
                      {stepNum(step.num)}
                    </span>
                    <Icon className={cn("w-3.5 h-3.5", step.color.text)} />
                  </div>
                  <p className="text-xl font-semibold tabular-nums mt-1 leading-none">
                    {loading ? "–" : (counts[step.id] ?? 0)}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] text-muted-foreground leading-tight truncate">
                      {step.label}
                    </p>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground shrink-0" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent enquiries + Active projects */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent enquiries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-blue-500" />
              Recent Enquiries
            </h2>
            <Link
              href="/enquiries"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="surface rounded-lg h-14 animate-pulse" />
              ))}
            </div>
          ) : recentEnquiries.length === 0 ? (
            <div className="surface rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No enquiries yet</p>
              <Link href="/enquiries" className="text-xs text-primary hover:text-primary/80 mt-1 inline-block">
                Add first enquiry →
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentEnquiries.map((e) => (
                <div key={e.id} className="surface rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.contactName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {e.contactEmail ?? e.source} · {format(new Date(e.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                      ENQUIRY_STATUS_COLORS[e.status]
                    )}
                  >
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-emerald-500" />
              Active Projects
            </h2>
            <Link
              href="/projects"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="surface rounded-lg h-14 animate-pulse" />
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="surface rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No active projects</p>
              <Link href="/projects" className="text-xs text-primary hover:text-primary/80 mt-1 inline-block">
                Create first project →
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="surface surface-hover rounded-lg px-4 py-3 flex items-center gap-3 block"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.client.name} · {p._count.deliverables} deliverable{p._count.deliverables !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                      p.status === "DONE"
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-500/10 text-emerald-500"
                    )}
                  >
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
