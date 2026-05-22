"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Zap, Copy, CheckCheck, ChevronRight, Check
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  platform: string;
  caption: string;
  hashtags: string | null;
  mediaPath: string | null;
}

const INSTAGRAM_URL = "https://www.instagram.com/";
const LINKEDIN_URL = "https://www.linkedin.com/feed/";

function buildSteps(platform: string) {
  const steps = [];
  if (platform === "LINKEDIN" || platform === "BOTH") {
    steps.push(
      { id: "li-open", label: "Open LinkedIn", desc: "Opens the LinkedIn feed in your browser", action: "open-linkedin" },
      { id: "li-caption", label: "Copy caption", desc: "Caption copied to clipboard — paste it in LinkedIn", action: "copy-caption" },
      { id: "li-media", label: "Attach media", desc: "Add your media files then click Post", action: "media-hint" },
      { id: "li-confirm", label: "Confirm posted on LinkedIn", desc: "Mark LinkedIn as done", action: "confirm" },
    );
  }
  if (platform === "INSTAGRAM" || platform === "BOTH") {
    steps.push(
      { id: "ig-open", label: "Open Instagram", desc: "Opens Instagram in your browser", action: "open-instagram" },
      { id: "ig-caption", label: "Copy caption + hashtags", desc: "Full caption copied — paste it on Instagram", action: "copy-caption-hashtags" },
      { id: "ig-media", label: "Add media", desc: "Select your media files then publish", action: "media-hint" },
      { id: "ig-confirm", label: "Confirm posted on Instagram", desc: "Mark Instagram as done", action: "confirm" },
    );
  }
  return steps;
}

export function ExecuteModal({ post }: { post: Post }) {
  const router = useRouter();
  const { showToast } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const steps = buildSteps(post.platform);

  const handleStepAction = async (step: typeof steps[0], index: number) => {
    switch (step.action) {
      case "open-linkedin":
        window.open(LINKEDIN_URL, "_blank");
        break;
      case "open-instagram":
        window.open(INSTAGRAM_URL, "_blank");
        break;
      case "copy-caption":
        await navigator.clipboard.writeText(post.caption);
        showToast("Caption copied to clipboard!", "success");
        break;
      case "copy-caption-hashtags":
        const full = post.caption + (post.hashtags ? `\n\n${post.hashtags}` : "");
        await navigator.clipboard.writeText(full);
        showToast("Caption + hashtags copied!", "success");
        break;
      case "media-hint":
        if (post.mediaPath) {
          await navigator.clipboard.writeText(post.mediaPath);
          showToast("Media path copied!", "info");
        }
        break;
      case "confirm":
        break;
    }

    setCompleted((prev) => new Set(Array.from(prev).concat(index)));
    if (index < steps.length - 1) {
      setCurrentStep(index + 1);
    } else {
      await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "POSTED" }),
      });
      setDone(true);
      showToast("Post marked as published!", "success");
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCheck className="w-7 h-7 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">All done!</h3>
          <p className="text-sm text-muted-foreground">Post marked as Published.</p>
        </div>
        <button
          onClick={() => router.push("/library")}
          className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium rounded-md transition-colors"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post summary */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-foreground">{post.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.caption.slice(0, 120)}…</p>
          </div>
        </div>
      </div>

      {/* Clipboard quick-copy */}
      <div className="grid grid-cols-2 gap-2">
        <ClipButton label="Copy Caption" onClick={async () => {
          await navigator.clipboard.writeText(post.caption);
          showToast("Caption copied!", "success");
        }} />
        {post.hashtags && (
          <ClipButton label="Copy Hashtags" onClick={async () => {
            await navigator.clipboard.writeText(post.hashtags!);
            showToast("Hashtags copied!", "success");
          }} />
        )}
        {post.mediaPath && (
          <ClipButton label="Copy Media Path" onClick={async () => {
            await navigator.clipboard.writeText(post.mediaPath!);
            showToast("Media path copied!", "info");
          }} />
        )}
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Workflow</p>
        {steps.map((step, i) => {
          const isCompleted = completed.has(i);
          const isCurrent = i === currentStep && !isCompleted;
          const isLocked = i > currentStep && !isCompleted;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                isCompleted && "bg-emerald-500/5 border-emerald-500/15 opacity-60",
                isCurrent && "bg-primary/5 border-primary/20",
                isLocked && "bg-background border-border opacity-40"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all",
                isCompleted ? "bg-emerald-500/15 text-emerald-500" : isCurrent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", isCompleted ? "text-muted-foreground" : "text-foreground")}>{step.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{step.desc}</p>
              </div>
              {isCurrent && (
                <button
                  onClick={() => handleStepAction(step, i)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-md transition-colors shrink-0"
                >
                  {step.action === "confirm" ? "Mark done" : "Go"}
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClipButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [copied, setCopied] = useState(false);

  const handle = () => {
    onClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  );
}
