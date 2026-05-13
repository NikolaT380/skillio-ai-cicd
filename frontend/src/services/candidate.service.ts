import axiosInstance from './axiosInstance';
import type { Candidate, CandidateStatusResponse } from '../types';

export const candidateService = {
  uploadCV: async (
    jobId: string, 
    file: File, 
    metadata?: { full_name?: string; email?: string; phone?: string }
  ): Promise<Candidate> => {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('file', file);
    
    if (metadata?.full_name) formData.append('full_name', metadata.full_name);
    if (metadata?.email) formData.append('email', metadata.email);
    if (metadata?.phone) formData.append('phone', metadata.phone);
    
    const response = await axiosInstance.post<Candidate>('/uploads/cv', formData);
    
    return response.data;
  },

  getCandidates: async (jobId?: string): Promise<Candidate[]> => {
    const response = await axiosInstance.get<Candidate[]>('/candidates/', {
      params: jobId ? { job_id: jobId } : {},
    });
    return response.data;
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    const response = await axiosInstance.get<Candidate>(`/candidates/${id}/`);
    return response.data;
  },

  deleteCandidate: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/candidates/${id}/`);
  },

  getCandidateStatus: async (email: string): Promise<CandidateStatusResponse> => {
    const response = await axiosInstance.get<CandidateStatusResponse>(`/candidates/status/`, { params: { email } });
    return response.data;
  },

  getAllCandidates: async (): Promise<Candidate[]> => {
    const response = await axiosInstance.get('/candidates/');
    return response.data;
  },

  updateCandidateStatus: async (id: string, status: Candidate['status']): Promise<void> => {
    await axiosInstance.patch(`/candidates/${id}/status/`, { status });
  },
};
