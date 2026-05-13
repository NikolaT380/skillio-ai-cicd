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
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100"></div>)}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-gray-100"></div>
          <div className="h-96 bg-white rounded-2xl border border-gray-100"></div>
        </div>
      </div>
    );
  }

  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary">HR Intelligence Overview</h1>
          <p className="text-gray-500 font-medium mt-1">Real-time recruitment analytics and semantic insights.</p>
        </div>
        <div className="flex items-center space-x-3 text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-xl shadow-subtle border border-gray-100">
          <Clock size={16} />
          <span>Last updated: Just now</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-primary">Applications Pipeline</h3>
              <p className="text-sm text-gray-400 font-medium">Distribution across departments</p>
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Total Applications</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F6F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fontWeight: 700, fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC', radius: 4 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 800, color: '#1E3A5F' }}
                />
                <Bar dataKey="applications" barSize={48} radius={[8, 8, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1E3A5F' : '#2E75B6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-8 bg-primary text-white border-none shadow-xl shadow-primary/20 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black">Urgent Postings</h3>
            <Link to="/dashboard/jobs" className="text-accent text-sm font-bold bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-all">
              View All
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            {jobs.slice(0, 4).map((job, idx) => {
              const appCount = candidates.filter(c => c.job_id === job.id).length;
              return (
                <motion.div 
                  key={job.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Link to={`/dashboard/jobs/${job.id}/candidates`} className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="font-bold truncate group-hover:text-accent transition-colors">{job.title}</p>
                      <p className="text-xs text-white/40 mt-1">{job.location} • {appCount} applicants</p>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 pt-8 border-t border-white/5">
             <div className="flex items-center justify-between text-xs font-bold text-white/40 uppercase tracking-widest">
               <span>Capacity utilization</span>
               <span className="text-white">{jobs.length > 0 ? 'High' : 'Low'}</span>
             </div>
             <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: jobs.length > 0 ? '82%' : '10%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-accent shadow-[0_0_15px_rgba(46,117,182,0.5)]"
               ></motion.div>
             </div>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-primary">Recent Candidates</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Live application stream</p>
          </div>
          <Link to="/dashboard/candidates" className="text-accent text-sm font-bold flex items-center">
            Detailed Report <ExternalLink size={14} className="ml-1.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Target Position</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Match Strength</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Decision</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentCandidates.map((c, i) => {
                const job = jobs.find(j => j.id === c.job_id);
                return (
                  <tr key={c.id} className="group hover:bg-background-alt transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-primary text-sm shadow-sm group-hover:bg-accent group-hover:text-white transition-colors">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{c.full_name}</p>
                          <p className="text-xs text-gray-400 font-medium">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-600 truncate inline-block max-w-[200px]">{job?.title || 'Unknown Job'}</span>
                      <p className="text-[10px] font-black text-gray-300 uppercase mt-1">Applied {formatDistanceToNow(new Date(c.created_at))} ago</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${c.match_score * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={`h-full ${c.match_score > 0.6 ? 'bg-success' : c.match_score > 0.4 ? 'bg-warning' : 'bg-error'}`}
                          />
                        </div>
                        <span className="text-sm font-black text-primary">{(c.match_score * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`
                        badge ${
                          c.status === 'recommended' ? 'bg-success/10 text-success' : 
                          c.status === 'rejected' ? 'bg-error/10 text-error' : 
                          c.status === 'under_review' ? 'bg-warning/10 text-warning' :
                          'bg-blue-50 text-blue-600'
                        }
                      `}>
                        {c.status === 'recommended' && <CheckCircle2 size={12} />}
                        {c.status === 'rejected' && <XCircle size={12} />}
                        {c.status === 'under_review' && <Briefcase size={12} />}
                        {c.status === 'submitted' && <Clock size={12} />}
                        <span>{c.status.replace('_', ' ').charAt(0).toUpperCase() + c.status.replace('_', ' ').slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        to={`/dashboard/candidates/${c.id}`}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all inline-block"
                      >
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentCandidates.length === 0 && (
            <div className="text-center py-20">
               <Users className="mx-auto text-gray-200 mb-4" size={48} />
               <p className="text-gray-400 font-bold">No applications received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const XCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
  </svg>
);

export default Dashboard;
