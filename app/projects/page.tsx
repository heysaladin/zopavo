import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function ProjectsPage() {
  return <PhaseFileBrowser stepId="PROJECT" sections={readPhaseDocs("04-project-management")} />;
}
