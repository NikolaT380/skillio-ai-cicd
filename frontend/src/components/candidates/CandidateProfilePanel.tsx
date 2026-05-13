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
  ExternalLink,
  ChevronRight
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

  const scoreColor = candidate.match_score > 0.6 ? '#2E7D32' : candidate.match_score > 0.4 ? '#E65100' : '#C62828';
  const scoreLabel = candidate.match_score > 0.6 ? 'Strong Match' : candidate.match_score > 0.4 ? 'Partial Match' : 'Weak Match';

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

  const statusOptions: Array<{ id: Candidate['status'], label: string, icon: any, color: string }> = [
    { id: 'submitted', label: 'Submitted', icon: Clock, color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
    { id: 'under_review', label: 'In Review', icon: Briefcase, color: 'hover:bg-warning/10 hover:text-warning hover:border-warning/30' },
    { id: 'recommended', label: 'Shortlist', icon: BadgeCheck, color: 'hover:bg-success/10 hover:text-success hover:border-success/30' },
    { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'hover:bg-error/10 hover:text-error hover:border-error/30' }
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-[100] flex flex-col overflow-hidden border-l border-gray-100"
    >
      {/* Header */}
      <div className="p-8 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
            <X size={24} />
          </button>
          <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Candidate DNA</span>
        </div>
        <div className="flex space-x-2">
          <button 
             onClick={() => onDelete(candidate.id)}
             className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        {/* Profile Info */}
        <section className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/20 mb-6">
            {candidate.full_name.charAt(0)}
          </div>
          <h2 className="text-3xl font-black text-primary">{candidate.full_name}</h2>
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-2 sm:space-y-0 mt-4 text-gray-400 font-bold">
            <div className="flex items-center"><Mail size={16} className="mr-2" /> {candidate.email}</div>
            {candidate.phone && <div className="flex items-center"><Phone size={16} className="mr-2" /> {candidate.phone}</div>}
          </div>
        </section>

        {/* Match Score Gauge */}
        <section className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 relative overflow-hidden">
          <div className="grid grid-cols-2 items-center">
            <div className="h-40 w-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  data={chartData} 
                  startAngle={180} 
                  endAngle={-180}
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
                    cornerRadius={10} 
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-primary">{(candidate.match_score * 100).toFixed(0)}%</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div className="pl-6">
              <h4 className="text-xl font-black text-primary mb-2 line-tight">{scoreLabel}</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Ranked purely on semantic alignment with the job's mandatory criteria and general requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Status Control */}
        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
            <ChevronRight size={14} className="mr-2 text-accent" /> Set Application Status
          </h4>
          <div className="grid grid-cols-3 gap-3">
             {statusOptions.map((status) => (
               <button 
                 key={status.id}

                 onClick={() => handleUpdateStatus(status.id)}
                 className={`
                   flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all font-bold gap-2 text-xs
                   ${candidate.status === status.id 
                     ? 'bg-primary text-white border-primary shadow-lg' 
                     : 'bg-white border-gray-100 text-gray-400 ' + status.color}
                 `}
               >
                 <status.icon size={20} />
                 {status.label}
               </button>
             ))}
          </div>
        </section>

        {/* Skills Tags */}
        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
            <ChevronRight size={14} className="mr-2 text-accent" /> Extracted Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map(skill => (
              <span key={skill} className="px-4 py-2 bg-accent/5 text-accent rounded-xl text-xs font-bold border border-accent/10">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Details Grid */}
        <section className="grid grid-cols-2 gap-6">
           <div className="card p-5 space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <Briefcase size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Experience</span>
              </div>
              <p className="font-bold text-primary">
                {candidate.experience_years} Years {candidate.experience_total_months ? `${candidate.experience_total_months % 12} Months` : ''}
              </p>
           </div>
           <div className="card p-5 space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <GraduationCap size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Education</span>
              </div>
              <p className="font-bold text-primary truncate" title={candidate.education || 'N/A'}>
                {candidate.education || 'No degree specified'}
              </p>
           </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex gap-4">
         <a 
          href={candidate.cv_url ? (/^https?:\/\//i.test(candidate.cv_url) ? candidate.cv_url : `${API_BASE_URL.replace(/\/$/, '')}/uploads/${candidate.cv_url}`) : '#'}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 btn-primary py-4 flex items-center justify-center"
         >
           <Download size={20} className="mr-2" /> Download CV
         </a>
         <button className="flex-1 px-4 py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center">
           Email Candidate <ExternalLink size={18} className="ml-2" />
         </button>
      </div>
    </motion.div>
  );
};

export default CandidateProfilePanel;
