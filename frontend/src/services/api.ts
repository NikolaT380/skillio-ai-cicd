import type {JobPosting, Candidate} from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
  // Jobs
  getJobs: async (): Promise<JobPosting[]> => {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },
  
  createJob: async (data: Partial<JobPosting>): Promise<JobPosting> => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  // Candidates
  uploadCV: async (file: File, jobId: string): Promise<Candidate> => {
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('jobId', jobId);

    const res = await fetch(`${API_BASE_URL}/candidates/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload CV');
    return res.json();
  },

  getCandidatesForJob: async (jobId: string): Promise<Candidate[]> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates`);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  }
};
