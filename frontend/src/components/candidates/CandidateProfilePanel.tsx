import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Download, 
  Trash2, 
  Clock, 
  BadgeCheck, 
  XCircle,
  Briefcase,
  GraduationCap,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  PolarAngleAxis 
} from 'recharts';
import type { Candidate } from '../../types';
import { candidateService } from '../../services/api';
import { API_BASE_URL } from '../../services/axiosInstance';
import toast from 'react-hot-toast';

interface CandidateProfilePanelProps {
  candidate: Candidate | null;
  onClose: () => void;
  onStatusChange: () => void;
  onDelete: (id: string) => void;
}

const CandidateProfilePanel: React.FC<CandidateProfilePanelProps> = ({ 
  candidate, 
  onClose, 
  onStatusChange,
  onDelete
}) => {
  if (!candidate) return null;

  const [isUpdating, setIsUpdating] = useState(false);

  const scoreColor = candidate.match_score > 0.6 ? '#10B981' : candidate.match_score > 0.4 ? '#F59E0B' : '#EF4444';
  const scoreLabel = candidate.match_score > 0.6 ? 'Exceptional Match' : candidate.match_score > 0.4 ? 'Qualified Fit' : 'Requires Review';

  const chartData = [
    { value: candidate.match_score * 100, fill: scoreColor }
  ];

  const handleUpdateStatus = async (newStatus: Candidate['status']) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await candidateService.updateCandidateStatus(candidate.id, newStatus);
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      onStatusChange();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleInterview = () => {
    if (!candidate) return;
    const subject = encodeURIComponent(`Interview Request - ${candidate.full_name}`);
    const body = encodeURIComponent(`Hi ${candidate.full_name},\n\nWe would like to schedule an interview with you regarding your application for the position.\n\nBest regards,\nRecruitment Team`);
    window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
  };

  const statusOptions: Array<{ id: Candidate['status'], label: string, icon: any, color: string }> = [
    { id: 'submitted', label: 'Submitted', icon: Clock, color: 'hover:bg-blue-400/5 hover:text-blue-400 hover:border-blue-400/20' },
    { id: 'under_review', label: 'In Review', icon: Briefcase, color: 'hover:bg-warning/10 hover:text-warning hover:border-warning/30' },
    { id: 'recommended', label: 'Shortlist', icon: BadgeCheck, color: 'hover:bg-success/10 hover:text-success hover:border-success/30' },
    { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'hover:bg-error/10 hover:text-error hover:border-error/30' }
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[100] flex flex-col overflow-hidden border-l border-border"
    >
      {/* Header */}
      <div className="p-8 border-b border-border flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-text-admin-secondary transition-colors group">
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-0.5">Intelligence Report</span>
            <span className="text-sm font-extrabold text-navy-900 uppercase tracking-widest">Candidate DNA</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
             onClick={() => onDelete(candidate.id)}
             className="p-3 text-error/40 hover:text-error hover:bg-error/5 rounded-2xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-24">
        {/* Profile Info */}
        <section className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-[2.5rem] bg-white border border-border flex items-center justify-center text-navy-900 font-semibold text-4xl shadow-cool mb-8 relative z-10">
              {candidate.full_name.charAt(0)}
            </div>
            <div className="absolute inset-0 bg-blue-400 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          </div>
          <h2 className="text-3xl font-semibold text-navy-900 mb-4">{candidate.full_name}</h2>
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center text-text-admin-secondary font-bold text-sm bg-slate-50 px-5 py-2 rounded-xl border border-border">
              <Mail size={16} className="mr-3 text-blue-600" /> {candidate.email}
            </div>
            {candidate.phone && (
              <div className="flex items-center text-text-admin-secondary font-bold text-sm bg-slate-50 px-5 py-2 rounded-xl border border-border">
                <Phone size={16} className="mr-3 text-blue-600" /> {candidate.phone}
              </div>
            )}
          </div>
        </section>

        {/* Match Score Gauge */}
        <section className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
            <TrendingUp size={24} className="text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="grid grid-cols-2 items-center">
            <div className="h-44 w-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  data={chartData} 
                  startAngle={90} 
                  endAngle={450}
                >
                  <PolarAngleAxis 
                    type="number" 
                    domain={[0, 100]} 
                    angleAxisId={0} 
                    tick={false} 
                  />
                  <RadialBar 
                    background 
                    dataKey="value" 
                    cornerRadius={20} 
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-semibold text-navy-900">{(candidate.match_score * 100).toFixed(0)}%</span>
                <span className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] mt-1">Accuracy</span>
              </div>
            </div>
            <div className="pl-8">
              <h4 className="text-xl font-semibold text-navy-900 mb-3">{scoreLabel}</h4>
              <p className="text-xs text-text-admin-secondary font-semibold leading-relaxed uppercase tracking-widest opacity-60">
                Ranked via semantic alignment with role criteria.
              </p>
            </div>
          </div>
        </section>

        {/* Status Control */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] flex items-center">
            <ChevronRight size={14} className="mr-3 text-blue-600" /> Decision Pipeline
          </h4>
          <div className="grid grid-cols-2 gap-4">
             {statusOptions.map((status) => (
               <button 
                 key={status.id}
                 onClick={() => handleUpdateStatus(status.id)}
                 className={`
                   flex items-center space-x-4 p-5 rounded-2xl border transition-all duration-300 text-left
                   ${candidate.status === status.id 
                     ? 'bg-white border-blue-600 shadow-glow ring-1 ring-blue-600 text-blue-600 scale-[1.02]' 
                     : 'bg-white border-border text-text-admin-secondary hover:border-slate-300 ' + status.color}
                 `}
               >
                 <status.icon size={20} className={candidate.status === status.id ? 'text-blue-600' : ''} />
                 <span className="font-extrabold uppercase tracking-widest text-[10px]">{status.label}</span>
               </button>
             ))}
          </div>
        </section>

        {/* Skills Tags */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] flex items-center">
            <ChevronRight size={14} className="mr-3 text-blue-600" /> Skill Matrix
          </h4>
          <div className="flex flex-wrap gap-3">
            {candidate.skills.map(skill => (
              <span key={skill} className="px-5 py-2.5 bg-white text-navy-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border shadow-sm hover:border-blue-600 hover:text-blue-600 transition-colors">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Details Grid */}
        <section className="grid grid-cols-2 gap-6">
           <div className="bg-slate-50/50 rounded-[2rem] border border-border p-6 space-y-3 shadow-sm">
              <div className="flex items-center space-x-3 text-blue-600">
                <Briefcase size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-admin-secondary">Experience</span>
              </div>
              <p className="font-semibold text-lg text-navy-900">
                {candidate.experience_years} Years
              </p>
           </div>
           <div className="bg-slate-50/50 rounded-[2rem] border border-border p-6 space-y-3 shadow-sm">
              <div className="flex items-center space-x-3 text-blue-600">
                <GraduationCap size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-admin-secondary">Academic</span>
              </div>
              <p className="font-semibold text-lg text-navy-900 truncate" title={candidate.education || 'N/A'}>
                {candidate.education ? candidate.education.split(' ').slice(0, 2).join(' ') + '...' : 'N/A'}
              </p>
           </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-10 border-t border-border bg-white/80 backdrop-blur-xl flex gap-6 absolute bottom-0 w-full z-20">
         <a 
          href={candidate.cv_url ? (/^https?:\/\//i.test(candidate.cv_url) ? candidate.cv_url : `${API_BASE_URL.replace(/\/$/, '')}/uploads/${candidate.cv_url}`) : '#'}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 btn-primary py-5 flex items-center justify-center"
         >
           <Download size={20} className="mr-3" /> <span className="text-xs font-black uppercase tracking-widest">Download CV</span>
         </a>
         <button 
           onClick={handleScheduleInterview}
           className="flex-1 px-6 py-5 rounded-2xl border border-border bg-white text-text-admin-secondary font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:text-navy-900 transition-all flex items-center justify-center"
         >
           Schedule Interview <Mail size={18} className="ml-3" />
         </button>
      </div>
    </motion.div>
  );
};

export default CandidateProfilePanel;
