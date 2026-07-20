import type {
  Enquiry,
  Deal,
  Agreement,
  Project,
  Deliverable,
  Approval,
  Issue,
  Handover,
} from "@prisma/client";

export const STAGE_PATHS: Record<string, string[]> = {
  BRANDING: ["DESIGN", "APPROVAL", "HANDOVER", "DONE"],
  ILLUSTRATION: ["DESIGN", "APPROVAL", "HANDOVER", "DONE"],
  GRAPHIC: ["DESIGN", "APPROVAL", "HANDOVER", "DONE"],
  WEB_APP: ["DESIGN", "APPROVAL", "DEVELOPMENT", "QC", "HANDOVER", "DONE"],
};

export function nextStage(type: string, current: string): string | null {
  const path = STAGE_PATHS[type];
  if (!path) return null;
  const i = path.indexOf(current);
  return i === -1 || i === path.length - 1 ? null : path[i + 1];
}

export const canQualifyEnquiry = (e: Enquiry) =>
  e.status === "NEW" || e.status === "REPLIED";

export const canWinDeal = (d: Deal & { agreement: Agreement | null }) =>
  !!d.agreement?.signedAt || d.value != null;

type FullDeliverable = Deliverable & {
  approvals: Approval[];
  issues: Issue[];
  handover: Handover | null;
};

export const canEnterApproval = (d: FullDeliverable) =>
  d.approvals.some((a) => a.decision === "PENDING");

export const canLeaveApproval = (d: FullDeliverable) =>
  d.approvals.some((a) => a.decision === "APPROVED" && !!a.signedOffAt);

export const canEnterQC = (d: FullDeliverable) => d.progress >= 100;

export const canLeaveQC = (d: FullDeliverable) =>
  d.issues.every(
    (i) => !i.blocking || i.status === "RESOLVED" || i.status === "ACCEPTED",
  );

export const mustReturnToDev = (d: FullDeliverable) =>
  d.stage === "QC" && d.issues.some((i) => i.blocking && i.status === "OPEN");

export const canCloseHandover = (d: FullDeliverable) =>
  !!d.handover?.acceptanceSignedAt &&
  d.handover.filesTransferred &&
  d.handover.checklistPassed;

export const revisionsExceeded = (d: FullDeliverable, agreedRounds: number) =>
  d.approvals.filter((a) => a.decision === "CHANGES_REQUESTED").length >=
  agreedRounds;

export function rollupStatus(
  project: Project & { deliverables: Deliverable[] },
): "ACTIVE" | "DONE" {
  const ds = project.deliverables;
  if (ds.length > 0 && ds.every((d) => d.stage === "DONE")) return "DONE";
  return "ACTIVE";
}

const BLOCKED_REASONS: Record<string, (d: FullDeliverable) => string> = {
  DESIGN: () => "Submit design for approval first — create a pending approval record to leave Design.",
  APPROVAL: (d) => {
    const hasApproved = d.approvals.some((a) => a.decision === "APPROVED");
    if (!hasApproved) return "Client approval required — mark an approval as APPROVED with a sign-off name and date.";
    return "Sign-off date missing — set signedOffAt on the approved approval record.";
  },
  DEVELOPMENT: (d) => `Build must reach 100% before entering QC — currently at ${d.progress}%.`,
  QC: (d) => {
    const open = d.issues.filter((i) => i.blocking && i.status === "OPEN");
    return `${open.length} blocking issue${open.length !== 1 ? "s" : ""} still open — resolve or accept all blocking issues before handover.`;
  },
  HANDOVER: (d) => {
    const missing: string[] = [];
    if (!d.handover?.acceptanceSignedAt) missing.push("acceptance date");
    if (!d.handover?.filesTransferred) missing.push("files transferred");
    if (!d.handover?.checklistPassed) missing.push("checklist passed");
    return `Handover incomplete — missing: ${missing.join(", ")}.`;
  },
};

export function advance(
  d: FullDeliverable,
): { ok: true; to: string } | { ok: false; reason: string } {
  const gates: Record<string, (x: FullDeliverable) => boolean> = {
    DESIGN: canEnterApproval,
    APPROVAL: canLeaveApproval,
    DEVELOPMENT: canEnterQC,
    QC: canLeaveQC,
    HANDOVER: canCloseHandover,
  };
  const gate = gates[d.stage];
  if (!gate) return { ok: false, reason: `No gate defined for ${d.stage}` };
  if (!gate(d)) {
    const reason = BLOCKED_REASONS[d.stage]?.(d) ?? `Exit ticket for ${d.stage} not satisfied`;
    return { ok: false, reason };
  }
  const to = nextStage(d.type, d.stage);
  if (!to) return { ok: false, reason: "Already at final stage" };
  return { ok: true, to };
}
