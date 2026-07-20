import { StageDeliverables } from "@/components/stage/stage-deliverables";

export const dynamic = "force-dynamic";

export default function HandoverPage() {
  return (
    <StageDeliverables
      stage="HANDOVER"
      stepId="HANDOVER"
      phaseDir="08-handover"
    />
  );
}
