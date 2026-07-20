import { StageDeliverables } from "@/components/stage/stage-deliverables";

export const dynamic = "force-dynamic";

export default function DevelopmentPage() {
  return (
    <StageDeliverables
      stage="DEVELOPMENT"
      stepId="DEVELOPMENT"
      phaseDir="06-development"
    />
  );
}
