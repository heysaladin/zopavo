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
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-1.5 rounded-lg hover:bg-white/8 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-zinc-100 w-36 text-center">
            {format(current, "MMMM yyyy")}
          </h2>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-1.5 rounded-lg hover:bg-white/8 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrent(new Date())} className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-300 border border-white/8 rounded-lg hover:bg-white/5 transition-colors ml-2">
            Today
          </button>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {(["month", "agenda"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                view === v ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
          {/* Day headers */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="bg-[#0d0d0d] px-3 py-2 text-xs font-medium text-zinc-600 text-center">
              {d}
            </div>
          ))}

          {/* Day cells */}
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
                  "bg-[#0d0d0d] p-2 min-h-[80px] text-left transition-colors hover:bg-white/3",
                  !inMonth && "opacity-30",
                  isSelected && "bg-violet-500/8 ring-1 ring-inset ring-violet-500/20"
                )}
              >
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1",
                  todayDay ? "bg-violet-500 text-white font-semibold" : "text-zinc-500"
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
                    <div className="text-xs text-zinc-600 px-1">+{dayPosts.length - 2} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {agendaPosts.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 text-sm">No scheduled posts</div>
          ) : agendaPosts.map((post) => (
            <Link
              key={post.id}
              href={`/library/${post.id}`}
              className="flex items-center gap-4 glass glass-hover rounded-xl p-4"
            >
              <div className="text-right shrink-0 w-24">
                <p className="text-xs font-medium text-zinc-400">{format(new Date(post.scheduledAt!), "MMM d")}</p>
                <p className="text-xs text-zinc-600">{format(new Date(post.scheduledAt!), "h:mm a")}</p>
              </div>
              <div className="w-px h-8 bg-white/8" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 line-clamp-1">{post.title}</p>
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
        <div className="mt-6 glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">{format(selected, "MMMM d, yyyy")}</h3>
          <div className="space-y-2">
            {selectedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/library/${post.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 line-clamp-1">{post.title}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{format(new Date(post.scheduledAt!), "h:mm a")}</p>
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
