import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function QCPage() {
  return <PhaseFileBrowser stepId="QC" sections={readPhaseDocs("07-qc")} />;
}
