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
          className="px-3 py-1.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring w-52 transition-colors"
        />
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border-l border-border pl-4">
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                platformFilter === p
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {p === "ALL" ? "All platforms" : p === "INSTAGRAM" ? "Instagram" : p === "LINKEDIN" ? "LinkedIn" : "Both"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
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
