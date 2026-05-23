import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function HandoverPage() {
  const sections = readPhaseDocs("08-handover");
  return <PhaseFileBrowser title="Handover" subtitle="08 — Handover" sections={sections} />;
}
