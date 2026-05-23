import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function ProjectsPage() {
  const sections = readPhaseDocs("04-project-management");
  return <PhaseFileBrowser title="Projects" subtitle="04 — Project Management" sections={sections} />;
}
