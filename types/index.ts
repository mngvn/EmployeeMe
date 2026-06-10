import type {
  User,
  EmployeeProfile,
  EmployerProfile,
  CareerField,
  Skill,
  ProfileSkill,
  WorkExperience,
  Education,
  HiringSignal,
  Message,
  Role,
  ExpertiseLevel,
  Availability,
  Visibility,
  SkillLevel,
} from "@/app/generated/prisma/client";

export type {
  User,
  EmployeeProfile,
  EmployerProfile,
  CareerField,
  Skill,
  ProfileSkill,
  WorkExperience,
  Education,
  HiringSignal,
  Message,
  Role,
  ExpertiseLevel,
  Availability,
  Visibility,
  SkillLevel,
};

export type EmployeeProfileWithRelations = EmployeeProfile & {
  user: Pick<User, "id" | "email">;
  careerField: CareerField;
  skills: (ProfileSkill & { skill: Skill })[];
  workExperiences: WorkExperience[];
  educations: Education[];
};

export type EmployerProfileWithRelations = EmployerProfile & {
  user: Pick<User, "id" | "email">;
  hiringSignals: HiringSignal[];
};

export type CandidateCard = Pick<
  EmployeeProfile,
  | "id"
  | "displayName"
  | "headline"
  | "location"
  | "photoUrl"
  | "expertiseLevel"
  | "availabilityStatus"
  | "openToRemote"
  | "yearsExperience"
> & {
  careerField: Pick<CareerField, "name" | "slug">;
  skills: { skill: Pick<Skill, "name"> }[];
};

export type SearchFilters = {
  careerFieldSlug?: string;
  expertiseLevel?: ExpertiseLevel[];
  availability?: Availability[];
  skills?: string[];
  openToRemote?: boolean;
  openToRelocation?: boolean;
  minYearsExperience?: number;
  maxYearsExperience?: number;
  location?: string;
  query?: string;
};

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

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      name?: string | null;
      image?: string | null;
    };
  }
}
