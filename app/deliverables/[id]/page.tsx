"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight, Plus, AlertTriangle, CheckCircle, Paperclip, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_PATHS } from "@/lib/stage-gates";

type DeliverableType = "BRANDING" | "ILLUSTRATION" | "GRAPHIC" | "WEB_APP";
type SubUnit = "HIKARI" | "DRAVENCLAW" | "THINKSOFT" | "MITAYANI";
type DeliverableStage = "DESIGN" | "APPROVAL" | "DEVELOPMENT" | "QC" | "HANDOVER" | "DONE";
type ApprovalDecision = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ACCEPTED";

const STAGE_COLORS: Record<DeliverableStage, string> = {
  DESIGN: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  APPROVAL: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  DEVELOPMENT: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  QC: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  HANDOVER: "bg-pink-500/10 text-pink-500 border-pink-500/30",
  DONE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

const STAGE_BG: Record<DeliverableStage, string> = {
  DESIGN: "bg-blue-500/10 text-blue-500",
  APPROVAL: "bg-amber-500/10 text-amber-500",
  DEVELOPMENT: "bg-orange-500/10 text-orange-500",
  QC: "bg-rose-500/10 text-rose-500",
  HANDOVER: "bg-pink-500/10 text-pink-500",
  DONE: "bg-emerald-500/10 text-emerald-500",
};

type Approval = {
  id: string;
  revisionRound: number;
  version: string;
  decision: ApprovalDecision;
  signedOffBy: string | null;
  signedOffAt: string | null;
  feedback: string | null;
  createdAt: string;
};

type Issue = {
  id: string;
  title: string;
  blocking: boolean;
  status: IssueStatus;
  createdAt: string;
  resolvedAt: string | null;
};

type Handover = {
  id: string;
  checklistPassed: boolean;
  filesTransferred: boolean;
  credentialsPassed: boolean;
  acceptanceSignedBy: string | null;
  acceptanceSignedAt: string | null;
  warrantyUntil: string | null;
};

type Asset = {
  id: string;
  label: string;
  version: string;
  url: string;
  isLatest: boolean;
  createdAt: string;
};

type Deliverable = {
  id: string;
  name: string;
  type: DeliverableType;
  subUnit: SubUnit;
  stage: DeliverableStage;
  progress: number;
  createdAt: string;
  project: {
    id: string;
    name: string;
    client: { name: string };
    deal: { agreedRevisionRounds: number };
  };
  approvals: Approval[];
  issues: Issue[];
  assets: Asset[];
  handover: Handover | null;
  stageEvents: {
    id: string;
    fromStage: string | null;
    toStage: string;
    actor: string;
    reason: string | null;
    createdAt: string;
  }[];
};

const ISSUE_STATUS_COLORS: Record<IssueStatus, string> = {
  OPEN: "bg-rose-500/10 text-rose-500",
  IN_PROGRESS: "bg-orange-500/10 text-orange-500",
  RESOLVED: "bg-emerald-500/10 text-emerald-500",
  ACCEPTED: "bg-muted text-muted-foreground",
};

export default function DeliverableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState<string | null>(null);

  // DESIGN stage
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // APPROVAL stage
  const [signedOffBy, setSignedOffBy] = useState("");
  const [feedback, setFeedback] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // DEVELOPMENT stage
  const [progressValue, setProgressValue] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);

  // QC stage
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueBlocking, setNewIssueBlocking] = useState(true);
  const [addingIssue, setAddingIssue] = useState(false);
  const [retreatReason, setRetreatReason] = useState("");
  const [retreating, setRetreating] = useState(false);

  // Assets
  const [assetForm, setAssetForm] = useState({ label: "", version: "", url: "" });
  const [addingAsset, setAddingAsset] = useState(false);

  // HANDOVER stage
  const [handoverForm, setHandoverForm] = useState({
    checklistPassed: false,
    filesTransferred: false,
    credentialsPassed: false,
    acceptanceSignedBy: "",
    acceptanceSignedAt: "",
    warrantyUntil: "",
  });
  const [savingHandover, setSavingHandover] = useState(false);

  const fetchDeliverable = useCallback(async () => {
    try {
      const res = await fetch(`/api/deliverables/${id}`);
      const data = await res.json();
      setDeliverable(data);
      setProgressValue(data.progress ?? 0);
      if (data.handover) {
        setHandoverForm({
          checklistPassed: data.handover.checklistPassed ?? false,
          filesTransferred: data.handover.filesTransferred ?? false,
          credentialsPassed: data.handover.credentialsPassed ?? false,
          acceptanceSignedBy: data.handover.acceptanceSignedBy ?? "",
          acceptanceSignedAt: data.handover.acceptanceSignedAt
            ? format(new Date(data.handover.acceptanceSignedAt), "yyyy-MM-dd")
            : "",
          warrantyUntil: data.handover.warrantyUntil
            ? format(new Date(data.handover.warrantyUntil), "yyyy-MM-dd")
            : "",
        });
      }
    } catch {
      setDeliverable(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeliverable();
  }, [fetchDeliverable]);

  async function handleAdvance() {
    setAdvancing(true);
    setAdvanceError(null);
    try {
      const res = await fetch(`/api/deliverables/${id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: "studio" }),
      });
      const data = await res.json();
      if (!data.ok) {
        setAdvanceError(data.reason ?? "Cannot advance stage");
      } else {
        fetchDeliverable();
      }
    } catch {
      setAdvanceError("Network error");
    } finally {
      setAdvancing(false);
    }
  }

  async function handleSubmitForApproval() {
    setSubmittingApproval(true);
    try {
      await fetch(`/api/deliverables/${id}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      fetchDeliverable();
    } finally {
      setSubmittingApproval(false);
    }
  }

  async function handleApprovalDecision(
    approvalId: string,
    decision: "APPROVED" | "CHANGES_REQUESTED"
  ) {
    setApprovingId(approvalId);
    try {
      const patch: Record<string, unknown> = { decision };
      if (decision === "APPROVED") {
        patch.signedOffBy = signedOffBy || "client";
        patch.signedOffAt = new Date().toISOString();
      } else {
        patch.feedback = feedback;
      }
      await fetch(`/api/approvals/${approvalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setSignedOffBy("");
      setFeedback("");
      fetchDeliverable();
    } finally {
      setApprovingId(null);
    }
  }

  async function handleSaveProgress() {
    setSavingProgress(true);
    try {
      await fetch(`/api/deliverables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: progressValue }),
      });
      fetchDeliverable();
    } finally {
      setSavingProgress(false);
    }
  }

  async function handleAddIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!newIssueTitle) return;
    setAddingIssue(true);
    try {
      await fetch(`/api/deliverables/${id}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newIssueTitle, blocking: newIssueBlocking }),
      });
      setNewIssueTitle("");
      setNewIssueBlocking(true);
      fetchDeliverable();
    } finally {
      setAddingIssue(false);
    }
  }

  async function handleIssueStatus(issueId: string, status: IssueStatus) {
    await fetch(`/api/issues/${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchDeliverable();
  }

  async function handleRetreat() {
    if (!retreatReason) return;
    setRetreating(true);
    try {
      await fetch(`/api/deliverables/${id}/retreat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: retreatReason, actor: "studio" }),
      });
      setRetreatReason("");
      fetchDeliverable();
    } finally {
      setRetreating(false);
    }
  }

  async function handleSaveHandover() {
    setSavingHandover(true);
    try {
      await fetch(`/api/deliverables/${id}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistPassed: handoverForm.checklistPassed,
          filesTransferred: handoverForm.filesTransferred,
          credentialsPassed: handoverForm.credentialsPassed,
          acceptanceSignedBy: handoverForm.acceptanceSignedBy || null,
          acceptanceSignedAt: handoverForm.acceptanceSignedAt || null,
          warrantyUntil: handoverForm.warrantyUntil || null,
        }),
      });
      fetchDeliverable();
    } finally {
      setSavingHandover(false);
    }
  }

  async function handleAddAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!assetForm.label || !assetForm.version || !assetForm.url) return;
    setAddingAsset(true);
    try {
      await fetch(`/api/deliverables/${id}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetForm),
      });
      setAssetForm({ label: "", version: "", url: "" });
      fetchDeliverable();
    } finally {
      setAddingAsset(false);
    }
  }

  async function handleDeleteAsset(assetId: string) {
    await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
    fetchDeliverable();
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="surface rounded-xl h-60 animate-pulse" />
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-sm text-muted-foreground">Deliverable not found.</p>
      </div>
    );
  }

  const stagePath = STAGE_PATHS[deliverable.type] || [];
  const currentStageIdx = stagePath.indexOf(deliverable.stage);
  const isDone = deliverable.stage === "DONE";
  const pendingApproval = deliverable.approvals.find((a) => a.decision === "PENDING");
  const blockingOpenIssues = deliverable.issues.filter(
    (i) => i.blocking && i.status === "OPEN"
  );
  const agreedRevisionRounds = deliverable.project.deal.agreedRevisionRounds;
  const changesRequestedCount = deliverable.approvals.filter(
    (a) => a.decision === "CHANGES_REQUESTED"
  ).length;
  const revisionsExceeded = changesRequestedCount >= agreedRevisionRounds;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href={`/projects/${deliverable.project.id}`}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        {deliverable.project.name}
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight">{deliverable.name}</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {deliverable.type.replace("_", " ")}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {deliverable.subUnit}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {deliverable.project.client.name} · {deliverable.project.name}
        </p>
      </div>

      {/* Stage progression */}
      <div className="surface rounded-xl p-4">
        <div className="flex items-center gap-1 flex-wrap">
          {stagePath.map((stage, i) => (
            <div key={stage} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />}
              <span
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors",
                  i === currentStageIdx
                    ? STAGE_COLORS[stage as DeliverableStage]
                    : i < currentStageIdx
                    ? "text-muted-foreground/40 border-transparent"
                    : "text-muted-foreground/30 border-transparent"
                )}
              >
                {stage}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {(deliverable.stage === "DEVELOPMENT" || deliverable.progress > 0) && (
          <div className="mt-3">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${deliverable.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{deliverable.progress}% complete</p>
          </div>
        )}
      </div>

      {/* Advance button */}
      {!isDone && (
        <div>
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className={cn(
              "w-full px-6 py-3 rounded-xl text-sm font-semibold transition-all",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "disabled:opacity-50"
            )}
          >
            {advancing
              ? "Checking gates…"
              : `Advance to ${stagePath[currentStageIdx + 1] ?? "Done"}`}
          </button>
          {advanceError && (
            <div className="mt-2 flex items-center gap-2 text-sm text-rose-500 surface rounded-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {advanceError}
            </div>
          )}
        </div>
      )}

      {isDone && (
        <div className="flex items-center gap-2 surface rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-500">Deliverable complete</p>
        </div>
      )}

      {/* Stage-specific panels */}

      {/* DESIGN */}
      {deliverable.stage === "DESIGN" && (
        <div className="surface rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Submit for Approval</h2>
          <p className="text-xs text-muted-foreground">
            When design is ready, create an approval record to move to the Approval stage.
          </p>
          <button
            onClick={handleSubmitForApproval}
            disabled={submittingApproval || !!pendingApproval}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {submittingApproval
              ? "Creating…"
              : pendingApproval
              ? "Approval pending"
              : "Submit for Approval"}
          </button>
          {deliverable.approvals.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Previous rounds:</p>
              {deliverable.approvals.map((a) => (
                <div key={a.id} className="text-xs surface rounded-lg px-3 py-2 flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">{a.version}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      a.decision === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : a.decision === "CHANGES_REQUESTED"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-blue-500/10 text-blue-500"
                    )}
                  >
                    {a.decision}
                  </span>
                  {a.feedback && (
                    <span className="text-muted-foreground truncate flex-1">{a.feedback}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPROVAL */}
      {deliverable.stage === "APPROVAL" && (
        <div className="surface rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Client Approval</h2>
            {revisionsExceeded && (
              <span className="text-xs text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Revision limit reached ({changesRequestedCount}/{agreedRevisionRounds})
              </span>
            )}
          </div>

          {pendingApproval ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{pendingApproval.version}</span>
                <span>Round {pendingApproval.revisionRound}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                  PENDING
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Signed off by
                </label>
                <input
                  type="text"
                  value={signedOffBy}
                  onChange={(e) => setSignedOffBy(e.target.value)}
                  placeholder="Client name…"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprovalDecision(pendingApproval.id, "APPROVED")}
                  disabled={!!approvingId}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const fb = prompt("Feedback for client:");
                    if (fb !== null) {
                      setFeedback(fb);
                      handleApprovalDecision(pendingApproval.id, "CHANGES_REQUESTED");
                    }
                  }}
                  disabled={!!approvingId}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  Request Changes
                </button>
              </div>

              {!revisionsExceeded && (
                <p className="text-xs text-muted-foreground">
                  After changes requested, a new approval round can be submitted from DESIGN stage.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                No pending approval. Submit from Design stage to create one.
              </p>
              <button
                onClick={handleSubmitForApproval}
                disabled={submittingApproval}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Submit New Approval Round
              </button>
            </div>
          )}

          {deliverable.approvals.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground">All rounds:</p>
              {deliverable.approvals.map((a) => (
                <div key={a.id} className="text-xs surface rounded-lg px-3 py-2 flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">{a.version}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      a.decision === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : a.decision === "CHANGES_REQUESTED"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-blue-500/10 text-blue-500"
                    )}
                  >
                    {a.decision}
                  </span>
                  {a.signedOffBy && (
                    <span className="text-muted-foreground">by {a.signedOffBy}</span>
                  )}
                  {a.feedback && (
                    <span className="text-muted-foreground/70 truncate flex-1 italic">
                      {a.feedback}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DEVELOPMENT */}
      {deliverable.stage === "DEVELOPMENT" && (
        <div className="surface rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Development Progress</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold tabular-nums">{progressValue}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressValue}
              onChange={(e) => setProgressValue(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleSaveProgress}
            disabled={savingProgress}
            className="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {savingProgress ? "Saving…" : "Save Progress"}
          </button>
          {progressValue < 100 && (
            <p className="text-xs text-muted-foreground">
              Progress must reach 100% to advance to QC.
            </p>
          )}
        </div>
      )}

      {/* QC */}
      {deliverable.stage === "QC" && (
        <div className="surface rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Quality Control</h2>

          {/* Issues list */}
          <div className="space-y-2">
            {deliverable.issues.length === 0 ? (
              <p className="text-xs text-muted-foreground">No issues logged.</p>
            ) : (
              deliverable.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center gap-3 surface rounded-lg px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {issue.blocking && (
                        <span className="text-[10px] text-rose-500 font-medium">BLOCKING</span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          ISSUE_STATUS_COLORS[issue.status]
                        )}
                      >
                        {issue.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {issue.status === "OPEN" && (
                      <>
                        <button
                          onClick={() => handleIssueStatus(issue.id, "RESOLVED")}
                          className="px-2 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleIssueStatus(issue.id, "ACCEPTED")}
                          className="px-2 py-1 text-xs rounded-md hover:bg-accent text-muted-foreground transition-colors"
                        >
                          Accept
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add issue */}
          <form onSubmit={handleAddIssue} className="flex items-center gap-2">
            <input
              type="text"
              value={newIssueTitle}
              onChange={(e) => setNewIssueTitle(e.target.value)}
              placeholder="Issue title…"
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <input
                type="checkbox"
                checked={newIssueBlocking}
                onChange={(e) => setNewIssueBlocking(e.target.checked)}
                className="rounded"
              />
              Blocking
            </label>
            <button
              type="submit"
              disabled={!newIssueTitle || addingIssue}
              className="px-3 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Retreat to dev */}
          {blockingOpenIssues.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {blockingOpenIssues.length} blocking issue{blockingOpenIssues.length !== 1 ? "s" : ""} — cannot advance
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={retreatReason}
                  onChange={(e) => setRetreatReason(e.target.value)}
                  placeholder="Reason for returning to development…"
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={handleRetreat}
                  disabled={!retreatReason || retreating}
                  className="px-3 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {retreating ? "…" : "Back to Dev"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HANDOVER */}
      {deliverable.stage === "HANDOVER" && (
        <div className="surface rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Handover Checklist</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={handoverForm.filesTransferred}
                onChange={(e) =>
                  setHandoverForm({ ...handoverForm, filesTransferred: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">Files transferred to client</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={handoverForm.checklistPassed}
                onChange={(e) =>
                  setHandoverForm({ ...handoverForm, checklistPassed: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">Handover checklist passed</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={handoverForm.credentialsPassed}
                onChange={(e) =>
                  setHandoverForm({ ...handoverForm, credentialsPassed: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">Credentials passed to client</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Acceptance signed by
              </label>
              <input
                type="text"
                value={handoverForm.acceptanceSignedBy}
                onChange={(e) =>
                  setHandoverForm({ ...handoverForm, acceptanceSignedBy: e.target.value })
                }
                placeholder="Client name…"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Acceptance date
              </label>
              <input
                type="date"
                value={handoverForm.acceptanceSignedAt}
                onChange={(e) =>
                  setHandoverForm({ ...handoverForm, acceptanceSignedAt: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Warranty until (optional)
            </label>
            <input
              type="date"
              value={handoverForm.warrantyUntil}
              onChange={(e) =>
                setHandoverForm({ ...handoverForm, warrantyUntil: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <button
            onClick={handleSaveHandover}
            disabled={savingHandover}
            className="px-4 py-2 text-sm font-medium bg-pink-500 hover:bg-pink-600 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {savingHandover ? "Saving…" : "Save Handover"}
          </button>

          {!(
            handoverForm.checklistPassed &&
            handoverForm.filesTransferred &&
            handoverForm.acceptanceSignedAt
          ) && (
            <p className="text-xs text-muted-foreground">
              All checklist items and acceptance date required to advance to Done.
            </p>
          )}
        </div>
      )}

      {/* Assets */}
      <div className="surface rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Versioned Assets</h2>
          {deliverable.assets.length > 0 && (
            <span className="text-xs text-muted-foreground">({deliverable.assets.length})</span>
          )}
        </div>

        {deliverable.assets.length > 0 && (
          <div className="space-y-1.5">
            {deliverable.assets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">{asset.version}</span>
                <span className="flex-1 truncate">{asset.label}</span>
                {asset.isLatest && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium shrink-0">
                    LATEST
                  </span>
                )}
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="text-muted-foreground/40 hover:text-rose-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddAsset} className="grid grid-cols-[1fr_auto_2fr_auto] gap-2 items-end">
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">Label</label>
            <input
              type="text"
              value={assetForm.label}
              onChange={(e) => setAssetForm({ ...assetForm, label: e.target.value })}
              placeholder="Logo files"
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">Version</label>
            <input
              type="text"
              value={assetForm.version}
              onChange={(e) => setAssetForm({ ...assetForm, version: e.target.value })}
              placeholder="v3"
              className="w-20 px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">URL</label>
            <input
              type="url"
              value={assetForm.url}
              onChange={(e) => setAssetForm({ ...assetForm, url: e.target.value })}
              placeholder="https://drive.google.com/…"
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={!assetForm.label || !assetForm.version || !assetForm.url || addingAsset}
            className="px-3 py-1.5 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>
      </div>

      {/* Stage events */}
      {deliverable.stageEvents.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
            Stage History
          </h2>
          <div className="space-y-1.5">
            {deliverable.stageEvents.map((ev) => (
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
                  {ev.reason && (
                    <span className="text-muted-foreground/60"> · {ev.reason}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
