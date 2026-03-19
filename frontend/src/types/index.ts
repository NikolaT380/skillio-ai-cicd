export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  mandatoryCriteria: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
  education: string;
  matchScore?: number;
}
