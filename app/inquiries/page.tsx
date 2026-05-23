import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function InquiriesPage() {
  const sections = readPhaseDocs("02-enquiry");
  return (
    <PhaseFileBrowser
      title="Inquiries"
      subtitle="02 — Enquiry"
      sections={sections}
    />
  );
}
