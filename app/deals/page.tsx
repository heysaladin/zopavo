"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Plus, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/webapp/PageHeader";
import { ContentShell } from "@/components/webapp/ContentShell";
import { EmptyState } from "@/components/webapp/EmptyState";

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
    <ContentShell maxWidth="xl" className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Deals"
        description="Proposals, quotes and contracts"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Deal
          </Button>
        }
      />

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
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FileSignature />} title="No deals here" />
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
                    <Button variant="outline" size="sm" onClick={() => handleWon(deal.id)}>
                      Mark Won
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-600"
                      onClick={() => setLostModal({ id: deal.id })}
                    >
                      Mark Lost
                    </Button>
                  </>
                )}
                {deal.outcome === "WON" && !deal.project && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectModal({ dealId: deal.id, clientId: deal.client.id })}
                  >
                    Create Project
                  </Button>
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
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Enquiry (Qualified) *</Label>
              <Select
                required
                value={form.enquiryId}
                onValueChange={(value) => setForm({ ...form, enquiryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select enquiry…" />
                </SelectTrigger>
                <SelectContent>
                  {qualifiedEnquiries.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.contactName}{eq.contactEmail ? ` (${eq.contactEmail})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Client ID *</Label>
              <Input
                type="text"
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                placeholder="Client cuid…"
              />
            </div>
            <div className="space-y-2">
              <Label>Scope Summary *</Label>
              <Textarea
                required
                rows={3}
                value={form.scopeSummary}
                onChange={(e) => setForm({ ...form, scopeSummary: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(value) => setForm({ ...form, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Expected Close</Label>
                <Input
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Revision Rounds</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={form.agreedRevisionRounds}
                  onChange={(e) => setForm({ ...form, agreedRevisionRounds: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lost Reason Modal */}
      <Dialog open={!!lostModal} onOpenChange={(open) => { if (!open) setLostModal(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Mark as Lost</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Lost Reason</Label>
              <Select
                value={lostReason}
                onValueChange={(value) => setLostReason(value as LostReason)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOST_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLostModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleLost(lostModal!.id)}>Confirm Lost</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Modal */}
      <Dialog open={!!projectModal} onOpenChange={(open) => { if (!open) { setProjectModal(null); setProjectName(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Brand Identity for Acme"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setProjectModal(null); setProjectName(""); }}>Cancel</Button>
            <Button onClick={handleCreateProject} disabled={!projectName}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentShell>
  );
}
