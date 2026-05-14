import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/posts/post-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/library/${post.id}`} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to post
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Edit Post</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{post.title}</p>
      </div>
      <PostForm
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title,
          platform: post.platform,
          caption: post.caption,
          hashtags: post.hashtags ?? undefined,
          mediaPath: post.mediaPath ?? undefined,
          scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null,
          status: post.status,
          notes: post.notes ?? undefined,
        }}
      />
    </div>
  );
}
