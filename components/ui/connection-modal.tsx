"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Connection = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  channel: string | null;
  status: string;
  notes: string | null;
  tags: string | null;
  lastContact: string | null;
};

type Props = {
  connection: Connection | null;
  onClose: () => void;
  onSaved: () => void;
};

const CHANNELS = ["instagram", "linkedin", "whatsapp", "email", "referral", "cold"];
const STATUSES = [
  { value: "MARKETING",   label: "Marketing" },
  { value: "ENQUIRY",     label: "Enquiry" },
  { value: "DEAL",        label: "Deal" },
  { value: "PROJECT",     label: "Project" },
  { value: "APPROVAL",    label: "Approval" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "QC",          label: "QC" },
  { value: "HANDOVER",    label: "Handover" },
];

export default function ConnectionModal({ connection, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    channel: "",
    status: "MARKETING",
    notes: "",
    tags: "",
    lastContact: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (connection) {
      setForm({
        name: connection.name,
        company: connection.company ?? "",
        email: connection.email ?? "",
        phone: connection.phone ?? "",
        channel: connection.channel ?? "",
        status: connection.status,
        notes: connection.notes ?? "",
        tags: connection.tags ?? "",
        lastContact: connection.lastContact
          ? connection.lastContact.slice(0, 10)
          : "",
      });
    }
  }, [connection]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      ...form,
      lastContact: form.lastContact || null,
    };

    if (connection) {
      await fetch(`/api/connections/${connection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">
            {connection ? "Edit Project" : "New Project"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Name *</label>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Company</label>
              <input
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
              >
                {STATUSES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="+62 xxx xxxx xxxx"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => set("channel", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
              >
                <option value="">— None —</option>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Last Contact</label>
              <input
                type="date"
                value={form.lastContact}
                onChange={(e) => set("lastContact", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="e.g. ui-design, startup, priority"
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">Comma-separated</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                placeholder="Any notes about this connection…"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md hover:bg-accent text-muted-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                saving || !form.name.trim()
                  ? "bg-primary/40 text-primary-foreground/50 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {saving ? "Saving…" : connection ? "Save Changes" : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
