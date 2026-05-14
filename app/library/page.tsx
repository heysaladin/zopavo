import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { LibraryClient } from "./library-client";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const posts = await db.post.findMany({
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Library</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{posts.length} posts</p>
        </div>
        <Link
          href="/library/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>
      <LibraryClient initialPosts={posts as any} />
    </div>
  );
}
