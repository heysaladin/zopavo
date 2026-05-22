"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Platform, PostStatus } from "@/lib/utils";

interface PostFormProps {
  initialData?: {
    id?: string;
    title?: string;
    platform?: string;
    caption?: string;
    hashtags?: string;
    mediaPath?: string;
    scheduledAt?: string | null;
    status?: string;
    notes?: string;
  };
  mode?: "create" | "edit";
}

const platforms: Platform[] = ["INSTAGRAM", "LINKEDIN", "BOTH"];
const statuses: PostStatus[] = ["DRAFT", "SCHEDULED", "READY", "POSTED", "ARCHIVED"];

const inputClass = "w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors";

export function PostForm({ initialData, mode = "create" }: PostFormProps) {
  const router = useRouter();
  const { showToast } = useAppStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    platform: (initialData?.platform as Platform) || "INSTAGRAM",
    caption: initialData?.caption || "",
    hashtags: initialData?.hashtags || "",
    mediaPath: initialData?.mediaPath || "",
    scheduledAt: initialData?.scheduledAt
      ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
      : "",
    status: (initialData?.status as PostStatus) || "DRAFT",
    notes: initialData?.notes || "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.caption.trim()) {
      showToast("Title and caption are required", "error");
      return;
    }
    setLoading(true);

    const payload = {
      ...form,
      scheduledAt: form.scheduledAt || null,
      hashtags: form.hashtags || null,
      mediaPath: form.mediaPath || null,
      notes: form.notes || null,
    };

    const res = mode === "edit"
      ? await fetch(`/api/posts/${initialData?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      showToast(mode === "edit" ? "Post updated" : "Post created", "success");
      router.push(`/library/${data.id}`);
      router.refresh();
    } else {
      showToast("Something went wrong", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="E.g. Product Launch Announcement"
          className={inputClass}
        />
      </div>

      {/* Platform */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</label>
        <div className="flex gap-2">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("platform", p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                form.platform === p
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              )}
            >
              {p === "BOTH" ? "Both" : p === "INSTAGRAM" ? "Instagram" : "LinkedIn"}
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Caption</label>
        <textarea
          value={form.caption}
          onChange={(e) => set("caption", e.target.value)}
          placeholder="Write your caption..."
          rows={6}
          className={cn(inputClass, "resize-none leading-relaxed")}
        />
        <p className="text-xs text-muted-foreground/60">{form.caption.length} characters</p>
      </div>

      {/* Hashtags */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hashtags</label>
        <input
          type="text"
          value={form.hashtags}
          onChange={(e) => set("hashtags", e.target.value)}
          placeholder="#design #creator #buildinpublic"
          className={inputClass}
        />
      </div>

      {/* Media Path */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Media Path</label>
        <input
          type="text"
          value={form.mediaPath}
          onChange={(e) => set("mediaPath", e.target.value)}
          placeholder="/Users/you/Desktop/post-image.jpg"
          className={cn(inputClass, "font-mono text-xs")}
        />
      </div>

      {/* Scheduled Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scheduled Date</label>
        <input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => set("scheduledAt", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className={inputClass}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Internal notes..."
          rows={2}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update Post" : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
