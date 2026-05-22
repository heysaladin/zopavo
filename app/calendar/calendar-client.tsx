"use client";

import { useState } from "react";
import Link from "next/link";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, platformConfig } from "@/lib/utils";
import { StatusBadge, PlatformBadge } from "@/components/posts/status-badge";
import type { Platform, PostStatus } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
}

export function CalendarClient({ posts }: { posts: Post[] }) {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<"month" | "agenda">("month");
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day));

  const selectedPosts = selected ? getPostsForDay(selected) : [];

  const agendaPosts = [...posts]
    .filter((p) => p.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-foreground w-36 text-center">
            {format(current, "MMMM yyyy")}
          </h2>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrent(new Date())} className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent transition-colors ml-2">
            Today
          </button>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
          {(["month", "agenda"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {days.map((day) => {
              const dayPosts = getPostsForDay(day);
              const inMonth = isSameMonth(day, current);
              const todayDay = isToday(day);
              const isSelected = selected && isSameDay(day, selected);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(isSameDay(day, selected ?? new Date(0)) ? null : day)}
                  className={cn(
                    "bg-background p-2 min-h-[80px] text-left transition-colors hover:bg-accent",
                    !inMonth && "opacity-40",
                    isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/25"
                  )}
                >
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1",
                    todayDay ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 2).map((p) => (
                      <div key={p.id} className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate",
                        platformConfig[p.platform as Platform].bg,
                        platformConfig[p.platform as Platform].color
                      )}>
                        {p.title}
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-muted-foreground/60 px-1">+{dayPosts.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {agendaPosts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No scheduled posts</div>
          ) : agendaPosts.map((post) => (
            <Link
              key={post.id}
              href={`/library/${post.id}`}
              className="flex items-center gap-4 glass surface-hover rounded-lg p-4"
            >
              <div className="text-right shrink-0 w-24">
                <p className="text-xs font-medium text-foreground">{format(new Date(post.scheduledAt!), "MMM d")}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(post.scheduledAt!), "h:mm a")}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PlatformBadge platform={post.platform as Platform} />
                <StatusBadge status={post.status as PostStatus} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Selected day posts */}
      {selected && selectedPosts.length > 0 && (
        <div className="mt-6 glass rounded-lg p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">{format(selected, "MMMM d, yyyy")}</h3>
          <div className="space-y-1.5">
            {selectedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/library/${post.id}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(post.scheduledAt!), "h:mm a")}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PlatformBadge platform={post.platform as Platform} />
                  <StatusBadge status={post.status as PostStatus} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
