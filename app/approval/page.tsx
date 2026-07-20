import { StageDeliverables } from "@/components/stage/stage-deliverables";

export const dynamic = "force-dynamic";

export default function ApprovalPage() {
  return (
    <StageDeliverables
      stage="APPROVAL"
      stepId="APPROVAL"
      phaseDir="05-approval"
    />
  );
}
