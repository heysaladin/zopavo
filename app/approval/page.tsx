import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function ApprovalPage() {
  return <PhaseFileBrowser stepId="APPROVAL" sections={readPhaseDocs("05-approval")} />;
}
