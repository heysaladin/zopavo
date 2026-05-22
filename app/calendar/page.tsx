import { db } from "@/lib/db";
import { CalendarClient } from "./calendar-client";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const posts = await db.post.findMany({
    where: { scheduledAt: { not: null } },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your scheduled content at a glance</p>
      </div>
      <CalendarClient posts={posts as any} />
    </div>
  );
}
