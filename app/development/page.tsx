import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function DevelopmentPage() {
  const sections = readPhaseDocs("06-development");
  return <PhaseFileBrowser title="Development" subtitle="06 — Development" sections={sections} />;
}
