"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Plus, X, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

type DealOutcome = "OPEN" | "WON" | "LOST";
type LostReason = "PRICE" | "TIMELINE" | "SCOPE" | "COMPETITOR" | "GHOSTED" | "OTHER";

const LOST_REASONS: LostReason[] = [
  "PRICE",
  "TIMELINE",
  "SCOPE",
  "COMPETITOR",
  "GHOSTED",
  "OTHER",
];

type Deal = {
  id: string;
  scopeSummary: string;
  value: string | null;
  currency: string;
  outcome: DealOutcome;
  lostReason: LostReason | null;
  agreedRevisionRounds: number;
  expectedCloseDate: string | null;
  createdAt: string;
  closedAt: string | null;
  client: { id: string; name: string; company: string | null };
  enquiry: { id: string; contactName: string };
  agreement: { id: string; signedAt: string | null } | null;
  project: { id: string } | null;
};

type QualifiedEnquiry = {
  id: string;
  contactName: string;
  contactEmail: string | null;
};

const OUTCOME_COLORS: Record<DealOutcome, string> = {
  OPEN: "bg-cyan-500/10 text-cyan-500",
  WON: "bg-emerald-500/10 text-emerald-500",
  LOST: "bg-rose-500/10 text-rose-500",
};

const TABS: { label: string; value: DealOutcome | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Won", value: "WON" },
  { label: "Lost", value: "LOST" },
];

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

type NewDealForm = {
  enquiryId: string;
  clientId: string;
  scopeSummary: string;
  value: string;
  currency: string;
  expectedCloseDate: string;
  agreedRevisionRounds: string;
};

const EMPTY_FORM: NewDealForm = {
  enquiryId: "",
  clientId: "",
  scopeSummary: "",
  value: "",
  currency: "IDR",
  expectedCloseDate: "",
  agreedRevisionRounds: "2",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DealOutcome | "ALL">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewDealForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [qualifiedEnquiries, setQualifiedEnquiries] = useState<QualifiedEnquiry[]>([]);
  const [lostModal, setLostModal] = useState<{ id: string } | null>(null);
  const [lostReason, setLostReason] = useState<LostReason>("OTHER");
  const [projectModal, setProjectModal] = useState<{ dealId: string; clientId: string } | null>(
    null
  );
  const [projectName, setProjectName] = useState("");

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch("/api/deals");
      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  useEffect(() => {
    if (modalOpen) {
      fetch("/api/enquiries?status=QUALIFIED")
        .then((r) => r.json())
        .then((data: QualifiedEnquiry[]) => setQualifiedEnquiries(Array.isArray(data) ? data : []))
        .catch(() => setQualifiedEnquiries([]));
    }
  }, [modalOpen]);

  const filtered = tab === "ALL" ? deals : deals.filter((d) => d.outcome === tab);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.enquiryId || !form.clientId || !form.scopeSummary) return;
    setSubmitting(true);
    try {
      await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: form.enquiryId,
          clientId: form.clientId,
          scopeSummary: form.scopeSummary,
          value: form.value || null,
          currency: form.currency,
          expectedCloseDate: form.expectedCloseDate || null,
          agreedRevisionRounds: parseInt(form.agreedRevisionRounds) || 2,
        }),
      });
      setForm(EMPTY_FORM);
      setModalOpen(false);
      fetchDeals();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWon(id: string) {
    await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: "WON", closedAt: new Date().toISOString() }),
    });
    fetchDeals();
  }

  async function handleLost(id: string) {
    await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outcome: "LOST",
        lostReason,
        closedAt: new Date().toISOString(),
      }),
    });
    setLostModal(null);
    fetchDeals();
  }

  async function handleCreateProject() {
    if (!projectModal || !projectName) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dealId: projectModal.dealId,
        clientId: projectModal.clientId,
        name: projectName,
      }),
    });
    setProjectModal(null);
    setProjectName("");
    fetchDeals();
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-cyan-500" />
            Deals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Proposals, quotes and contracts
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const count =
            t.value === "ALL"
              ? deals.length
              : deals.filter((d) => d.outcome === t.value).length;
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
            <div key={i} className="surface rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <FileSignature className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No deals here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((deal) => (
            <div key={deal.id} className="surface rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{deal.client.name}</p>
                    {deal.client.company && (
                      <span className="text-xs text-muted-foreground">{deal.client.company}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {deal.scopeSummary}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs font-medium">
                      {formatCurrency(deal.value, deal.currency)}
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">
                      {format(new Date(deal.createdAt), "MMM d, yyyy")}
                    </span>
                    {deal.expectedCloseDate && (
                      <span className="text-[11px] text-muted-foreground/60">
                        Due {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground/60">
                      {deal.agreedRevisionRounds} revision{deal.agreedRevisionRounds !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                    OUTCOME_COLORS[deal.outcome]
                  )}
                >
                  {deal.outcome}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {deal.outcome === "OPEN" && (
                  <>
                    <button
                      onClick={() => handleWon(deal.id)}
                      className="px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                    >
                      Mark Won
                    </button>
                    <button
                      onClick={() => setLostModal({ id: deal.id })}
                      className="px-2.5 py-1 text-xs rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      Mark Lost
                    </button>
                  </>
                )}
                {deal.outcome === "WON" && !deal.project && (
                  <button
                    onClick={() =>
                      setProjectModal({ dealId: deal.id, clientId: deal.client.id })
                    }
                    className="px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                  >
                    Create Project
                  </button>
                )}
                {deal.outcome === "WON" && deal.project && (
                  <span className="text-[11px] text-muted-foreground/60">Project created</span>
                )}
                {deal.outcome === "LOST" && deal.lostReason && (
                  <span className="text-[11px] text-muted-foreground/60">
                    Lost: {deal.lostReason}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Deal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold">New Deal</h2>
              <button
                onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Enquiry (Qualified) *
                </label>
                <select
                  required
                  value={form.enquiryId}
                  onChange={(e) => setForm({ ...form, enquiryId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="">Select enquiry…</option>
                  {qualifiedEnquiries.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.contactName}{eq.contactEmail ? ` (${eq.contactEmail})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Client ID *
                </label>
                <input
                  type="text"
                  required
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  placeholder="Client cuid…"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Scope Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.scopeSummary}
                  onChange={(e) => setForm({ ...form, scopeSummary: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Expected Close
                  </label>
                  <input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Revision Rounds
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.agreedRevisionRounds}
                    onChange={(e) =>
                      setForm({ ...form, agreedRevisionRounds: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
                >
                  {submitting ? "Creating…" : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {lostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Mark as Lost</h2>
              <button
                onClick={() => setLostModal(null)}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Lost Reason
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value as LostReason)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {LOST_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setLostModal(null)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLost(lostModal.id)}
                  className="px-4 py-2 text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors"
                >
                  Confirm Lost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {projectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Create Project</h2>
              <button
                onClick={() => { setProjectModal(null); setProjectName(""); }}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Brand Identity for Acme"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setProjectModal(null); setProjectName(""); }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectName}
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
