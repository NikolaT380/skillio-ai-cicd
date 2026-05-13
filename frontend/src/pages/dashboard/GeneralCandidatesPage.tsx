import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Loader2, 
  Download,
  Filter,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/api';
import type { Candidate } from '../../types';

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

  const filtered = candidates.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesThreshold = (c.match_score * 100) >= threshold;
    return matchesSearch && matchesThreshold;
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary">Candidate Database</h1>
          <p className="text-gray-500 font-medium mt-1">Cross-position talent pool overview.</p>
        </div>
        <button className="btn-accent px-8 py-4 flex items-center shadow-lg shadow-accent/20">
          <Download size={18} className="mr-2" /> Export All Data
        </button>
      </header>

      <div className="card p-4 flex items-center space-x-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, skills..."
            className="input-field pl-12 py-3 border-none shadow-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-8 w-px bg-gray-100"></div>
        <button className="flex items-center space-x-2 text-gray-400 font-bold hover:text-primary transition-colors pr-4">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Threshold Slider (Matches Nikola's design) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            AI Match Threshold
          </span>
          <span className="text-sm font-black text-accent">
            Showing: {filtered.length} / {candidates.length} candidates
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

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent" size={48} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Top Skills</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Avg. Score</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-background-alt transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm">
                           {c.full_name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-bold text-primary">{c.full_name}</p>
                           <p className="text-xs text-gray-400 font-medium">{c.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex gap-2">
                         {c.skills.slice(0, 3).map(s => (
                           <span key={s} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black uppercase text-gray-500">{s}</span>
                         ))}
                         {c.skills.length > 3 && <span className="text-[10px] font-black text-gray-300">+{c.skills.length - 3}</span>}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="font-black text-primary">{(c.match_score * 100).toFixed(0)}%</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Link 
                         to={`/dashboard/candidates/${c.id}`}
                         className="text-accent font-bold text-sm flex items-center ml-auto hover:underline"
                       >
                         View Details <ExternalLink size={14} className="ml-1.5" />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralCandidatesPage;
