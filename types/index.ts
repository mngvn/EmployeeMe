// Types used throughout the app
// In the MVP, data comes from lib/mock-data.ts rather than the database.

export type { MockCandidate, CareerField, ExpertiseLevel, Availability } from "@/lib/mock-data";

export type AIMatchScore = {
  score: number;
  rationale: string;
  highlights: string[];
  gaps: string[];
};

export type AIProfileTip = {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
};
