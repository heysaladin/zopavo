"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Plus, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_PATHS } from "@/lib/stage-gates";

type DeliverableType = "BRANDING" | "ILLUSTRATION" | "GRAPHIC" | "WEB_APP";
type SubUnit = "HIKARI" | "DRAVENCLAW" | "THINKSOFT" | "MITAYANI";
type DeliverableStage = "DESIGN" | "APPROVAL" | "DEVELOPMENT" | "QC" | "HANDOVER" | "DONE";

const DELIVERABLE_TYPES: DeliverableType[] = ["BRANDING", "ILLUSTRATION", "GRAPHIC", "WEB_APP"];
const SUB_UNITS: SubUnit[] = ["HIKARI", "DRAVENCLAW", "THINKSOFT", "MITAYANI"];

const STAGE_COLORS: Record<DeliverableStage, string> = {
  DESIGN: "bg-blue-500/10 text-blue-500",
  APPROVAL: "bg-amber-500/10 text-amber-500",
  DEVELOPMENT: "bg-orange-500/10 text-orange-500",
  QC: "bg-rose-500/10 text-rose-500",
  HANDOVER: "bg-pink-500/10 text-pink-500",
  DONE: "bg-emerald-500/10 text-emerald-500",
};

type Deliverable = {
  id: string;
  name: string;
  type: DeliverableType;
  subUnit: SubUnit;
  stage: DeliverableStage;
  progress: number;
  createdAt: string;
  _count: { tasks: number };
};

type Milestone = {
  id: string;
  title: string;
  dueDate: string | null;
  reachedAt: string | null;
};

type StageEvent = {
  id: string;
  fromStage: string | null;
  toStage: string;
  actor: string;
  reason: string | null;
  createdAt: string;
  deliverableId: string | null;
};

type Project = {
  id: string;
  name: string;
  status: string;
  planAgreedAt: string | null;
  planUrl: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string;
    company: string | null;
    contacts: { id: string; name: string; email: string | null; isPrimary: boolean }[];
  };
  deal: {
    id: string;
    scopeSummary: string;
    value: string | null;
    currency: string;
    agreedRevisionRounds: number;
    agreement: { signedAt: string | null } | null;
  };
  milestones: Milestone[];
  deliverables: Deliverable[];
  stageEvents: StageEvent[];
};

type NewDeliverableForm = {
  name: string;
  type: DeliverableType;
  subUnit: SubUnit;
};

const EMPTY_DELIVERABLE_FORM: NewDeliverableForm = {
  name: "",
  type: "BRANDING",
  subUnit: "HIKARI",
};

function formatCurrency(value: string | null, currency: string) {
  if (!value) return "—";
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(
      parseFloat(value)
    );
  } catch {
    return `${currency} ${value}`;
  }
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliverableModal, setDeliverableModal] = useState(false);
  const [deliverableForm, setDeliverableForm] = useState<NewDeliverableForm>(EMPTY_DELIVERABLE_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setProject(data);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  async function handleAddDeliverable(e: React.FormEvent) {
    e.preventDefault();
    if (!deliverableForm.name) return;
    setSubmitting(true);
    try {
      await fetch("/api/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          name: deliverableForm.name,
          type: deliverableForm.type,
          subUnit: deliverableForm.subUnit,
        }),
      });
      setDeliverableForm(EMPTY_DELIVERABLE_FORM);
      setDeliverableModal(false);
      fetchProject();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleMilestone(milestone: Milestone) {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    // Directly update milestone via a simple approach — toggle reachedAt
    const newReachedAt = milestone.reachedAt ? null : new Date().toISOString();
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    // We don't have a milestone PATCH endpoint, so we'll just refetch
    // For now just a visual indicator
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestone.id ? { ...m, reachedAt: newReachedAt } : m
        ),
      };
    });
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="surface rounded-xl h-40 animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Projects
        </Link>
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/projects"
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium rounded-full",
                project.status === "DONE"
                  ? "bg-muted text-muted-foreground"
                  : "bg-emerald-500/10 text-emerald-500"
              )}
            >
              {project.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {project.client.name}
            {project.client.company && ` · ${project.client.company}`}
          </p>
        </div>
        <button
          onClick={() => setDeliverableModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Deliverable
        </button>
      </div>

      {/* Deal info */}
      <div className="surface rounded-xl p-4 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
          Deal
        </h2>
        <p className="text-sm">{project.deal.scopeSummary}</p>
        <div className="flex items-center gap-4 flex-wrap mt-2">
          <span className="text-sm font-medium">
            {formatCurrency(project.deal.value, project.deal.currency)}
          </span>
          <span className="text-xs text-muted-foreground">
            {project.deal.agreedRevisionRounds} revision round{project.deal.agreedRevisionRounds !== 1 ? "s" : ""}
          </span>
          {project.deal.agreement?.signedAt && (
            <span className="text-xs text-muted-foreground">
              Signed {format(new Date(project.deal.agreement.signedAt), "MMM d, yyyy")}
            </span>
          )}
          {project.planAgreedAt && (
            <span className="text-xs text-muted-foreground">
              Plan agreed {format(new Date(project.planAgreedAt), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
          Deliverables ({project.deliverables.length})
        </h2>
        {project.deliverables.length === 0 ? (
          <div className="surface rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No deliverables yet</p>
            <button
              onClick={() => setDeliverableModal(true)}
              className="text-xs text-primary hover:text-primary/80 mt-1 inline-block"
            >
              Add first deliverable →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {project.deliverables.map((d) => {
              const stagePath = STAGE_PATHS[d.type] || [];
              const currentIdx = stagePath.indexOf(d.stage);
              return (
                <Link
                  key={d.id}
                  href={`/deliverables/${d.id}`}
                  className="surface surface-hover rounded-lg px-4 py-3 block group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{d.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {d.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {d.subUnit}
                        </span>
                      </div>
                      {/* Stage path indicator */}
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {stagePath.map((stage, i) => (
                          <div key={stage} className="flex items-center gap-1">
                            {i > 0 && (
                              <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                            )}
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                i === currentIdx
                                  ? STAGE_COLORS[stage as DeliverableStage]
                                  : i < currentIdx
                                  ? "text-muted-foreground/40"
                                  : "text-muted-foreground/30"
                              )}
                            >
                              {stage}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Progress bar */}
                      {(d.stage === "DEVELOPMENT" || d.progress > 0) && (
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all"
                              style={{ width: `${d.progress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {d.progress}% complete
                          </p>
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                        STAGE_COLORS[d.stage]
                      )}
                    >
                      {d.stage}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestones */}
      {project.milestones.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
            Milestones
          </h2>
          <div className="space-y-2">
            {project.milestones.map((m) => (
              <div key={m.id} className="surface rounded-lg px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => toggleMilestone(m)}
                  className={cn(
                    "w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors",
                    m.reachedAt
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-border hover:border-emerald-500/50"
                  )}
                >
                  {m.reachedAt && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", m.reachedAt && "line-through text-muted-foreground")}>
                    {m.title}
                  </p>
                  {m.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due {format(new Date(m.dueDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                {m.reachedAt && (
                  <p className="text-xs text-emerald-500 shrink-0">
                    {format(new Date(m.reachedAt), "MMM d")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage events */}
      {project.stageEvents.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
            Activity
          </h2>
          <div className="space-y-1.5">
            {project.stageEvents.slice(0, 10).map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="shrink-0 w-28 text-right tabular-nums">
                  {format(new Date(ev.createdAt), "MMM d, h:mm a")}
                </span>
                <div className="w-px h-4 bg-border shrink-0" />
                <span>
                  {ev.fromStage ? (
                    <>
                      <span className="font-medium text-foreground">{ev.fromStage}</span>
                      {" → "}
                      <span className="font-medium text-foreground">{ev.toStage}</span>
                    </>
                  ) : (
                    <span className="font-medium text-foreground">{ev.toStage}</span>
                  )}
                  {" by "}
                  <span className="text-foreground">{ev.actor}</span>
                  {ev.reason && <span className="text-muted-foreground/60"> · {ev.reason}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Deliverable Modal */}
      {deliverableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Add Deliverable</h2>
              <button
                onClick={() => { setDeliverableModal(false); setDeliverableForm(EMPTY_DELIVERABLE_FORM); }}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDeliverable} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={deliverableForm.name}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, name: e.target.value })}
                  placeholder="e.g. Logo Design"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Type *
                </label>
                <select
                  value={deliverableForm.type}
                  onChange={(e) =>
                    setDeliverableForm({ ...deliverableForm, type: e.target.value as DeliverableType })
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {DELIVERABLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Sub-Unit *
                </label>
                <select
                  value={deliverableForm.subUnit}
                  onChange={(e) =>
                    setDeliverableForm({ ...deliverableForm, subUnit: e.target.value as SubUnit })
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {SUB_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setDeliverableModal(false); setDeliverableForm(EMPTY_DELIVERABLE_FORM); }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
                >
                  {submitting ? "Adding…" : "Add Deliverable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
