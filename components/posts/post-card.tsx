"use client";

import Link from "next/link";
import { formatDate, truncate } from "@/lib/utils";
import { StatusBadge, PlatformBadge } from "./status-badge";
import { Calendar, MoreHorizontal, Copy, Pencil, Trash2, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostStatus, Platform } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  platform: string;
  caption: string;
  hashtags: string | null;
  scheduledAt: string | null;
  status: string;
}

export function PostCard({ post, onDelete }: { post: Post; onDelete?: (id: string) => void }) {
  const { showToast } = useAppStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopyCaption = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(post.caption);
    showToast("Caption copied!", "success");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    showToast("Post deleted", "info");
    onDelete?.(post.id);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...post,
        title: post.title + " (copy)",
        status: "DRAFT",
        scheduledAt: null,
      }),
    });
    showToast("Post duplicated", "success");
    router.refresh();
  };

  return (
    <div
      className="group relative glass surface-hover rounded-lg p-4 transition-all duration-150 cursor-pointer"
      onClick={() => router.push(`/library/${post.id}`)}
    >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <PlatformBadge platform={post.platform as Platform} />
            <StatusBadge status={post.status as PostStatus} />
          </div>
        </div>

        {/* Caption preview */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {truncate(post.caption, 140)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {post.scheduledAt ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.scheduledAt)}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/50">No date set</span>
          )}

          {post.status === "READY" && (
            <Link
              href={`/library/${post.id}/execute`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 text-xs font-medium hover:bg-violet-500/25 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Execute
            </Link>
          )}
        </div>

      {/* Menu button */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-7 w-40 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href={`/library/${post.id}/edit`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy caption
              </button>
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
