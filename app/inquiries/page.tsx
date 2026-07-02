import { readPhaseDocs } from "@/lib/phase-docs";
import { PhaseFileBrowser } from "@/components/docs/phase-file-browser";

export default function InquiriesPage() {
  return <PhaseFileBrowser stepId="ENQUIRY" sections={readPhaseDocs("02-enquiry")} />;
}
