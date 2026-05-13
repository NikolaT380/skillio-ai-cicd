import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  Search,
  Loader2,
  Users,
  CheckCircle2,
  Clock
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
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link to="/dashboard/jobs" className="text-gray-400 hover:text-accent font-bold text-sm flex items-center mb-4 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Back to Jobs
          </Link>
          <h1 className="text-3xl font-black text-primary">{job?.title || 'Candidates'}</h1>
          <p className="text-gray-500 font-medium mt-1">Reviewing {candidates.length} AI-ranked profiles.</p>
        </div>
        <div className="flex space-x-3">
           <button className="flex items-center px-6 py-3 rounded-xl border border-gray-200 font-bold text-primary hover:bg-white transition-all shadow-subtle">
             <Download size={18} className="mr-2" /> Export to CSV
           </button>
        </div>
      </header>

      {/* Threshold Slider */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            AI Match Threshold
          </span>
          <span className="text-sm font-black text-accent">
            Showing: {filteredCandidates.length} / {candidates.length} candidates
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-bold text-gray-400">0%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 h-2 rounded-full cursor-pointer accent-[var(--color-accent)]"
          />
          <span className="text-xs font-bold text-gray-400">100%</span>
          <div className="min-w-[60px] text-center px-3 py-1.5 bg-accent text-white rounded-lg font-black text-sm">
            {threshold}%
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-8 items-center border-b border-gray-100 pb-0">
        <div className="flex space-x-8 overflow-x-auto w-full md:w-auto">
          {(['All', 'Submitted', 'In Review', 'Recommended', 'Rejected'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-2 py-4 text-sm font-black uppercase tracking-widest relative transition-colors
                ${activeTab === tab ? 'text-accent' : 'text-gray-400 hover:text-primary'}
              `}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search candidates..."
            className="input-field pl-12 py-3 bg-transparent border-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Candidates Grid/Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Match Score</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCandidates.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedCandidate(c)}
                  className="group cursor-pointer hover:bg-background-alt transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-primary text-xs">
                      #{idx + 1}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                       <div className="w-10 h-10 rounded-xl bg-accent/5 text-accent flex items-center justify-center font-black text-sm">
                         {c.full_name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-bold text-primary">{c.full_name}</p>
                         <p className="text-xs text-gray-400 font-medium">{c.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.match_score * 100}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full ${c.match_score > 0.6 ? 'bg-success' : c.match_score > 0.4 ? 'bg-warning' : 'bg-error'}`}
                        />
                      </div>
                      <span className="text-sm font-black text-primary">{(c.match_score * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-sm font-bold text-gray-500 uppercase flex items-center">
                       <Clock size={14} className="mr-2 opacity-40" />
                       {formatDistanceToNow(new Date(c.created_at))} ago
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`
                      badge ${
                        c.status === 'recommended' ? 'bg-success/10 text-success' : 
                        c.status === 'rejected' ? 'bg-error/10 text-error' : 
                        c.status === 'under_review' ? 'bg-warning/10 text-warning' :
                        'bg-blue-50 text-blue-600'
                      }
                      opacity-0 group-hover:opacity-100 transition-opacity mr-4
                    `}>
                      {c.status === 'recommended' && <CheckCircle2 size={12} />}
                      {c.status === 'rejected' && <XCircle size={12} />}
                      {c.status === 'under_review' && <Briefcase size={12} />}
                      {c.status === 'submitted' && <Clock size={12} />}
                      <span>{c.status.replace('_', ' ').charAt(0).toUpperCase() + c.status.replace('_', ' ').slice(1)}</span>
                    </span>
                    <Link 
                      to={`/dashboard/candidates/${c.id}`}
                      onClick={(e) => e.stopPropagation()} 
                      className="btn-primary py-2 px-4 text-xs inline-block"
                    >
                      View Profile
                    </Link>
                  </td>

                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredCandidates.length === 0 && (
            <div className="text-center py-20">
               <Users className="mx-auto text-gray-200 mb-4" size={48} />
               <p className="text-gray-400 font-bold">No candidates found for this selection.</p>
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
              className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[90]"
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

const XCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
  </svg>
);

export default CandidatesListPage;