"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { StatusBadge, PlatformBadge } from "@/components/posts/status-badge";
import {
  Plus,
  Zap,
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
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Platform, PostStatus } from "@/lib/utils";
import { PIPELINE_STEPS, getStep, nextStep, stepNum, type StepId } from "@/lib/pipeline";
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

const CHANNEL_OPTIONS = ["ALL", "instagram", "linkedin", "whatsapp", "email", "referral", "cold"];

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

function isStepId(status: string): status is StepId {
  return PIPELINE_STEPS.some((s) => s.id === status);
}

export default function DashboardPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StepId | "ALL">("ALL");
  const [channel, setChannel] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [advancing, setAdvancing] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : []);
    } catch {
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
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

  async function handleAdvance(c: Connection) {
    if (!isStepId(c.status)) return;
    const next = nextStep(c.status);
    if (!next) return;
    setAdvancing(c.id);
    await fetch(`/api/connections/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next.id }),
    });
    setAdvancing(null);
    fetchConnections();
  }

  function onSaved() {
    setModalOpen(false);
    fetchConnections();
  }

  // Counts per step (all 8, unfiltered)
  const counts = useMemo(
    () =>
      Object.fromEntries(
        PIPELINE_STEPS.map((s) => [
          s.id,
          connections.filter((c) => c.status === s.id).length,
        ])
      ) as Record<StepId, number>,
    [connections]
  );

  // Client-side filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return connections.filter((c) => {
      if (status !== "ALL" && c.status !== status) return false;
      if (channel !== "ALL" && c.channel !== channel) return false;
      if (q) {
        const haystack = [c.name, c.company, c.email, c.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [connections, status, channel, search]);

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

  const activeStep = status !== "ALL" ? getStep(status) : null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {connections.length} project{connections.length === 1 ? "" : "s"} across 8 pipeline steps
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Pipeline funnel — 8 steps */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
          Pipeline
        </p>
        <div className="flex items-stretch gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isFiltered = status === step.id;
            return (
              <div key={step.id} className="flex items-center shrink-0 md:flex-1 md:min-w-0">
                {i > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mx-0.5" />
                )}
                <button
                  onClick={() => setStatus(isFiltered ? "ALL" : step.id)}
                  className={cn(
                    "group relative w-28 md:w-full surface surface-hover rounded-lg p-2.5 text-left transition-all",
                    isFiltered && cn("ring-1", step.color.border, step.color.bg)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground/60">
                      {stepNum(step.num)}
                    </span>
                    <Icon className={cn("w-3.5 h-3.5", step.color.text)} />
                  </div>
                  <p className="text-xl font-semibold tabular-nums mt-1 leading-none">
                    {loading ? "–" : counts[step.id]}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] text-muted-foreground leading-tight truncate">
                      {step.label}
                    </p>
                    <Link
                      href={step.href}
                      onClick={(e) => e.stopPropagation()}
                      title={`Open ${step.label} phase`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </button>
              </div>
            );
          })}
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
            placeholder="Search name, company, tags…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="text-xs px-2 py-2 bg-background border border-border rounded-md text-muted-foreground focus:outline-none cursor-pointer"
        >
          {CHANNEL_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c === "ALL" ? "All channels" : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        {activeStep && (
          <button
            onClick={() => setStatus("ALL")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full border transition-colors",
              activeStep.color.bg,
              activeStep.color.border,
              activeStep.color.text
            )}
          >
            {stepNum(activeStep.num)} {activeStep.label}
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="surface rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {connections.length === 0 ? "No projects yet" : "No projects match your filters"}
          </p>
          <button
            onClick={openNew}
            className="text-xs text-primary hover:text-primary/80 mt-2 inline-block transition-colors"
          >
            Add your first project →
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((c) => {
            const step = isStepId(c.status) ? getStep(c.status) : null;
            const next = step ? nextStep(step.id) : null;
            return (
              <div
                key={c.id}
                className="flex items-center gap-4 surface surface-hover rounded-lg px-4 py-3 group"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
                    step ? cn(step.color.bg, step.color.text) : "bg-primary/10 text-primary"
                  )}
                >
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

                {/* Stage badge */}
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                    step ? cn(step.color.bg, step.color.text) : "bg-muted text-muted-foreground"
                  )}
                >
                  {step && <span className="font-mono">{stepNum(step.num)}</span>}
                  {step ? step.label : c.status}
                </span>

                {/* Row actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {next && (
                    <button
                      onClick={() => handleAdvance(c)}
                      disabled={advancing === c.id}
                      title={`Advance to ${stepNum(next.num)} ${next.label}`}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 text-xs rounded-md hover:bg-accent transition-colors",
                        next.color.text
                      )}
                    >
                      {advancing === c.id ? "…" : next.label}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(c)}
                    className="px-2.5 py-1 text-xs rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
            );
          })}
        </div>
      )}

      {/* Schedule */}
      {scheduledPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Content schedule</h2>
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
                    <div key={post.id} className="flex items-center gap-3 surface surface-hover rounded-lg px-4 py-3 group">
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
