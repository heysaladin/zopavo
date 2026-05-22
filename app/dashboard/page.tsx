import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { StatusBadge, PlatformBadge } from "@/components/posts/status-badge";
import { Plus, Zap, Calendar, Library, FileText } from "lucide-react";
import type { Platform, PostStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [allPosts, templates] = await Promise.all([
    db.post.findMany({ orderBy: { createdAt: "desc" } }),
    db.template.findMany(),
  ]);

  const upcoming = allPosts.filter((p) => p.status === "SCHEDULED" || p.status === "READY").slice(0, 5);
  const drafts = allPosts.filter((p) => p.status === "DRAFT").slice(0, 3);

  const stats = [
    { label: "Total Posts", value: allPosts.length },
    { label: "Scheduled", value: allPosts.filter((p) => p.status === "SCHEDULED").length },
    { label: "Ready", value: allPosts.filter((p) => p.status === "READY").length },
    { label: "Posted", value: allPosts.filter((p) => p.status === "POSTED").length },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your posting command center</p>
        </div>
        <Link
          href="/library/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="glass rounded-lg p-4">
            <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upcoming */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Upcoming</h2>
            <Link href="/library?status=READY" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="glass rounded-lg p-8 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No scheduled posts</p>
              <Link href="/library/new" className="text-xs text-primary hover:text-primary/80 mt-2 inline-block transition-colors">Create your first post →</Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {upcoming.map((post) => (
                <div key={post.id} className="flex items-center gap-3 glass glass-hover rounded-lg p-3 group">
                  <Link href={`/library/${post.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(post.scheduledAt)}</p>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <PlatformBadge platform={post.platform as Platform} />
                    <StatusBadge status={post.status as PostStatus} />
                  </div>
                  {post.status === "READY" && (
                    <Link
                      href={`/library/${post.id}/execute`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      <Zap className="w-3 h-3" />
                      Execute
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-5">
          {/* Drafts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-foreground">Drafts</h2>
              <Link href="/library?status=DRAFT" className="text-xs text-muted-foreground hover:text-foreground transition-colors">All</Link>
            </div>
            <div className="space-y-px">
              {drafts.length === 0 ? (
                <p className="text-xs text-muted-foreground glass rounded-lg p-3 text-center">No drafts</p>
              ) : drafts.map((p) => (
                <Link key={p.id} href={`/library/${p.id}`} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors group">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 flex-1">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass rounded-lg p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
            <Link href="/library/new" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Plus className="w-4 h-4" /> New Post
            </Link>
            <Link href="/library" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Library className="w-4 h-4" /> View Library
            </Link>
            <Link href="/calendar" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Calendar className="w-4 h-4" /> Calendar
            </Link>
            <Link href="/templates" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <FileText className="w-4 h-4" /> Templates ({templates.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
