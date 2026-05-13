export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  mandatory_criteria: string[];
  company_name: string;
  location: string;
  created_at: string;
  applicant_count?: number;
  status?: 'active' | 'inactive';
}

export interface JobCreate {
  title: string;
  description: string;
  company_name: string;
  location: string;
  requirements: string[];
  mandatory_criteria: string[];
  company_name: string;
  location: string;
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
  experience_total_months?: number;
  education?: string;
  cv_url?: string;
  match_score: number;
  created_at: string;
  status: 'submitted' | 'under_review' | 'recommended' | 'rejected';
  raw_text?: string;
}

export interface CandidateStatusResponse {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  status: 'submitted' | 'under_review' | 'recommended' | 'rejected';
  created_at: string;
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

export interface StatCardData {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
}