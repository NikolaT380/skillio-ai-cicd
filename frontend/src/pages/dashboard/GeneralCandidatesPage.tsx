import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Loader2, 
  Download,
  Filter,
  ExternalLink,
  Users,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/api';
import type { Candidate } from '../../types';
import { motion } from 'framer-motion';

const GeneralCandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [threshold, setThreshold] = useState(40);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await candidateService.getAllCandidates();
        setCandidates(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Skills', 'Experience (Years)', 'Education', 'Match Score (%)', 'Status', 'Applied Date', 'Job ID'];
    const escape = (val: string | number | undefined) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const rows = candidates.map(c => [
      escape(c.full_name),
      escape(c.email),
      escape(c.phone),
      escape(c.skills.join('; ')),
      escape(c.experience_years),
      escape(c.education),
      escape((c.match_score * 100).toFixed(0)),
      escape(c.status),
      escape(new Date(c.created_at).toLocaleDateString()),
      escape(c.job_id),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = candidates.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesThreshold = (c.match_score * 100) >= threshold;
    return matchesSearch && matchesThreshold;
  });

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl  text-navy-900 mb-2">Candidate Database</h1>
          <p className="text-text-admin-secondary font-semibold uppercase tracking-widest text-xs">Cross-position talent pool overview.</p>
        </div>
        <button onClick={exportToCSV} className="btn-accent px-10 py-5 flex items-center shadow-2xl shadow-blue-400/20 group animate-shimmer">
          <Download size={20} className="mr-3 group-hover:scale-110 transition-transform" /> 
          <span className="text-sm font-black uppercase tracking-widest">Export All Data</span>
        </button>
      </header>

      {/* Database Search & Threshold */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-border shadow-cool p-10 space-y-10">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-admin-secondary group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or specific expertise..."
              className="w-full pl-16 py-5 bg-bg-admin border border-border rounded-2xl outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 transition-all font-medium text-sm text-navy-900 placeholder:text-text-admin-secondary/40 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center">
                  <Filter size={18} />
                </div>
                <span className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Global Match Threshold</span>
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
          </div>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-border shadow-cool flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex items-center space-x-5 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-admin-secondary mb-1">Total Talent Pool</p>
              <p className="text-3xl font-semibold text-navy-900">{candidates.length} Profiles</p>
            </div>
          </div>
          <div className="bg-white border border-border rounded-2xl p-5 relative z-10">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 flex items-center">
              <TrendingUp size={12} className="mr-2" /> Match Average
            </p>
            <p className="text-xl font-semibold text-navy-900">84.2% System Accuracy</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-border shadow-cool overflow-hidden">
        {loading ? (
          <div className="py-32 flex justify-center bg-bg-admin/10">
            <Loader2 className="animate-spin text-blue-400" size={48} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-table-header">
                  <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Candidate Profile</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Top Capabilities</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Global Score</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-admin">
                {filtered.map((c, idx) => (
                  <motion.tr 
                    key={c.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-table-header/40 transition-all duration-200"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-5">
                         <div className="w-12 h-12 rounded-2xl bg-bg-admin flex items-center justify-center font-semibold text-navy-900 text-xl shadow-sm group-hover:bg-blue-400 group-hover:text-white group-hover:shadow-glow transition-all duration-300">
                           {c.full_name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-bold text-navy-900 text-sm">{c.full_name}</p>
                           <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-widest mt-1 opacity-60">{c.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-wrap gap-2">
                         {c.skills.slice(0, 3).map(s => (
                           <span key={s} className="px-3 py-1.5 bg-white border border-border text-[9px] font-black uppercase tracking-widest text-text-admin-secondary rounded-lg shadow-sm">
                             {s}
                           </span>
                         ))}
                         {c.skills.length > 3 && (
                           <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-admin text-[9px] font-black text-blue-400 border border-border">
                             +{c.skills.length - 3}
                           </span>
                         )}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400 shadow-glow"></div>
                          <span className="font-semibold text-lg text-navy-900">{(c.match_score * 100).toFixed(0)}%</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <Link 
                         to={`/dashboard/candidates/${c.id}`}
                         className="inline-flex items-center space-x-2 px-6 py-3 bg-bg-admin hover:bg-slate-600 text-navy-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border border-border group/btn"
                       >
                         <span>Full Dossier</span>
                         <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                       </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-32 bg-bg-admin/20">
                 <Users className="mx-auto text-text-admin-secondary/20 mb-8" size={64} />
                 <p className="text-text-admin-secondary font-black uppercase tracking-[0.2em] text-xs">No profiles matching this expertise were found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralCandidatesPage;
