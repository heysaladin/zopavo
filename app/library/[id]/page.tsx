import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { StatusBadge, PlatformBadge } from "@/components/posts/status-badge";
import { ChevronLeft, Pencil, Zap, Calendar, FileText } from "lucide-react";
import { ClipboardButtons } from "@/components/execute/clipboard-buttons";
import type { Platform, PostStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/library" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-3.5 h-3.5" /> Library
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{post.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <PlatformBadge platform={post.platform as Platform} />
            <StatusBadge status={post.status as PostStatus} />
            {post.scheduledAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(post.scheduledAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/library/${post.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-background border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          {(post.status === "READY" || post.status === "SCHEDULED") && (
            <Link
              href={`/library/${post.id}/execute`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
            >
              <Zap className="w-3.5 h-3.5" /> Execute
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Caption */}
        <div className="glass rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Caption</p>
            <ClipboardButtons caption={post.caption} hashtags={post.hashtags} mediaPath={post.mediaPath} />
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.caption}</p>
        </div>

        {/* Hashtags */}
        {post.hashtags && (
          <div className="glass rounded-lg p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Hashtags</p>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">{post.hashtags}</p>
          </div>
        )}

        {/* Media */}
        {post.mediaPath && (
          <div className="glass rounded-lg p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Media</p>
            <p className="text-sm text-muted-foreground font-mono">{post.mediaPath}</p>
          </div>
        )}

        {/* Notes */}
        {post.notes && (
          <div className="glass rounded-lg p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{post.notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-muted-foreground/50 flex items-center gap-4">
          <span>Created {formatDate(post.createdAt)}</span>
          <span>Updated {formatDate(post.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
