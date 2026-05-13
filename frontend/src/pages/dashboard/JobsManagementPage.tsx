import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Users,
  Calendar,
  X,
  Briefcase,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { Job, JobCreate } from '../../types';

const JobsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { jobs, fetchJobs, createJob, updateJob, deleteJob } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    mandatory_criteria: '',
    company_name: user?.full_name || 'Skillio AI Admin',
    location: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (user) {
      setNewJob(prev => ({ ...prev, company_name: user.full_name }));
    }
  }, [user]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newJob.title.length < 3) {
      toast.error('Job title must be at least 3 characters');
      return;
    }

    if (newJob.description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    const jobToCreate: JobCreate = {
      ...newJob,
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      mandatory_criteria: newJob.mandatory_criteria.split('\n').filter(r => r.trim()),
    };

    const success = await createJob(jobToCreate);
    if (success) {
      setIsModalOpen(false);
      setNewJob({ 
        title: '', 
        description: '', 
        requirements: '', 
        mandatory_criteria: '', 
        company_name: user?.full_name || 'Skillio AI Admin', 
        location: '' 
      });
    }
  };

  const openEditModal = (job: Job) => {
    setEditingJob({
      ...job,
      requirements: job.requirements,
      mandatory_criteria: job.mandatory_criteria,
    });
  };

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    const result = await updateJob(editingJob.id, {
      title: editingJob.title,
      description: editingJob.description,
      company_name: editingJob.company_name,
      location: editingJob.location,
      requirements: typeof editingJob.requirements === 'string'
        ? (editingJob.requirements as string).split('\n').filter(r => r.trim())
        : editingJob.requirements,
      mandatory_criteria: typeof editingJob.mandatory_criteria === 'string'
        ? (editingJob.mandatory_criteria as string).split('\n').filter(r => r.trim())
        : editingJob.mandatory_criteria,
    });
    if (result) setEditingJob(null);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary">Jobs Management</h1>
          <p className="text-gray-500 font-medium mt-1">Configure your active postings and requirements.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-accent flex items-center justify-center py-4 px-8 shadow-lg shadow-accent/20"
        >
          <Plus size={20} className="mr-2" />
          Create New Job
        </button>
      </header>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by title, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 py-4 shadow-subtle"
          />
        </div>
        <div className="flex space-x-3">
           <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-subtle flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black">
                {jobs.length}
              </div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Jobs</span>
           </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Job Title</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Applicants</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Timeline</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={job.id} 
                    className="group hover:bg-background-alt transition-colors"
                  >
                    <td className="px-8 py-6">
                      <p className="font-bold text-primary group-hover:text-accent transition-colors">{job.title}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{job.location}</p>
                    </td>
                    <td className="px-8 py-6 font-bold text-sm text-gray-500">
                      {job.company_name}
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-accent/5 text-accent rounded-lg font-black text-sm">
                        <Users size={14} />
                        <span>{job.applicant_count ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <Calendar size={14} className="mr-2 opacity-50" />
                        Posted {formatDistanceToNow(new Date(job.created_at))} ago
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <Link
                        to={`/dashboard/jobs/${job.id}/candidates`}
                        className="p-2.5 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all inline-block"
                        title="View Candidates"
                      >
                        <Users size={20} />
                      </Link>
                      <button
                        onClick={() => openEditModal(job)}
                        className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Edit Job"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(job.id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Job"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                      <Briefcase size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600">No jobs posted yet</h3>
                    <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium">Create your first job posting to start receiving AI-ranked candidates.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-primary mb-4">Are you absolutely sure?</h2>
              <p className="text-gray-500 leading-relaxed mb-8 font-medium">
                This will permanently delete the job and <span className="text-red-500 font-bold underline">all associated candidates</span>. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 px-6 py-4 rounded-xl border border-gray-200 font-bold text-primary hover:bg-gray-50 transition-all">Cancel</button>
                <button 
                  onClick={async () => {
                    await deleteJob(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                >
                  Yes, Delete Job
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm sticky-0"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-primary">Post New Position</h2>
                  <p className="text-gray-400 font-medium text-sm">Define requirements for AI semantic ranking.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateJob} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Job Title</label>
                    <input
                      required
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      className="input-field"
                      placeholder="e.g. Senior Policy Lead"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Location</label>
                    <input
                      required
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      className="input-field"
                      placeholder="Brussels, BE"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                  <div className="relative">
                    <textarea
                      required
                      rows={4}
                      value={newJob.description}
                      onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                      className="input-field min-h-[120px] pt-3"
                      placeholder="Outline the core mission of this role..."
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-300">
                      {newJob.description.length} chars
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">General Requirements</label>
                    <textarea
                      required
                      rows={5}
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                      className="input-field pt-3"
                      placeholder="One per line..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-accent">Mandatory Criteria</label>
                    <textarea
                      required
                      rows={5}
                      value={newJob.mandatory_criteria}
                      onChange={(e) => setNewJob({...newJob, mandatory_criteria: e.target.value})}
                      className="input-field pt-3 border-accent/30 focus:border-accent"
                      placeholder="Crucial qualifications..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 px-6 rounded-xl border border-gray-200 font-bold text-primary hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-2 py-4 px-12 btn-accent">Publish Posting</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Job Modal */}
      <AnimatePresence>
        {editingJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingJob(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-primary">Edit Position</h2>
                  <p className="text-gray-400 font-medium text-sm">Update job details and requirements.</p>
                </div>
                <button onClick={() => setEditingJob(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditJob} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Job Title</label>
                    <input
                      required
                      type="text"
                      value={editingJob.title}
                      onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Location</label>
                    <input
                      required
                      type="text"
                      value={editingJob.location}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                  <div className="relative">
                    <textarea
                      required
                      rows={4}
                      value={editingJob.description}
                      onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                      className="input-field min-h-[120px] pt-3"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-300">
                      {editingJob.description.length} chars
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">General Requirements</label>
                    <textarea
                      rows={5}
                      value={Array.isArray(editingJob.requirements) ? editingJob.requirements.join('\n') : editingJob.requirements}
                      onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value.split('\n') })}
                      className="input-field pt-3"
                      placeholder="One per line..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-accent">Mandatory Criteria</label>
                    <textarea
                      rows={5}
                      value={Array.isArray(editingJob.mandatory_criteria) ? editingJob.mandatory_criteria.join('\n') : editingJob.mandatory_criteria}
                      onChange={(e) => setEditingJob({ ...editingJob, mandatory_criteria: e.target.value.split('\n') })}
                      className="input-field pt-3 border-accent/30 focus:border-accent"
                      placeholder="Crucial qualifications..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setEditingJob(null)} className="flex-1 py-4 px-6 rounded-xl border border-gray-200 font-bold text-primary hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-2 py-4 px-12 btn-accent">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobsManagementPage;
