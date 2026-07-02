import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function HandoverPage() {
  return <PhaseFileBrowser stepId="HANDOVER" sections={readPhaseDocs("08-handover")} />;
}
