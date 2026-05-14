import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "No date";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return isPast(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export type Platform = "INSTAGRAM" | "LINKEDIN" | "BOTH";
export type PostStatus = "DRAFT" | "SCHEDULED" | "READY" | "POSTED" | "ARCHIVED";

export const platformConfig: Record<Platform, { label: string; color: string; bg: string; gradient: string }> = {
  INSTAGRAM: {
    label: "Instagram",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    gradient: "from-purple-500 via-pink-500 to-orange-400",
  },
  LINKEDIN: {
    label: "LinkedIn",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    gradient: "from-blue-600 to-blue-400",
  },
  BOTH: {
    label: "Both",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    gradient: "from-blue-500 via-violet-500 to-pink-500",
  },
};

export const statusConfig: Record<PostStatus, { label: string; color: string; bg: string; dot: string }> = {
  DRAFT: {
    label: "Draft",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    dot: "bg-zinc-500",
  },
  SCHEDULED: {
    label: "Scheduled",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-500",
  },
  READY: {
    label: "Ready",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  POSTED: {
    label: "Posted",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    dot: "bg-blue-500",
  },
  ARCHIVED: {
    label: "Archived",
    color: "text-zinc-600",
    bg: "bg-zinc-700/10",
    dot: "bg-zinc-600",
  },
};
