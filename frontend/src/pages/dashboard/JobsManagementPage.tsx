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
  Pencil,
  MapPin
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
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-serif text-navy-900 mb-2 italic">Jobs Management</h1>
          <p className="text-text-admin-secondary font-semibold uppercase tracking-widest text-xs">Configure your active postings and requirements.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-accent flex items-center justify-center py-5 px-10 shadow-2xl shadow-blue-400/20 group animate-shimmer"
        >
          <Plus size={22} className="mr-3 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-black uppercase tracking-widest">Create New Job</span>
        </button>
      </header>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-admin-secondary group-focus-within:text-blue-400 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by title, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-16 py-5 shadow-cool text-sm font-medium"
          />
        </div>
        <div className="shrink-0">
           <div className="bg-white px-8 py-4 rounded-[2rem] border border-border shadow-cool flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center font-serif italic text-blue-400 text-xl shadow-xl">
                {jobs.length}
              </div>
              <div>
                <span className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] block mb-0.5">Active</span>
                <span className="text-sm font-extrabold text-navy-900 uppercase tracking-widest">Openings</span>
              </div>
           </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-white rounded-[2.5rem] border border-border shadow-cool overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-table-header">
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Job Title</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Department</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Applicants</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-admin">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={job.id} 
                    className="group hover:bg-table-header/50 transition-colors duration-200"
                  >
                    <td className="px-10 py-8">
                      <p className="font-bold text-navy-900 group-hover:text-blue-400 transition-colors text-sm">{job.title}</p>
                      <div className="flex items-center text-[10px] font-black text-text-admin-secondary uppercase tracking-widest mt-2 opacity-60">
                        <MapPin size={10} className="mr-1.5" /> {job.location}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-xs font-black uppercase tracking-widest text-text-admin-secondary">{job.company_name}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 bg-blue-400/12 text-navy-700 rounded-full font-black text-[10px] uppercase tracking-widest border border-blue-400/10">
                        <Users size={12} />
                        <span>{job.applicant_count ?? 0} APPLICANTS</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center text-[10px] font-black text-text-admin-secondary uppercase tracking-widest opacity-60">
                        <Calendar size={12} className="mr-2" />
                        Posted {formatDistanceToNow(new Date(job.created_at))} ago
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link
                        to={`/dashboard/jobs/${job.id}/candidates`}
                        className="w-10 h-10 inline-flex items-center justify-center text-text-admin-secondary hover:text-blue-400 hover:bg-blue-400/5 rounded-xl transition-all"
                        title="View Candidates"
                      >
                        <Users size={20} />
                      </Link>
                      <button
                        onClick={() => openEditModal(job)}
                        className="w-10 h-10 inline-flex items-center justify-center text-text-admin-secondary hover:text-navy-900 hover:bg-navy-900/5 rounded-xl transition-all"
                        title="Edit Job"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(job.id)}
                        className="w-10 h-10 inline-flex items-center justify-center text-error/60 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                        title="Delete Job"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center bg-bg-admin/20">
                    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-cool flex items-center justify-center mx-auto mb-8 text-text-admin-secondary/20">
                      <Briefcase size={48} />
                    </div>
                    <h3 className="text-xl font-serif text-navy-900 italic mb-2">No jobs posted yet</h3>
                    <p className="text-text-admin-secondary font-semibold uppercase tracking-widest text-[10px] max-w-xs mx-auto">Create your first job posting to start receiving AI-ranked candidates.</p>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-12 text-center border border-border"
            >
              <div className="w-24 h-24 bg-error/10 text-error rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-error/5">
                <AlertTriangle size={48} />
              </div>
              <h2 className="text-3xl font-serif text-navy-900 mb-4 italic">Confirm Deletion</h2>
              <p className="text-text-admin-secondary leading-relaxed mb-10 font-medium">
                This will permanently delete the job and <span className="text-error font-black uppercase tracking-widest text-xs">all associated candidates</span>. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 px-8 py-5 rounded-2xl border border-border font-black uppercase tracking-widest text-xs text-navy-900 hover:bg-bg-admin transition-all">Cancel</button>
                <button 
                  onClick={async () => {
                    await deleteJob(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="flex-1 px-8 py-5 rounded-2xl bg-error text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 shadow-2xl shadow-error/20 transition-all"
                >
                  Yes, Delete Job
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create/Edit Job Modal Shared Layout */}
      <AnimatePresence>
        {(isModalOpen || editingJob) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setEditingJob(null); }}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-border"
            >
              <div className="p-10 lg:p-12 border-b border-bg-admin flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif text-navy-900 mb-1 italic">{editingJob ? 'Edit Position' : 'Post New Position'}</h2>
                  <p className="text-text-admin-secondary font-black uppercase tracking-widest text-[10px]">Define requirements for AI semantic ranking.</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingJob(null); }} className="p-3 hover:bg-bg-admin rounded-2xl text-text-admin-secondary transition-colors">
                  <X size={28} />
                </button>
              </div>
              
              <form onSubmit={editingJob ? handleEditJob : handleCreateJob} className="p-10 lg:p-12 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Job Title</label>
                    <input
                      required
                      type="text"
                      value={editingJob ? editingJob.title : newJob.title}
                      onChange={(e) => editingJob ? setEditingJob({...editingJob, title: e.target.value}) : setNewJob({...newJob, title: e.target.value})}
                      className="input-field"
                      placeholder="e.g. Senior Policy Lead"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Location</label>
                    <input
                      required
                      type="text"
                      value={editingJob ? editingJob.location : newJob.location}
                      onChange={(e) => editingJob ? setEditingJob({...editingJob, location: e.target.value}) : setNewJob({...newJob, location: e.target.value})}
                      className="input-field"
                      placeholder="Brussels, BE"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Description</label>
                  <div className="relative">
                    <textarea
                      required
                      rows={4}
                      value={editingJob ? editingJob.description : newJob.description}
                      onChange={(e) => editingJob ? setEditingJob({...editingJob, description: e.target.value}) : setNewJob({...newJob, description: e.target.value})}
                      className="input-field min-h-[140px] pt-4"
                      placeholder="Outline the core mission of this role..."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">General Requirements</label>
                    <textarea
                      required
                      rows={6}
                      value={editingJob ? (Array.isArray(editingJob.requirements) ? editingJob.requirements.join('\n') : editingJob.requirements) : newJob.requirements}
                      onChange={(e) => editingJob ? setEditingJob({...editingJob, requirements: e.target.value.split('\n')}) : setNewJob({...newJob, requirements: e.target.value})}
                      className="input-field pt-4"
                      placeholder="One per line..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Mandatory Criteria</label>
                    <textarea
                      required
                      rows={6}
                      value={editingJob ? (Array.isArray(editingJob.mandatory_criteria) ? editingJob.mandatory_criteria.join('\n') : editingJob.mandatory_criteria) : newJob.mandatory_criteria}
                      onChange={(e) => editingJob ? setEditingJob({...editingJob, mandatory_criteria: e.target.value.split('\n')}) : setNewJob({...newJob, mandatory_criteria: e.target.value})}
                      className="input-field pt-4 border-blue-400/30 focus:border-blue-400"
                      placeholder="Crucial qualifications..."
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-10">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingJob(null); }} className="flex-1 py-5 px-8 rounded-2xl border border-border font-black uppercase tracking-widest text-xs text-navy-900 hover:bg-bg-admin transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] py-5 px-12 btn-accent uppercase tracking-widest text-xs font-black animate-shimmer">
                    {editingJob ? 'Save Changes' : 'Publish Posting'}
                  </button>
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
