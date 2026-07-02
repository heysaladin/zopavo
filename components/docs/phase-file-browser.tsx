"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStep, nextStep, prevStep, stepNum, type StepId } from "@/lib/pipeline";
import { PipelineStepper } from "@/components/pipeline/pipeline-stepper";

export type DocSection = {
  label: "templates" | "artifacts" | "reports" | "legal";
  files: { name: string; html: string }[];
};

const SECTION_STYLE: Record<string, { badge: string; dot: string }> = {
  templates: {
    badge: "text-blue-500 border-blue-500/30 bg-blue-500/10",
    dot: "bg-blue-500",
  },
  artifacts: {
    badge: "text-purple-500 border-purple-500/30 bg-purple-500/10",
    dot: "bg-purple-500",
  },
  reports: {
    badge: "text-orange-500 border-orange-500/30 bg-orange-500/10",
    dot: "bg-orange-500",
  },
  legal: {
    badge: "text-rose-500 border-rose-500/30 bg-rose-500/10",
    dot: "bg-rose-500",
  },
};

function prettify(name: string) {
  return name
    .replace(/\.md$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Selected = { name: string; html: string; section: string };

export function PhaseFileBrowser({
  stepId,
  sections,
}: {
  stepId: StepId;
  sections: DocSection[];
}) {
  const step = getStep(stepId);
  const prev = prevStep(stepId);
  const next = nextStep(stepId);
  const Icon = step.icon;

  const firstFile = sections[0]?.files[0];
  const [selected, setSelected] = useState<Selected | null>(
    firstFile ? { ...firstFile, section: sections[0].label } : null
  );
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map((s) => [s.label, true]))
  );

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  const style = selected ? SECTION_STYLE[selected.section] : null;
  const totalFiles = sections.reduce((n, s) => n + s.files.length, 0);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Phase header */}
      <header className="border-b border-border px-4 md:px-6 pt-4 pb-3 shrink-0 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg border shrink-0",
                step.color.bg,
                step.color.border
              )}
            >
              <Icon className={cn("w-5 h-5", step.color.text)} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Step {stepNum(step.num)} of 08
              </p>
              <h1 className="text-lg font-semibold tracking-tight leading-tight">
                {step.label}
                <span className="ml-2 text-sm font-normal text-muted-foreground hidden sm:inline">
                  {step.description}
                </span>
              </h1>
            </div>
          </div>

          {/* Prev / next phase */}
          <div className="flex items-center gap-1.5">
            {prev ? (
              <Link
                href={prev.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{stepNum(prev.num)} {prev.label}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={next.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span className="hidden md:inline">Next:</span> {stepNum(next.num)} {next.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        <PipelineStepper current={step.num} />
      </header>

      {/* Body */}
      {totalFiles === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground/20" />
          <div>
            <p className="text-sm font-medium">No documents for this phase yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Add markdown files under{" "}
              <code className="font-mono bg-muted px-1 py-0.5 rounded">
                {"<docs>"}/templates|artifacts|reports|legal/{step.phaseDir}/
              </code>
              . Set <code className="font-mono bg-muted px-1 py-0.5 rounded">ZOPAVO_DOCS_BASE</code>{" "}
              to point at your docs folder.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* File tree */}
          <aside
            className={cn(
              "shrink-0 border-r border-border flex flex-col transition-all duration-200",
              collapsed ? "w-10" : "w-64"
            )}
          >
            {collapsed ? (
              <div className="flex flex-col items-center py-3">
                <button
                  onClick={() => setCollapsed(false)}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  title="Expand"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    {totalFiles} document{totalFiles === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() => setCollapsed(true)}
                    className="p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0"
                    title="Collapse"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {sections.map((section) => (
                    <div key={section.label}>
                      <button
                        onClick={() => toggleSection(section.label)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <ChevronRight
                          className={cn(
                            "w-3 h-3 shrink-0 transition-transform duration-150",
                            openSections[section.label] && "rotate-90"
                          )}
                        />
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            SECTION_STYLE[section.label].dot
                          )}
                        />
                        {section.label}
                        <span className="ml-auto font-normal normal-case tracking-normal text-muted-foreground/50">
                          {section.files.length}
                        </span>
                      </button>
                      {openSections[section.label] && (
                        <div className="mt-0.5 space-y-px">
                          {section.files.map((file) => {
                            const isSelected =
                              selected?.name === file.name &&
                              selected?.section === section.label;
                            return (
                              <button
                                key={file.name}
                                onClick={() =>
                                  setSelected({ ...file, section: section.label })
                                }
                                className={cn(
                                  "flex items-center gap-2.5 w-full text-left pl-7 pr-3 py-1.5 rounded-md text-sm transition-colors",
                                  isSelected
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                              >
                                <FileText
                                  className={cn(
                                    "w-3.5 h-3.5 shrink-0",
                                    isSelected
                                      ? "text-foreground"
                                      : SECTION_STYLE[section.label].dot.replace("bg-", "text-")
                                  )}
                                />
                                <span className="truncate">{prettify(file.name)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>

          {/* Preview */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {selected ? (
              <>
                <div className="px-4 md:px-8 py-3 border-b border-border shrink-0 flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      style?.badge
                    )}
                  >
                    {selected.section}
                  </span>
                  <h2 className="text-sm font-semibold text-foreground truncate">
                    {prettify(selected.name)}
                  </h2>
                  <span className="ml-auto text-xs text-muted-foreground font-mono hidden md:block">
                    {selected.name}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                  <div
                    className="docs-prose max-w-3xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: selected.html }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">
                  Select a document to preview
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
