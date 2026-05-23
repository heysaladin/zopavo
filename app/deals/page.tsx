import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function DealsPage() {
  const sections = readPhaseDocs("03-deal");
  return <PhaseFileBrowser title="Deals" subtitle="03 — Deal" sections={sections} />;
}
