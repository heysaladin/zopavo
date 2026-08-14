import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { LibraryClient } from "./library-client";
import { ContentShell } from "@/components/webapp/ContentShell";
import { PageHeader } from "@/components/webapp/PageHeader";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  let posts: Awaited<ReturnType<typeof db.post.findMany>> = [];
  try {
    posts = await db.post.findMany({
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    // database unreachable
  }

  return (
    <ContentShell maxWidth="full" className="space-y-6">
      <PageHeader
        title="Library"
        description={`${posts.length} posts`}
        actions={
          <Button asChild>
            <Link href="/library/new">
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </Link>
          </Button>
        }
      />
      <LibraryClient initialPosts={posts as any} />
    </ContentShell>
  );
}
