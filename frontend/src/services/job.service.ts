import axiosInstance from './axiosInstance';
import type { Job, JobCreate, JobUpdate, Candidate } from '../types';

export const jobService = {
  getJobs: async (): Promise<Job[]> => {
    const response = await axiosInstance.get<Job[]>('/jobs/');
    return response.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await axiosInstance.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: JobCreate): Promise<Job> => {
    const response = await axiosInstance.post<Job>('/jobs/', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: JobUpdate): Promise<Job> => {
    const response = await axiosInstance.patch<Job>(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/jobs/${id}`);
  },

  getJobCandidates: async (jobId: string): Promise<Candidate[]> => {
    const response = await axiosInstance.get<Candidate[]>(`/jobs/${jobId}/candidates`);
    return response.data;
  },
};
