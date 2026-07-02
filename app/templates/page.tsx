import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function TemplatesPage() {
  return <PhaseFileBrowser stepId="MARKETING" sections={readPhaseDocs("01-marketing")} />;
}
