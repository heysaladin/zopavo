import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function QCPage() {
  const sections = readPhaseDocs("07-qc");
  return <PhaseFileBrowser title="QC" subtitle="07 — Quality Control" sections={sections} />;
}
