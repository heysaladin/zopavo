import { db } from "@/lib/db";
import Link from "next/link";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { StatusBadge, PlatformBadge } from "@/components/posts/status-badge";
import {
  Plus,
  Zap,
  Calendar,
  Library,
  FileText,
  Megaphone,
  Inbox,
  FileSignature,
  FolderKanban,
  ClipboardCheck,
  Code2,
  FlaskConical,
  PackageCheck,
} from "lucide-react";
import type { Platform, PostStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

const pipeline = [
  { label: "Marketing", href: "/library", icon: Megaphone, color: "text-violet-400", bg: "bg-violet-400/10" },
  { label: "Inquiry", href: "/inquiries", icon: Inbox, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Deal", href: "/deals", icon: FileSignature, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { label: "Projects", href: "/projects", icon: FolderKanban, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Approval", href: "/approval", icon: ClipboardCheck, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { label: "Dev", href: "/development", icon: Code2, color: "text-orange-400", bg: "bg-orange-400/10" },
  { label: "QC", href: "/qc", icon: FlaskConical, color: "text-rose-400", bg: "bg-rose-400/10" },
  { label: "Handover", href: "/handover", icon: PackageCheck, color: "text-pink-400", bg: "bg-pink-400/10" },
];

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE");
  return format(date, "MMM d, yyyy");
}

export default async function DashboardPage() {
  const [allPosts, templates] = await Promise.all([
    db.post.findMany({ orderBy: { scheduledAt: "asc" } }),
    db.template.findMany(),
  ]);

  const scheduledPosts = allPosts
    .filter((p) => p.scheduledAt && p.status !== "ARCHIVED")
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  const drafts = allPosts.filter((p) => p.status === "DRAFT").slice(0, 5);

  // Group scheduled posts by date label
  const grouped: Record<string, typeof scheduledPosts> = {};
  for (const post of scheduledPosts) {
    const label = getDateLabel(new Date(post.scheduledAt!));
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(post);
  }

  const marketingStats = [
    { label: "Drafts", value: allPosts.filter((p) => p.status === "DRAFT").length },
    { label: "Scheduled", value: allPosts.filter((p) => p.status === "SCHEDULED").length },
    { label: "Ready", value: allPosts.filter((p) => p.status === "READY").length },
    { label: "Posted", value: allPosts.filter((p) => p.status === "POSTED").length },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">End-to-end pipeline overview</p>
        </div>
        <Link
          href="/library/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Pipeline */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Pipeline</p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {pipeline.map((phase, i) => {
            const Icon = phase.icon;
            const count = i === 0 ? allPosts.length : 0;
            return (
              <Link
                key={phase.href}
                href={phase.href}
                className="glass rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-accent transition-colors"
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${phase.bg}`}>
                  <Icon className={`w-4 h-4 ${phase.color}`} />
                </div>
                <p className="text-lg font-semibold tabular-nums">{count}</p>
                <p className="text-[10px] text-muted-foreground text-center leading-tight">{phase.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left: Schedule */}
        <div className="md:col-span-2 space-y-6">

          {/* Detailed schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Schedule</h2>
              <Link href="/calendar" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View calendar
              </Link>
            </div>

            {scheduledPosts.length === 0 ? (
              <div className="glass rounded-lg p-8 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No scheduled posts</p>
                <Link href="/library/new" className="text-xs text-primary hover:text-primary/80 mt-2 inline-block transition-colors">
                  Create your first post →
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([dateLabel, posts]) => (
                  <div key={dateLabel}>
                    <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
                      {dateLabel}
                    </p>
                    <div className="space-y-1.5">
                      {posts.map((post) => (
                        <div key={post.id} className="flex items-center gap-3 glass rounded-lg px-4 py-3 hover:bg-accent transition-colors group">
                          {/* Time */}
                          <div className="shrink-0 w-14 text-right">
                            <p className="text-xs font-medium tabular-nums text-muted-foreground">
                              {format(new Date(post.scheduledAt!), "h:mm")}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 uppercase">
                              {format(new Date(post.scheduledAt!), "a")}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-8 bg-border shrink-0" />

                          {/* Title */}
                          <Link href={`/library/${post.id}`} className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1 group-hover:text-foreground">
                              {post.title}
                            </p>
                            {post.caption && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {post.caption}
                              </p>
                            )}
                          </Link>

                          {/* Badges */}
                          <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <PlatformBadge platform={post.platform as Platform} />
                            <StatusBadge status={post.status as PostStatus} />
                          </div>

                          {/* Execute */}
                          {post.status === "READY" && (
                            <Link
                              href={`/library/${post.id}/execute`}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors shrink-0"
                            >
                              <Zap className="w-3 h-3" />
                              Post
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Marketing stats */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Marketing</h2>
              <Link href="/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Open library
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {marketingStats.map(({ label, value }) => (
                <div key={label} className="glass rounded-lg p-3">
                  <p className="text-xl font-semibold tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Quick actions + Drafts */}
        <div className="space-y-5">

          {/* Quick actions */}
          <div className="glass rounded-lg p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
              Quick Actions
            </p>
            <Link href="/library/new" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Plus className="w-4 h-4" /> New post
            </Link>
            <Link href="/library" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Library className="w-4 h-4" /> Library
            </Link>
            <Link href="/calendar" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Calendar className="w-4 h-4" /> Calendar
            </Link>
            <Link href="/templates" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <FileText className="w-4 h-4" /> Templates ({templates.length})
            </Link>
            <Link href="/inquiries" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Inbox className="w-4 h-4" /> New inquiry
            </Link>
          </div>

          {/* Drafts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium">Drafts</h2>
              <Link href="/library?status=DRAFT" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                All
              </Link>
            </div>
            <div className="space-y-px">
              {drafts.length === 0 ? (
                <p className="text-xs text-muted-foreground glass rounded-lg p-3 text-center">No drafts</p>
              ) : (
                drafts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/library/${p.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 flex-1">
                      {p.title}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
