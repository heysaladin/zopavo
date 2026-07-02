import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function DevelopmentPage() {
  return <PhaseFileBrowser stepId="DEVELOPMENT" sections={readPhaseDocs("06-development")} />;
}
