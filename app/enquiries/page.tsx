"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Plus, X, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EnquiryStatus = "NEW" | "REPLIED" | "QUALIFIED" | "CLOSED";
type LeadSource =
  | "REFERRAL"
  | "PORTFOLIO"
  | "INSTAGRAM"
  | "X"
  | "OUTREACH"
  | "WEBSITE_FORM"
  | "REPEAT_CLIENT"
  | "OTHER";

const LEAD_SOURCES: LeadSource[] = [
  "REFERRAL",
  "PORTFOLIO",
  "INSTAGRAM",
  "X",
  "OUTREACH",
  "WEBSITE_FORM",
  "REPEAT_CLIENT",
  "OTHER",
];

type Enquiry = {
  id: string;
  contactName: string;
  contactEmail: string | null;
  needSummary: string;
  source: LeadSource;
  status: EnquiryStatus;
  firstRepliedAt: string | null;
  qualifiedAt: string | null;
  closedReason: string | null;
  createdAt: string;
  client: { id: string; name: string } | null;
  deal: { id: string } | null;
};

const STATUS_COLORS: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-500",
  REPLIED: "bg-amber-500/10 text-amber-500",
  QUALIFIED: "bg-emerald-500/10 text-emerald-500",
  CLOSED: "bg-muted text-muted-foreground",
};

const TABS: { label: string; value: EnquiryStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Replied", value: "REPLIED" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Closed", value: "CLOSED" },
];

type NewEnquiryForm = {
  contactName: string;
  contactEmail: string;
  needSummary: string;
  source: LeadSource;
  clientId: string;
};

const EMPTY_FORM: NewEnquiryForm = {
  contactName: "",
  contactEmail: "",
  needSummary: "",
  source: "OTHER",
  clientId: "",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<EnquiryStatus | "ALL">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewEnquiryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState("");

  const fetchEnquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const filtered = tab === "ALL" ? enquiries : enquiries.filter((e) => e.status === tab);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contactName || !form.needSummary || !form.source) return;
    setSubmitting(true);
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: form.contactName,
          contactEmail: form.contactEmail || null,
          needSummary: form.needSummary,
          source: form.source,
          clientId: form.clientId || null,
        }),
      });
      setForm(EMPTY_FORM);
      setModalOpen(false);
      fetchEnquiries();
    } finally {
      setSubmitting(false);
    }
  }

  async function patch(id: string, data: Record<string, unknown>) {
    await fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchEnquiries();
  }

  async function handleClose(id: string) {
    await patch(id, { status: "CLOSED", closedReason: closeReason || null });
    setClosingId(null);
    setCloseReason("");
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-blue-500" />
            Enquiries
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage incoming leads and first contact
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Enquiry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const count =
            t.value === "ALL"
              ? enquiries.length
              : enquiries.filter((e) => e.status === t.value).length;
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
          <Inbox className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No enquiries here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((enq) => (
            <div key={enq.id} className="surface rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{enq.contactName}</p>
                    {enq.contactEmail && (
                      <span className="text-xs text-muted-foreground">{enq.contactEmail}</span>
                    )}
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground">
                      {enq.source.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {enq.needSummary}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {format(new Date(enq.createdAt), "MMM d, yyyy")}
                    {enq.client && <span> · {enq.client.name}</span>}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                    STATUS_COLORS[enq.status]
                  )}
                >
                  {enq.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {enq.status === "NEW" && (
                  <button
                    onClick={() =>
                      patch(enq.id, {
                        status: "REPLIED",
                        firstRepliedAt: new Date().toISOString(),
                      })
                    }
                    className="px-2.5 py-1 text-xs rounded-md bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                  >
                    Mark Replied
                  </button>
                )}
                {(enq.status === "NEW" || enq.status === "REPLIED") && (
                  <button
                    onClick={() =>
                      patch(enq.id, {
                        status: "QUALIFIED",
                        qualifiedAt: new Date().toISOString(),
                      })
                    }
                    className="px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                  >
                    Qualify
                  </button>
                )}
                {enq.status !== "CLOSED" && (
                  <>
                    {closingId === enq.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={closeReason}
                          onChange={(e) => setCloseReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="text-xs px-2 py-1 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <button
                          onClick={() => handleClose(enq.id)}
                          className="px-2.5 py-1 text-xs rounded-md bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => { setClosingId(null); setCloseReason(""); }}
                          className="px-2.5 py-1 text-xs rounded-md hover:bg-accent text-muted-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setClosingId(enq.id)}
                        className="px-2.5 py-1 text-xs rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </>
                )}
                {enq.deal && (
                  <span className="text-[11px] text-muted-foreground/60 ml-auto">
                    Deal created
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Enquiry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold">New Enquiry</h2>
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
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Need Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.needSummary}
                  onChange={(e) => setForm({ ...form, needSummary: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Lead Source *
                </label>
                <select
                  required
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Client ID (optional)
                </label>
                <input
                  type="text"
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  placeholder="Leave blank to create without client link"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
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
                  {submitting ? "Creating…" : "Create Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
