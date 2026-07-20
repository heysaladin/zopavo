import {
  Megaphone,
  Inbox,
  FileSignature,
  FolderKanban,
  ClipboardCheck,
  Code2,
  FlaskConical,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

export type StepId =
  | "MARKETING"
  | "ENQUIRY"
  | "DEAL"
  | "PROJECT"
  | "APPROVAL"
  | "DEVELOPMENT"
  | "QC"
  | "HANDOVER";

export type PipelineStep = {
  num: number;
  id: StepId;
  label: string;
  description: string;
  href: string;
  phaseDir: string;
  icon: LucideIcon;
  /** Tailwind color classes for this step */
  color: {
    text: string;
    bg: string;
    border: string;
    solid: string;
  };
};

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    num: 1,
    id: "MARKETING",
    label: "Marketing",
    description: "Content, campaigns & outreach",
    href: "/library",
    phaseDir: "01-marketing",
    icon: Megaphone,
    color: { text: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/30", solid: "bg-violet-500" },
  },
  {
    num: 2,
    id: "ENQUIRY",
    label: "Enquiry",
    description: "Incoming leads & first contact",
    href: "/enquiries",
    phaseDir: "02-enquiry",
    icon: Inbox,
    color: { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", solid: "bg-blue-500" },
  },
  {
    num: 3,
    id: "DEAL",
    label: "Deal",
    description: "Proposals, quotes & contracts",
    href: "/deals",
    phaseDir: "03-deal",
    icon: FileSignature,
    color: { text: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/30", solid: "bg-cyan-500" },
  },
  {
    num: 4,
    id: "PROJECT",
    label: "Production",
    description: "Planning, scope & kickoff",
    href: "/projects",
    phaseDir: "04-production",
    icon: FolderKanban,
    color: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", solid: "bg-emerald-500" },
  },
  {
    num: 5,
    id: "APPROVAL",
    label: "Approval",
    description: "Sign-off & confirmation",
    href: "/deliverables?stage=APPROVAL",
    phaseDir: "05-approval",
    icon: ClipboardCheck,
    color: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", solid: "bg-amber-500" },
  },
  {
    num: 6,
    id: "DEVELOPMENT",
    label: "Development",
    description: "Build, iterate & review",
    href: "/deliverables?stage=DEVELOPMENT",
    phaseDir: "06-development",
    icon: Code2,
    color: { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", solid: "bg-orange-500" },
  },
  {
    num: 7,
    id: "QC",
    label: "QC",
    description: "Testing & quality control",
    href: "/deliverables?stage=QC",
    phaseDir: "07-qc",
    icon: FlaskConical,
    color: { text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30", solid: "bg-rose-500" },
  },
  {
    num: 8,
    id: "HANDOVER",
    label: "Handover",
    description: "Delivery, docs & closure",
    href: "/deliverables?stage=HANDOVER",
    phaseDir: "08-handover",
    icon: PackageCheck,
    color: { text: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/30", solid: "bg-pink-500" },
  },
];

export function getStep(id: StepId): PipelineStep {
  return PIPELINE_STEPS.find((s) => s.id === id)!;
}

export function nextStep(id: StepId): PipelineStep | null {
  const i = PIPELINE_STEPS.findIndex((s) => s.id === id);
  return PIPELINE_STEPS[i + 1] ?? null;
}

export function prevStep(id: StepId): PipelineStep | null {
  const i = PIPELINE_STEPS.findIndex((s) => s.id === id);
  return i > 0 ? PIPELINE_STEPS[i - 1] : null;
}

export function stepNum(num: number): string {
  return String(num).padStart(2, "0");
}
