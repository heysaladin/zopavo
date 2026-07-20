import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { type StepId } from "@/lib/pipeline";
import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

type DeliverableStage = "DESIGN" | "APPROVAL" | "DEVELOPMENT" | "QC" | "HANDOVER" | "DONE";

const STAGE_COLORS: Record<DeliverableStage, string> = {
  DESIGN: "bg-blue-500/10 text-blue-500",
  APPROVAL: "bg-amber-500/10 text-amber-500",
  DEVELOPMENT: "bg-orange-500/10 text-orange-500",
  QC: "bg-rose-500/10 text-rose-500",
  HANDOVER: "bg-pink-500/10 text-pink-500",
  DONE: "bg-emerald-500/10 text-emerald-500",
};

type Props = {
  stage: DeliverableStage;
  stepId: StepId;
  phaseDir: string;
};

export async function StageDeliverables({ stage, stepId, phaseDir }: Props) {
  const deliverables = await db.deliverable.findMany({
    where: { stage },
    include: { project: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
  });

  const sections = readPhaseDocs(phaseDir);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Live deliverables section */}
      <div className="p-4 md:p-6 border-b border-border space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">
            Live in{" "}
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STAGE_COLORS[stage])}>
              {stage}
            </span>
          </h2>
          <span className="text-xs text-muted-foreground ml-auto">
            {deliverables.length} deliverable{deliverables.length !== 1 ? "s" : ""}
          </span>
        </div>

        {deliverables.length === 0 ? (
          <div className="surface rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No deliverables currently in {stage} stage
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {deliverables.map((d) => (
              <Link
                key={d.id}
                href={`/deliverables/${d.id}`}
                className="flex items-center gap-3 surface surface-hover rounded-lg px-4 py-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{d.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {d.type.replace("_", " ")}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {d.subUnit}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.project.name} · {d.project.client.name}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                    STAGE_COLORS[d.stage as DeliverableStage]
                  )}
                >
                  {d.stage}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Phase docs section */}
      <PhaseFileBrowser stepId={stepId} sections={sections} />
    </div>
  );
}
