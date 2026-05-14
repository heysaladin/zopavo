import { cn, statusConfig, platformConfig } from "@/lib/utils";
import type { PostStatus, Platform } from "@/lib/utils";

export function StatusBadge({ status }: { status: PostStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
      cfg.bg, cfg.color
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg = platformConfig[platform];
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
      cfg.bg, cfg.color
    )}>
      {cfg.label}
    </span>
  );
}
