import { db } from "@/lib/db";
import { TemplatesClient } from "./templates-client";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await db.template.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pre-built caption templates for your content</p>
      </div>
      <TemplatesClient templates={templates as any} />
    </div>
  );
}
