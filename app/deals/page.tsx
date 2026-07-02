import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function DealsPage() {
  return <PhaseFileBrowser stepId="DEAL" sections={readPhaseDocs("03-deal")} />;
}
