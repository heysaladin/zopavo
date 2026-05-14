import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate, statusConfig, platformConfig } from "@/lib/utils";
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
  const recent = allPosts.filter((p) => p.status === "POSTED").slice(0, 3);

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
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your posting command center</p>
        </div>
        <Link
          href="/library/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className="text-2xl font-semibold text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upcoming */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Upcoming</h2>
            <Link href="/library?status=READY" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No scheduled posts</p>
              <Link href="/library/new" className="text-xs text-violet-400 hover:text-violet-300 mt-2 inline-block">Create your first post →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((post) => (
                <div key={post.id} className="flex items-center gap-3 glass glass-hover rounded-xl p-3 group">
                  <Link href={`/library/${post.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{formatDate(post.scheduledAt)}</p>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <PlatformBadge platform={post.platform as Platform} />
                    <StatusBadge status={post.status as PostStatus} />
                  </div>
                  {post.status === "READY" && (
                    <Link
                      href={`/library/${post.id}/execute`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 text-xs font-medium hover:bg-violet-500/25 transition-colors"
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
              <h2 className="text-sm font-medium text-zinc-300">Drafts</h2>
              <Link href="/library?status=DRAFT" className="text-xs text-zinc-500 hover:text-zinc-300">All</Link>
            </div>
            <div className="space-y-1.5">
              {drafts.length === 0 ? (
                <p className="text-xs text-zinc-600 glass rounded-xl p-3 text-center">No drafts</p>
              ) : drafts.map((p) => (
                <Link key={p.id} href={`/library/${p.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors line-clamp-1 flex-1">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <Link href="/library/new" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              <Plus className="w-4 h-4" /> New Post
            </Link>
            <Link href="/library" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              <Library className="w-4 h-4" /> View Library
            </Link>
            <Link href="/calendar" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              <Calendar className="w-4 h-4" /> Calendar
            </Link>
            <Link href="/templates" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              <FileText className="w-4 h-4" /> Templates ({templates.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
