export type SwipeCandidate = {
  id: string;
  displayName: string;
  headline: string;
  bio: string | null;
  location: string | null;
  photoUrl: string | null;
  expertiseLevel: string;
  availabilityStatus: string;
  openToRemote: boolean;
  openToRelocation: boolean;
  yearsExperience: number | null;
  careerField: { name: string; slug: string; icon: string | null };
  skills: { skill: { name: string }; level: string }[];
  workExperiences: {
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
  }[];
  educations: {
    institution: string;
    degree: string | null;
    field: string | null;
    startYear: number;
    endYear: number | null;
  }[];
};
