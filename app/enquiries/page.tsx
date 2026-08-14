"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Plus, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentShell } from "@/components/webapp/ContentShell";
import { PageHeader } from "@/components/webapp/PageHeader";
import { EmptyState } from "@/components/webapp/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <ContentShell maxWidth="xl" className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Enquiries"
        description="Manage incoming leads and first contact"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Enquiry
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
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
                "px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px shrink-0",
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
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Inbox />} title="No enquiries here" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patch(enq.id, {
                        status: "REPLIED",
                        firstRepliedAt: new Date().toISOString(),
                      })
                    }
                  >
                    Mark Replied
                  </Button>
                )}
                {(enq.status === "NEW" || enq.status === "REPLIED") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patch(enq.id, {
                        status: "QUALIFIED",
                        qualifiedAt: new Date().toISOString(),
                      })
                    }
                  >
                    Qualify
                  </Button>
                )}
                {enq.status !== "CLOSED" && (
                  <>
                    {closingId === enq.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={closeReason}
                          onChange={(e) => setCloseReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="text-xs h-7 px-2"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleClose(enq.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setClosingId(null); setCloseReason(""); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setClosingId(enq.id)}
                      >
                        Close
                      </Button>
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
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false);
            setForm(EMPTY_FORM);
          } else {
            setModalOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Enquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label className="text-xs">Contact Name *</Label>
              <Input
                type="text"
                required
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Contact Email</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Need Summary *</Label>
              <Textarea
                required
                rows={3}
                value={form.needSummary}
                onChange={(e) => setForm({ ...form, needSummary: e.target.value })}
                className="resize-none"
              />
            </div>
            <div>
              <Label className="text-xs">Lead Source *</Label>
              <Select
                required
                value={form.source}
                onValueChange={(value) => setForm({ ...form, source: value as LeadSource })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Client ID (optional)</Label>
              <Input
                type="text"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                placeholder="Leave blank to create without client link"
              />
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
                {submitting ? "Creating…" : "Create Enquiry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ContentShell>
  );
}
