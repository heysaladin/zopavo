"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ChevronRight, Plus, AlertTriangle, CheckCircle, Paperclip, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_PATHS } from "@/lib/stage-gates";
import { ContentShell } from "@/components/webapp/ContentShell";
import { NavBreadcrumb } from "@/components/webapp/NavBreadcrumb";
import { PageHeader } from "@/components/webapp/PageHeader";
import { SectionHeader } from "@/components/webapp/SectionHeader";
import { EmptyState } from "@/components/webapp/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

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
      <ContentShell maxWidth="lg">
        <div className="space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </ContentShell>
    );
  }

  if (!deliverable) {
    return (
      <ContentShell maxWidth="lg">
        <p className="text-sm text-muted-foreground">Deliverable not found.</p>
      </ContentShell>
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
    <ContentShell maxWidth="lg" className="space-y-8">
      {/* Breadcrumb */}
      <NavBreadcrumb items={[
        { label: "Projects", href: "/projects" },
        { label: deliverable.project.name, href: `/projects/${deliverable.project.id}` },
        { label: deliverable.name },
      ]} />

      {/* Header */}
      <PageHeader
        title={deliverable.name}
        description={`${deliverable.project.client.name} · ${deliverable.project.name}`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {deliverable.type.replace("_", " ")}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {deliverable.subUnit}
            </span>
          </div>
        }
      />

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
          <Button
            onClick={handleAdvance}
            disabled={advancing}
            className="w-full py-3 rounded-xl"
          >
            {advancing
              ? "Checking gates…"
              : `Advance to ${stagePath[currentStageIdx + 1] ?? "Done"}`}
          </Button>
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
          <SectionHeader title="Submit for Approval" />
          <p className="text-xs text-muted-foreground">
            When design is ready, create an approval record to move to the Approval stage.
          </p>
          <Button
            onClick={handleSubmitForApproval}
            disabled={submittingApproval || !!pendingApproval}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {submittingApproval
              ? "Creating…"
              : pendingApproval
              ? "Approval pending"
              : "Submit for Approval"}
          </Button>
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
          <SectionHeader
            title="Client Approval"
            actions={
              revisionsExceeded ? (
                <span className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Revision limit reached ({changesRequestedCount}/{agreedRevisionRounds})
                </span>
              ) : undefined
            }
          />

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
                <Label className="text-xs mb-1 block">Signed off by</Label>
                <Input
                  type="text"
                  value={signedOffBy}
                  onChange={(e) => setSignedOffBy(e.target.value)}
                  placeholder="Client name…"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprovalDecision(pendingApproval.id, "APPROVED")}
                  disabled={!!approvingId}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  size="sm"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    const fb = prompt("Feedback for client:");
                    if (fb !== null) {
                      setFeedback(fb);
                      handleApprovalDecision(pendingApproval.id, "CHANGES_REQUESTED");
                    }
                  }}
                  disabled={!!approvingId}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  size="sm"
                >
                  Request Changes
                </Button>
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
              <Button
                onClick={handleSubmitForApproval}
                disabled={submittingApproval}
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Submit New Approval Round
              </Button>
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
          <SectionHeader title="Development Progress" />
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
          <Button
            onClick={handleSaveProgress}
            disabled={savingProgress}
            size="sm"
          >
            {savingProgress ? "Saving…" : "Save Progress"}
          </Button>
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
          <SectionHeader title="Quality Control" />

          {/* Issues list */}
          <div className="space-y-2">
            {deliverable.issues.length === 0 ? (
              <EmptyState title="No issues logged." />
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
                        <Button
                          onClick={() => handleIssueStatus(issue.id, "RESOLVED")}
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                        >
                          Resolve
                        </Button>
                        <Button
                          onClick={() => handleIssueStatus(issue.id, "ACCEPTED")}
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 text-xs text-muted-foreground"
                        >
                          Accept
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add issue */}
          <form onSubmit={handleAddIssue} className="flex items-center gap-2">
            <Input
              type="text"
              value={newIssueTitle}
              onChange={(e) => setNewIssueTitle(e.target.value)}
              placeholder="Issue title…"
              className="flex-1"
            />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <Checkbox
                checked={newIssueBlocking}
                onCheckedChange={(checked) => setNewIssueBlocking(!!checked)}
              />
              Blocking
            </label>
            <Button
              type="submit"
              disabled={!newIssueTitle || addingIssue}
              size="sm"
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          {/* Retreat to dev */}
          {blockingOpenIssues.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {blockingOpenIssues.length} blocking issue{blockingOpenIssues.length !== 1 ? "s" : ""} — cannot advance
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={retreatReason}
                  onChange={(e) => setRetreatReason(e.target.value)}
                  placeholder="Reason for returning to development…"
                  className="flex-1"
                />
                <Button
                  onClick={handleRetreat}
                  disabled={!retreatReason || retreating}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {retreating ? "…" : "Back to Dev"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HANDOVER */}
      {deliverable.stage === "HANDOVER" && (
        <div className="surface rounded-xl p-5 space-y-4">
          <SectionHeader title="Handover Checklist" />

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={handoverForm.filesTransferred}
                onCheckedChange={(checked) =>
                  setHandoverForm({ ...handoverForm, filesTransferred: !!checked })
                }
              />
              <span className="text-sm">Files transferred to client</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={handoverForm.checklistPassed}
                onCheckedChange={(checked) =>
                  setHandoverForm({ ...handoverForm, checklistPassed: !!checked })
                }
              />
              <span className="text-sm">Handover checklist passed</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={handoverForm.credentialsPassed}
                onCheckedChange={(checked) =>
                  setHandoverForm({ ...handoverForm, credentialsPassed: !!checked })
                }
              />
              <span className="text-sm">Credentials passed to client</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Acceptance signed by</Label>
              <Input
                type="text"
                value={handoverForm.acceptanceSignedBy}
                onChange={(e) =>
                  setHandoverForm({ ...handoverForm, acceptanceSignedBy: e.target.value })
                }
                placeholder="Client name…"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Acceptance date</Label>
              <Input
                type="date"
                value={handoverForm.acceptanceSignedAt}
                onChange={(e) =>
                  setHandoverForm({ ...handoverForm, acceptanceSignedAt: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Warranty until (optional)</Label>
            <Input
              type="date"
              value={handoverForm.warrantyUntil}
              onChange={(e) =>
                setHandoverForm({ ...handoverForm, warrantyUntil: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleSaveHandover}
            disabled={savingHandover}
            size="sm"
          >
            {savingHandover ? "Saving…" : "Save Handover"}
          </Button>

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
        <SectionHeader
          title="Versioned Assets"
          actions={
            deliverable.assets.length > 0 ? (
              <div className="flex items-center gap-1">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">({deliverable.assets.length})</span>
              </div>
            ) : (
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            )
          }
        />

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
                <Button
                  onClick={() => handleDeleteAsset(asset.id)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground/40 hover:text-rose-500 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddAsset} className="grid grid-cols-[1fr_auto_2fr_auto] gap-2 items-end">
          <div>
            <Label className="text-[10px] mb-1 block">Label</Label>
            <Input
              type="text"
              value={assetForm.label}
              onChange={(e) => setAssetForm({ ...assetForm, label: e.target.value })}
              placeholder="Logo files"
              className="h-8 text-sm px-2"
            />
          </div>
          <div>
            <Label className="text-[10px] mb-1 block">Version</Label>
            <Input
              type="text"
              value={assetForm.version}
              onChange={(e) => setAssetForm({ ...assetForm, version: e.target.value })}
              placeholder="v3"
              className="w-20 h-8 text-sm px-2"
            />
          </div>
          <div>
            <Label className="text-[10px] mb-1 block">URL</Label>
            <Input
              type="url"
              value={assetForm.url}
              onChange={(e) => setAssetForm({ ...assetForm, url: e.target.value })}
              placeholder="https://drive.google.com/…"
              className="h-8 text-sm px-2"
            />
          </div>
          <Button
            type="submit"
            disabled={!assetForm.label || !assetForm.version || !assetForm.url || addingAsset}
            size="sm"
            className="h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </form>
      </div>

      {/* Stage events */}
      {deliverable.stageEvents.length > 0 && (
        <div>
          <SectionHeader title="Stage History" className="mb-3" />
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
    </ContentShell>
  );
}
