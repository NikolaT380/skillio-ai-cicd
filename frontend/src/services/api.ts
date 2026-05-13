import type { JobPosting, JobUpdate, Candidate, AuthResponse, LoginRequest, RegisterRequest } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...authHeaders(),
});

export const api = {
  // Auth
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
    localStorage.removeItem('access_token');
  },

  // Jobs
  getJobs: async (): Promise<JobPosting[]> => {
    const res = await fetch(`${API_BASE_URL}/jobs`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  getJob: async (jobId: string): Promise<JobPosting> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch job');
    return res.json();
  },

  createJob: async (data: Omit<JobPosting, 'id' | 'creator_id' | 'created_at'>): Promise<JobPosting> => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  updateJob: async (jobId: string, data: JobUpdate): Promise<JobPosting> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update job');
    return res.json();
  },

  deleteJob: async (jobId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete job');
  },

  // Candidates
  getCandidatesForJob: async (jobId: string): Promise<Candidate[]> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  },

  getCandidate: async (candidateId: string): Promise<Candidate> => {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch candidate');
    return res.json();
  },

  deleteCandidate: async (candidateId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete candidate');
  },

  // Uploads
  uploadCV: async (file: File, jobId: string): Promise<Candidate> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', jobId);

    const res = await fetch(`${API_BASE_URL}/uploads/cv`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload CV');
    return res.json();
  },
};
