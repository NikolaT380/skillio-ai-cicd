import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  Search,
  Loader2,
  Users,
  Clock,
  Filter
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useCandidates } from '../../hooks/useCandidates';
import CandidateProfilePanel from '../../components/candidates/CandidateProfilePanel';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { Candidate, Job } from '../../types';

type TabType = 'All' | 'Submitted' | 'In Review' | 'Recommended' | 'Rejected';

const CandidatesListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getJob } = useJobs();
  const { candidates, loading, fetchJobCandidates, deleteCandidate } = useCandidates();

  const [job, setJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [threshold, setThreshold] = useState(40);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const jobData = await getJob(id);
      setJob(jobData);
      await fetchJobCandidates(id);
    };
    load();
  }, [id, getJob, fetchJobCandidates]);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const tabToStatusMap: Record<string, string> = {
      'Submitted': 'submitted',
      'In Review': 'under_review',
      'Recommended': 'recommended',
      'Rejected': 'rejected'
    };
    const matchesTab = activeTab === 'All' || c.status === tabToStatusMap[activeTab];
    const matchesThreshold = (c.match_score * 100) >= threshold;
    return matchesSearch && matchesTab && matchesThreshold;
  }).sort((a, b) => b.match_score - a.match_score);

  if (loading && candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <Link to="/dashboard/jobs" className="text-text-admin-secondary hover:text-navy-900 font-extrabold text-[10px] uppercase tracking-[0.2em] flex items-center mb-6 transition-colors group">
            <ChevronLeft size={14} className="mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Openings
          </Link>
          <h1 className="text-4xl  text-navy-900 mb-2">{job?.title || 'Candidates'}</h1>
          <p className="text-text-admin-secondary font-semibold uppercase tracking-widest text-xs">Reviewing {candidates.length} AI-ranked profiles.</p>
        </div>
        <div className="flex space-x-3">
           <button className="flex items-center px-8 py-4 rounded-2xl bg-white border border-border font-black text-[10px] uppercase tracking-widest text-navy-900 hover:bg-bg-admin transition-all shadow-cool">
             <Download size={18} className="mr-3 text-blue-400" /> Export to CSV
           </button>
        </div>
      </header>

      {/* Threshold Slider & Filters */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-border shadow-cool p-10 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center">
                <Filter size={18} />
              </div>
              <span className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">
                AI Match Threshold
              </span>
            </div>
            <div className="px-5 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-semibold text-lg shadow-sm">
              {threshold}%
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-[10px] font-black text-text-admin-secondary/40">0%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="flex-1 h-3 bg-bg-admin rounded-full cursor-pointer accent-blue-400 appearance-none shadow-inner"
            />
            <span className="text-[10px] font-black text-text-admin-secondary/40">100%</span>
          </div>
          <p className="mt-8 text-xs font-semibold text-text-admin-secondary text-center">
            Currently displaying <span className="text-navy-900 font-black">{filteredCandidates.length}</span> out of <span className="text-navy-900 font-black">{candidates.length}</span> applicants meeting this precision level.
          </p>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-border shadow-cool flex flex-col h-full justify-center">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-admin-secondary">Application Volume</p>
              <p className="text-2xl font-semibold text-navy-900">{candidates.length} Profiles</p>
            </div>
          </div>
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="h-full bg-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-10 items-center border-b border-border pb-0 relative">
        <div className="flex space-x-10 overflow-x-auto w-full lg:w-auto px-2">
          {(['All', 'Submitted', 'In Review', 'Recommended', 'Rejected'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-2 py-6 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all duration-300
                ${activeTab === tab ? 'text-blue-400' : 'text-text-admin-secondary hover:text-navy-900'}
              `}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-full shadow-glow" />
              )}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-admin-secondary group-focus-within:text-blue-400 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or credentials..."
            className="w-full pl-16 py-6 bg-transparent outline-none text-sm font-semibold text-navy-900 placeholder:text-text-admin-secondary/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-[2.5rem] border border-border shadow-cool overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-table-header">
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Rank</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Candidate Profile</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">AI Match Score</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Application Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-admin">
              {filteredCandidates.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedCandidate(c)}
                  className="group cursor-pointer hover:bg-table-header/40 transition-all duration-200"
                >
                  <td className="px-10 py-8">
                    <div className="w-10 h-10 rounded-xl bg-bg-admin flex items-center justify-center font-semibold text-navy-900 text-sm shadow-sm">
                      #{idx + 1}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-5">
                       <div className="w-12 h-12 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center font-semibold text-xl shadow-sm group-hover:shadow-glow group-hover:scale-105 transition-all">
                         {c.full_name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-bold text-navy-900 text-sm">{c.full_name}</p>
                         <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-widest mt-1 opacity-60">{c.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-32 h-2.5 bg-bg-admin rounded-full overflow-hidden p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.match_score * 100}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${c.match_score > 0.6 ? 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.3)]' : c.match_score > 0.4 ? 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}
                        />
                      </div>
                      <span className="text-xs font-black text-navy-900">{(c.match_score * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center text-[10px] font-black text-text-admin-secondary uppercase tracking-widest opacity-60">
                       <Clock size={12} className="mr-2" />
                       {formatDistanceToNow(new Date(c.created_at))} ago
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right flex items-center justify-end space-x-6">
                    <span className={`
                      badge-status ${
                        c.status === 'recommended' ? 'bg-success/10 text-success' : 
                        c.status === 'rejected' ? 'bg-error/10 text-error' : 
                        c.status === 'under_review' ? 'bg-warning/10 text-warning' :
                        'bg-blue-400/12 text-navy-700'
                      }
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    `}>
                      <span className="uppercase tracking-widest text-[9px]">{c.status.replace('_', ' ')}</span>
                    </span>
                    <button 
                      className="btn-primary py-3 px-6 text-[10px] uppercase tracking-widest shadow-cool opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      View Profile
                    </button>
                  </td>

                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredCandidates.length === 0 && (
            <div className="text-center py-32 bg-bg-admin/20">
               <Users className="mx-auto text-text-admin-secondary/20 mb-8" size={64} />
               <p className="text-text-admin-secondary font-black uppercase tracking-[0.2em] text-xs">No matching profiles found for this criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90]"
            />
            <CandidateProfilePanel
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
              onStatusChange={() => {
                if (id) fetchJobCandidates(id);
              }}
              onDelete={async (cid) => {
                if (window.confirm('Are you sure you want to delete this candidate?')) {
                  await deleteCandidate(cid);
                  setSelectedCandidate(null);
                }
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidatesListPage;
