import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function relativeTime(isoDate: string): string {
  const d = Date.now() - new Date(isoDate).getTime();
  const m = Math.floor(d / 60_000);
  const h = Math.floor(d / 3_600_000);
  const dy = Math.floor(d / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${dy}d ago`;
}

export function eloLabel(elo: number): { label: string; color: string } {
  if (elo >= 2200) return { label: "Master", color: "text-yellow-400" };
  if (elo >= 2000) return { label: "Expert", color: "text-violet-400" };
  if (elo >= 1800) return { label: "Advanced", color: "text-primary" };
  if (elo >= 1600) return { label: "Intermediate", color: "text-sky-400" };
  return { label: "Beginner", color: "text-muted-foreground" };
}