import { db } from "@/lib/db";
import { CalendarClient } from "./calendar-client";
import { PageHeader } from "@/components/webapp/PageHeader";
import { ContentShell } from "@/components/webapp/ContentShell";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  let posts: Awaited<ReturnType<typeof db.post.findMany>> = [];
  try {
    posts = await db.post.findMany({
      where: { scheduledAt: { not: null } },
      orderBy: { scheduledAt: "asc" },
    });
  } catch {
    // database unreachable
  }

  return (
    <ContentShell maxWidth="full" className="space-y-6">
      <PageHeader title="Calendar" description="Your scheduled content at a glance" />
      <CalendarClient posts={posts as any} />
    </ContentShell>
  );
}
