import { useState, useCallback } from 'react';
import { jobService } from '../services/api';
import type { Job, JobCreate } from '../types';
import toast from 'react-hot-toast';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getJob = useCallback(async (id: string) => {
    try {
      return await jobService.getJob(id);
    } catch (error) {
      toast.error('Failed to fetch job details');
      return null;
    }
  }, []);

  const createJob = useCallback(async (jobData: JobCreate) => {
    try {
      const newJob = await jobService.createJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      toast.success('Job created successfully');
      return newJob;
    } catch (error) {
      toast.error('Failed to create job');
      return null;
    }
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    try {
      await jobService.deleteJob(id);
      setJobs(prev => prev.filter(job => job.id !== id));
      toast.success('Job deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete job');
      return false;
    }
  }, []);

  return { jobs, loading, fetchJobs, getJob, createJob, deleteJob };
};