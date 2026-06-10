import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatExpertiseLevel(level: string): string {
  const labels: Record<string, string> = {
    INTERN: "Intern",
    ENTRY: "Entry Level",
    MID: "Mid Level",
    SENIOR: "Senior",
    LEAD: "Lead",
    PRINCIPAL: "Principal / Staff",
    EXECUTIVE: "Executive",
  };
  return labels[level] ?? level;
}

export function formatAvailability(status: string): string {
  const labels: Record<string, string> = {
    OPEN: "Open to Work",
    PASSIVE: "Passively Looking",
    NOT_LOOKING: "Not Looking",
  };
  return labels[status] ?? status;
}

export function availabilityColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: "bg-green-100 text-green-800",
    PASSIVE: "bg-yellow-100 text-yellow-800",
    NOT_LOOKING: "bg-gray-100 text-gray-600",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function expertiseColor(level: string): string {
  const colors: Record<string, string> = {
    INTERN: "bg-blue-50 text-blue-700",
    ENTRY: "bg-blue-100 text-blue-800",
    MID: "bg-indigo-100 text-indigo-800",
    SENIOR: "bg-purple-100 text-purple-800",
    LEAD: "bg-violet-100 text-violet-800",
    PRINCIPAL: "bg-fuchsia-100 text-fuchsia-800",
    EXECUTIVE: "bg-rose-100 text-rose-800",
  };
  return colors[level] ?? "bg-gray-100 text-gray-600";
}
