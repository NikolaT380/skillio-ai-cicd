export interface JobPosting {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  requirements: string[];
  mandatory_criteria: string[];
  creator_id?: string;
  created_at: string;
}

export interface JobUpdate {
  title?: string;
  description?: string;
  company_name?: string;
  location?: string;
  requirements?: string[];
  mandatory_criteria?: string[];
}

export interface Candidate {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience_years: number;
  education?: string;
  cv_url?: string;
  match_score: number;
  status?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
