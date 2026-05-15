import { useState, useCallback } from 'react';
import { jobService, candidateService } from '../services/api';
import type { Candidate } from '../types';
import toast from 'react-hot-toast';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobCandidates = useCallback(async (jobId: string) => {
    setLoading(true);
    try {
      const data = await jobService.getJobCandidates(jobId);
      setCandidates(data);
    } catch (error) {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadCV = async (
    jobId: string,
    file: File,
    metadata?: { full_name?: string; email?: string; phone?: string }
  ) => {
    try {
      const result = await candidateService.uploadCV(jobId, file, metadata);
      return result;
    } catch (error) {
      toast.error('Failed to submit application');
      throw error;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      await candidateService.deleteCandidate(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
      toast.success('Candidate removed');
      return true;
    } catch (error) {
      toast.error('Failed to remove candidate');
      return false;
    }
  };

  const fetchAllCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (error) {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  }, []);

  return { candidates, loading, fetchJobCandidates, fetchAllCandidates, uploadCV, deleteCandidate };
};
