"use client";

import { useState } from "react";
import { PostCard } from "@/components/posts/post-card";
import { cn } from "@/lib/utils";
import type { PostStatus, Platform } from "@/lib/utils";

const STATUS_FILTERS: Array<PostStatus | "ALL"> = ["ALL", "DRAFT", "SCHEDULED", "READY", "POSTED", "ARCHIVED"];
const PLATFORM_FILTERS: Array<Platform | "ALL"> = ["ALL", "INSTAGRAM", "LINKEDIN", "BOTH"];

interface Post {
  id: string;
  title: string;
  platform: string;
  caption: string;
  hashtags: string | null;
  scheduledAt: string | null;
  status: string;
}

export function LibraryClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [statusFilter, setStatusFilter] = useState<PostStatus | "ALL">("ALL");
  const [platformFilter, setPlatformFilter] = useState<Platform | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = posts.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (platformFilter !== "ALL" && p.platform !== platformFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.caption.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/30 w-52"
        />
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 border-l border-white/8 pl-4">
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                platformFilter === p
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              {p === "ALL" ? "All platforms" : p === "INSTAGRAM" ? "Instagram" : p === "LINKEDIN" ? "LinkedIn" : "Both"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-sm">No posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
