"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { StatusBadge, PlatformBadge } from "@/components/posts/status-badge";
import {
  Plus,
  Zap,
  Calendar,
  Search,
  Users,
  Building2,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  MessageCircle,
  AtSign,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Platform, PostStatus } from "@/lib/utils";
import ConnectionModal from "@/components/ui/connection-modal";

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
  createdAt: string;
  updatedAt: string;
};

type Post = {
  id: string;
  title: string;
  caption: string | null;
  platform: string;
  status: string;
  scheduledAt: string | null;
};

const STATUS_OPTIONS = ["ALL", "ENQUIRY", "DEAL", "PROJECT", "APPROVAL", "DEVELOPMENT", "QC", "HANDOVER"];
const CHANNEL_OPTIONS = ["ALL", "instagram", "linkedin", "whatsapp", "email", "referral", "cold"];

const allStatuses = ["ENQUIRY", "DEAL", "PROJECT", "APPROVAL", "DEVELOPMENT", "QC", "HANDOVER"] as const;

const statusColors: Record<string, string> = {
  ENQUIRY:     "bg-blue-400/10 text-blue-400",
  DEAL:        "bg-cyan-400/10 text-cyan-400",
  PROJECT:     "bg-emerald-400/10 text-emerald-400",
  APPROVAL:    "bg-yellow-400/10 text-yellow-400",
  DEVELOPMENT: "bg-orange-400/10 text-orange-400",
  QC:          "bg-rose-400/10 text-rose-400",
  HANDOVER:    "bg-pink-400/10 text-pink-400",
};

const statusLabel: Record<string, string> = {
  ENQUIRY:     "Enquiry",
  DEAL:        "Deal",
  PROJECT:     "Project",
  APPROVAL:    "Approval",
  DEVELOPMENT: "Development",
  QC:          "QC",
  HANDOVER:    "Handover",
};

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "instagram") return <Instagram className="w-3.5 h-3.5" />;
  if (channel === "linkedin") return <Linkedin className="w-3.5 h-3.5" />;
  if (channel === "whatsapp") return <MessageCircle className="w-3.5 h-3.5" />;
  if (channel === "email") return <AtSign className="w-3.5 h-3.5" />;
  if (channel === "referral") return <UserCheck className="w-3.5 h-3.5" />;
  if (channel === "cold") return <Users className="w-3.5 h-3.5" />;
  return null;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE");
  return format(date, "MMM d, yyyy");
}

export default function DashboardPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [channel, setChannel] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);

  const fetchConnections = useCallback(async () => {
    setLoadingConnections(true);
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (channel !== "ALL") params.set("channel", channel);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/connections?${params.toString()}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : []);
    } catch {
      setConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  }, [status, channel, search]);

  useEffect(() => {
    const t = setTimeout(fetchConnections, 300);
    return () => clearTimeout(t);
  }, [fetchConnections]);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setPosts([]));
  }, []);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c: Connection) {
    setEditing(c);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/connections/${id}`, { method: "DELETE" });
    fetchConnections();
  }

  function onSaved() {
    setModalOpen(false);
    fetchConnections();
  }

  // All connections (unfiltered) for counts
  const [allConnections, setAllConnections] = useState<Connection[]>([]);
  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d) => setAllConnections(Array.isArray(d) ? d : []))
      .catch(() => setAllConnections([]));
  }, [modalOpen]);

  const counts = Object.fromEntries(
    allStatuses.map((s) => [s, allConnections.filter((c) => c.status === s).length])
  ) as Record<string, number>;

  // Schedule
  const scheduledPosts = posts
    .filter((p) => p.scheduledAt && p.status !== "ARCHIVED")
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  const grouped: Record<string, typeof scheduledPosts> = {};
  for (const post of scheduledPosts) {
    const label = getDateLabel(new Date(post.scheduledAt!));
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(post);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">End-to-end pipeline overview</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Pipeline stats */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Pipeline</p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {/* Marketing card — posts only */}
          <Link
            href="/library"
            className="glass rounded-lg p-3 text-left transition-colors hover:bg-accent"
          >
            <p className="text-xl font-semibold tabular-nums">{posts.filter((p) => p.status !== "ARCHIVED").length}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">Marketing</p>
          </Link>

          {/* Project pipeline — connections */}
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(status === s ? "ALL" : s)}
              className={cn(
                "glass rounded-lg p-3 text-left transition-colors hover:bg-accent",
                status === s && "ring-1 ring-primary/30"
              )}
            >
              <p className="text-xl font-semibold tabular-nums">{counts[s]}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{statusLabel[s]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md transition-colors",
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "ALL" ? "All" : statusLabel[s] ?? s}
            </button>
          ))}
        </div>

        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="text-xs px-2 py-1.5 bg-background border border-border rounded-md text-muted-foreground focus:outline-none cursor-pointer"
        >
          {CHANNEL_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c === "ALL" ? "All channels" : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Projects list */}
      {loadingConnections ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No projects found</p>
          <button
            onClick={openNew}
            className="text-xs text-primary hover:text-primary/80 mt-2 inline-block transition-colors"
          >
            Add your first project →
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {connections.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 glass rounded-lg px-4 py-3 hover:bg-accent transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-medium text-primary">
                {c.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  {c.channel && (
                    <span className="text-muted-foreground/60 shrink-0">
                      <ChannelIcon channel={c.channel} />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {c.company && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 shrink-0" />
                      {c.company}
                    </span>
                  )}
                  {c.email && (
                    <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      {c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                      <Phone className="w-3 h-3 shrink-0" />
                      {c.phone}
                    </span>
                  )}
                </div>
              </div>

              {c.tags && (
                <div className="hidden lg:flex gap-1 shrink-0">
                  {c.tags.split(",").slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-accent text-muted-foreground">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {c.lastContact && (
                <p className="text-xs text-muted-foreground hidden md:block shrink-0">
                  {format(new Date(c.lastContact), "MMM d")}
                </p>
              )}

              <span className={cn(
                "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                statusColors[c.status] ?? "bg-muted text-muted-foreground"
              )}>
                {statusLabel[c.status] ?? c.status}
              </span>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="px-2.5 py-1 text-xs rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-2.5 py-1 text-xs rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule */}
      {scheduledPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Schedule</h2>
            <Link href="/calendar" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View calendar
            </Link>
          </div>
          <div className="space-y-5">
            {Object.entries(grouped).map(([dateLabel, datePosts]) => (
              <div key={dateLabel}>
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
                  {dateLabel}
                </p>
                <div className="space-y-1.5">
                  {datePosts.map((post) => (
                    <div key={post.id} className="flex items-center gap-3 glass rounded-lg px-4 py-3 hover:bg-accent transition-colors group">
                      <div className="shrink-0 w-14 text-right">
                        <p className="text-xs font-medium tabular-nums text-muted-foreground">
                          {format(new Date(post.scheduledAt!), "h:mm")}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 uppercase">
                          {format(new Date(post.scheduledAt!), "a")}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-border shrink-0" />
                      <Link href={`/library/${post.id}`} className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-foreground">{post.title}</p>
                        {post.caption && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.caption}</p>
                        )}
                      </Link>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <PlatformBadge platform={post.platform as Platform} />
                        <StatusBadge status={post.status as PostStatus} />
                      </div>
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
        </div>
      )}

      {modalOpen && (
        <ConnectionModal
          connection={editing}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
