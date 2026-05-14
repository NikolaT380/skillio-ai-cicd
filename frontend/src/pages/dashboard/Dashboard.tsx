import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useJobs } from '../../hooks/useJobs';
import { useCandidates } from '../../hooks/useCandidates';
import StatCard from '../../components/common/StatCard';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const { jobs, loading: jobsLoading, fetchJobs } = useJobs();
  const { candidates, loading: candidatesLoading, fetchAllCandidates } = useCandidates();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchJobs(), fetchAllCandidates()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchJobs, fetchAllCandidates]);

  const totalApplications = candidates.length;
  const recommendedCount = candidates.filter(c => c.status === 'recommended').length;
  const avgMatchScore = candidates.length > 0 
    ? candidates.reduce((acc, c) => acc + c.match_score, 0) / candidates.length 
    : 0;
  const activeJobs = jobs.length;

  const chartData = jobs.slice(0, 6).map((job) => ({
    name: job.title.split(' ')[0],
    fullName: job.title,
    applications: candidates.filter(c => c.job_id === job.id).length
  }));

  if (loading || jobsLoading || candidatesLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-96 bg-white border border-border rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-border"></div>)}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[450px] bg-white rounded-3xl border border-border"></div>
          <div className="h-[450px] bg-white rounded-3xl border border-border"></div>
        </div>
      </div>
    );
  }

  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-navy-900 mb-2 italic">HR Intelligence Overview</h1>
          <p className="text-text-admin-secondary font-semibold uppercase tracking-widest text-xs">Real-time recruitment analytics and semantic insights.</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-admin-secondary bg-white px-5 py-3 rounded-2xl shadow-cool border border-border">
          <Clock size={14} className="text-blue-400" />
          <span>Last updated: Just now</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Candidates" 
          value={totalApplications} 
          icon={Users} 
        />
        <StatCard 
          title="Shortlisted" 
          value={recommendedCount} 
          icon={CheckCircle2} 
        />
        <StatCard 
          title="Avg. Match Score" 
          value={`${(avgMatchScore * 100).toFixed(0)}%`} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Active Openings" 
          value={activeJobs} 
          icon={Briefcase} 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-border shadow-cool p-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-serif text-navy-900 mb-1 italic">Applications Pipeline</h3>
              <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Distribution across departments</p>
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2 text-[10px] font-black text-navy-900 bg-bg-admin px-4 py-2 rounded-xl border border-border">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-glow"></div>
                <span className="uppercase tracking-widest">Live Flow</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#E4EAF0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#5A7A9A', letterSpacing: '0.1em' }} 
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#5A7A9A' }} />
                <Tooltip 
                  cursor={{ fill: '#F0F4F8', radius: 12 }}
                  contentStyle={{ borderRadius: '24px', border: '1px solid #E4EAF0', boxShadow: '0 20px 40px -10px rgba(13,27,42,0.15)', padding: '16px' }}
                  itemStyle={{ fontWeight: 800, color: '#0D1B2A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  labelStyle={{ fontWeight: 800, color: '#4A90D9', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="applications" barSize={40} radius={[12, 12, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1E3A5F' : '#4A90D9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-border shadow-cool p-10 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-2xl font-serif italic text-navy-900">Urgent Postings</h3>
            <Link to="/dashboard/jobs" className="p-2 bg-bg-admin rounded-xl hover:bg-slate-100 transition-all group">
              <ExternalLink size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4 flex-1 relative z-10">
            {jobs.slice(0, 4).map((job, idx) => {
              const appCount = candidates.filter(c => c.job_id === job.id).length;
              return (
                <motion.div 
                  key={job.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group cursor-pointer p-5 rounded-2xl bg-bg-admin border border-border hover:bg-white hover:border-blue-400/30 hover:shadow-cool transition-all duration-300"
                >
                  <Link to={`/dashboard/jobs/${job.id}/candidates`} className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate text-navy-900 group-hover:text-blue-600 transition-colors tracking-wide">{job.title}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-admin-secondary mt-2">{job.location} • {appCount} applicants</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-border group-hover:bg-blue-400 group-hover:border-blue-400 transition-colors shadow-sm">
                      <ChevronRight size={16} className="text-text-admin-secondary group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-10 pt-10 border-t border-border relative z-10">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-text-admin-secondary">
               <span>Capacity utilization</span>
               <span className="text-blue-600">{jobs.length > 0 ? 'High' : 'Low'}</span>
             </div>
             <div className="w-full h-2.5 bg-bg-admin rounded-full mt-4 overflow-hidden p-0.5 border border-border">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: jobs.length > 0 ? '82%' : '10%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-blue-400 rounded-full shadow-glow"
               ></motion.div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-border shadow-cool overflow-hidden">
        <div className="p-10 border-b border-bg-admin flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-serif text-navy-900 mb-1 italic">Recent Candidates</h3>
            <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Live application stream</p>
          </div>
          <Link to="/dashboard/candidates" className="btn-primary py-3 text-xs uppercase tracking-[0.15em]">
            Detailed Report
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-admin">
                <th className="px-10 py-5 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Name</th>
                <th className="px-10 py-5 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Position</th>
                <th className="px-10 py-5 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Match Strength</th>
                <th className="px-10 py-5 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-5 text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-admin">
              {recentCandidates.map((c, i) => {
                const job = jobs.find(j => j.id === c.job_id);
                return (
                  <tr key={c.id} className="group hover:bg-bg-admin/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 rounded-2xl bg-bg-admin flex items-center justify-center font-serif italic text-navy-900 text-xl shadow-sm group-hover:bg-blue-400 group-hover:text-white group-hover:shadow-glow transition-all duration-300">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-navy-900 text-sm">{c.full_name}</p>
                          <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-widest mt-1">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="font-bold text-text-admin-secondary text-sm truncate inline-block max-w-[200px]">{job?.title || 'Unknown Job'}</span>
                      <p className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest mt-1.5 flex items-center">
                        <Clock size={10} className="mr-1.5" /> {formatDistanceToNow(new Date(c.created_at))} ago
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-28 h-2.5 bg-bg-admin rounded-full overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${c.match_score * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={`h-full rounded-full ${c.match_score > 0.6 ? 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.3)]' : c.match_score > 0.4 ? 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}
                          />
                        </div>
                        <span className="text-xs font-black text-navy-900 tracking-tighter">{(c.match_score * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`
                        badge-status ${
                          c.status === 'recommended' ? 'bg-success/10 text-success' : 
                          c.status === 'rejected' ? 'bg-error/10 text-error' : 
                          c.status === 'under_review' ? 'bg-warning/10 text-warning' :
                          'bg-blue-400/12 text-navy-700'
                        }
                      `}>
                        <span className="uppercase tracking-[0.1em]">{c.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <Link 
                        to={`/dashboard/candidates/${c.id}`}
                        className="w-10 h-10 inline-flex items-center justify-center text-text-admin-secondary hover:text-blue-400 hover:bg-blue-400/5 rounded-xl transition-all"
                      >
                        <Eye size={22} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentCandidates.length === 0 && (
            <div className="text-center py-24 bg-bg-admin/20">
               <Users className="mx-auto text-text-admin-secondary/20 mb-6" size={64} />
               <p className="text-text-admin-secondary font-black uppercase tracking-[0.2em] text-xs">No active applications detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
