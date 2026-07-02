"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPELINE_STEPS, stepNum } from "@/lib/pipeline";

/**
 * Horizontal 8-step pipeline indicator.
 * Steps before `current` render as completed, `current` is highlighted,
 * later steps are muted. Every step is a link to its phase page.
 */
export function PipelineStepper({
  current,
  className,
}: {
  current: number;
  className?: string;
}) {
  return (
    <nav
      aria-label="Pipeline steps"
      className={cn("flex items-center overflow-x-auto pb-1", className)}
    >
      {PIPELINE_STEPS.map((step, i) => {
        const isDone = step.num < current;
        const isCurrent = step.num === current;
        return (
          <div key={step.id} className="flex items-center shrink-0">
            {i > 0 && (
              <div
                className={cn(
                  "w-4 md:w-7 h-px mx-1",
                  step.num <= current ? "bg-foreground/40" : "bg-border"
                )}
              />
            )}
            <Link
              href={step.href}
              title={`${stepNum(step.num)} — ${step.label}`}
              className={cn(
                "group flex items-center gap-1.5 rounded-full transition-colors",
                isCurrent
                  ? cn("pl-1 pr-3 py-1 border", step.color.bg, step.color.border)
                  : "p-1 hover:bg-accent"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold font-mono shrink-0 transition-colors",
                  isCurrent && cn(step.color.solid, "text-white"),
                  isDone && "bg-foreground/80 text-background",
                  !isCurrent && !isDone &&
                    "border border-border text-muted-foreground group-hover:text-foreground"
                )}
              >
                {isDone ? <Check className="w-3 h-3" /> : step.num}
              </span>
              {isCurrent && (
                <span className={cn("text-xs font-medium whitespace-nowrap", step.color.text)}>
                  {step.label}
                </span>
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
