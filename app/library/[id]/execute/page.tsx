import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ExecuteModal } from "@/components/execute/execute-modal";
import Link from "next/link";
import { ChevronLeft, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExecutePage({ params }: { params: { id: string } }) {
  let post: Awaited<ReturnType<typeof db.post.findUnique>> = null;
  try {
    post = await db.post.findUnique({ where: { id: params.id } });
  } catch {
    // database unreachable
  }
  if (!post) notFound();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/library/${post.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to post
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Execute Post</h1>
            <p className="text-sm text-muted-foreground">Follow the steps to publish your content</p>
          </div>
        </div>
      </div>

      <ExecuteModal post={{
        id: post.id,
        title: post.title,
        platform: post.platform,
        caption: post.caption,
        hashtags: post.hashtags,
        mediaPath: post.mediaPath,
      }} />
    </div>
  );
}
