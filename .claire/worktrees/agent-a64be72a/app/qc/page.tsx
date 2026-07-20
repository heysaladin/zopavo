import { StageDeliverables } from "@/components/stage/stage-deliverables";

export const dynamic = "force-dynamic";

export default function QCPage() {
  return (
    <StageDeliverables
      stage="QC"
      stepId="QC"
      phaseDir="07-qc"
    />
  );
}
