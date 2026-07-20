"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPELINE_STEPS } from "@/lib/pipeline";

type DeliverableStage = "DESIGN" | "APPROVAL" | "DEVELOPMENT" | "QC" | "HANDOVER" | "DONE";

const STAGE_COLORS: Record<DeliverableStage, string> = {
  DESIGN: "bg-blue-500/10 text-blue-500",
  APPROVAL: "bg-amber-500/10 text-amber-500",
  DEVELOPMENT: "bg-orange-500/10 text-orange-500",
  QC: "bg-rose-500/10 text-rose-500",
  HANDOVER: "bg-pink-500/10 text-pink-500",
  DONE: "bg-emerald-500/10 text-emerald-500",
};

type Deliverable = {
  id: string;
  name: string;
  type: string;
  subUnit: string;
  stage: DeliverableStage;
  progress: number;
  project: {
    id: string;
    name: string;
    client: { name: string };
  };
};

function DeliverablesContent() {
  const searchParams = useSearchParams();
  const stage = searchParams.get("stage") as DeliverableStage | null;
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliverables = useCallback(async () => {
    setLoading(true);
    try {
      const url = stage ? `/api/deliverables?stage=${stage}` : "/api/deliverables";
      const res = await fetch(url);
      const data = await res.json();
      setDeliverables(Array.isArray(data) ? data : []);
    } catch {
      setDeliverables([]);
    } finally {
      setLoading(false);
    }
  }, [stage]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  // Find the pipeline step for this stage
  const stageToStepId: Record<DeliverableStage, string> = {
    DESIGN: "",
    APPROVAL: "APPROVAL",
    DEVELOPMENT: "DEVELOPMENT",
    QC: "QC",
    HANDOVER: "HANDOVER",
    DONE: "",
  };
  const stepId = stage ? stageToStepId[stage] : null;
  const pipelineStep = stepId
    ? PIPELINE_STEPS.find((s) => s.id === stepId)
    : null;

  const title = stage ? `${stage.charAt(0) + stage.slice(1).toLowerCase()} — Deliverables` : "All Deliverables";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {deliverables.length} deliverable{deliverables.length !== 1 ? "s" : ""}
          {stage && ` in ${stage} stage`}
        </p>
      </div>

      {/* Stage filter links */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/deliverables"
          className={cn(
            "px-3 py-1.5 text-xs rounded-full border transition-colors",
            !stage
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </Link>
        {(["APPROVAL", "DEVELOPMENT", "QC", "HANDOVER"] as DeliverableStage[]).map((s) => (
          <Link
            key={s}
            href={`/deliverables?stage=${s}`}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition-colors",
              stage === s
                ? cn(STAGE_COLORS[s], "border-current")
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="surface rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : deliverables.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No deliverables {stage ? `in ${stage} stage` : "yet"}
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
                  STAGE_COLORS[d.stage]
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
  );
}

export default function DeliverablesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <DeliverablesContent />
    </Suspense>
  );
}
