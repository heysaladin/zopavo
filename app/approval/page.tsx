import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function ApprovalPage() {
  const sections = readPhaseDocs("05-approval");
  return <PhaseFileBrowser title="Approval" subtitle="05 — Approval" sections={sections} />;
}
