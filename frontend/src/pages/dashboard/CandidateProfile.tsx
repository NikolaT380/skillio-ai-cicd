import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  GraduationCap,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  PolarAngleAxis 
} from 'recharts';
import toast from 'react-hot-toast';
import { candidateService } from '../../services/api';
import { API_BASE_URL } from '../../services/axiosInstance';
import type { Candidate } from '../../types';

const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      try {
        const data = await candidateService.getCandidate(id);
        setCandidate(data);
      } catch (error) {
        toast.error('Failed to load candidate profile');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: Candidate['status']) => {
    if (!id || !candidate || isUpdating) return;
    setIsUpdating(true);
    try {
      await candidateService.updateCandidateStatus(id, newStatus);
      setCandidate({ ...candidate, status: newStatus });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will permanently delete this candidate profile.')) {
      try {
        if (id) {
          await candidateService.deleteCandidate(id);
          toast.success('Candidate deleted');
          navigate(-1);
        }
      } catch (error) {
        toast.error('Failed to delete candidate');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  if (!candidate) return null;

  const chartData = [
    { name: 'Score', value: candidate.match_score * 100, fill: candidate.match_score > 0.6 ? '#10B981' : candidate.match_score > 0.4 ? '#F59E0B' : '#EF4444' }
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-text-admin-secondary hover:text-navy-900 transition-colors group font-black text-[10px] uppercase tracking-[0.2em]">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Return to Pipeline
        </button>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select 
              value={candidate.status}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value as Candidate['status'])}
              className="appearance-none bg-white border border-border rounded-xl px-6 py-3.5 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-cool cursor-pointer transition-all outline-none"
            >
              <option value="submitted">Submitted</option>
              <option value="under_review">In Review</option>
              <option value="recommended">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-admin-secondary">
              <Clock size={16} />
            </div>
          </div>
          <button 
            onClick={handleDelete}
            className="p-3.5 text-error/40 hover:text-error hover:bg-error/5 rounded-xl border border-border transition-all shadow-cool"
            title="Delete Candidate"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Personal Info & AI Analysis */}
        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-cool text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-navy-700"></div>
            <div className="relative group inline-block mb-8">
              <div className="w-32 h-32 rounded-[3rem] bg-navy-900 flex items-center justify-center text-white font-serif italic text-5xl shadow-2xl relative z-10">
                {candidate.full_name.charAt(0)}
              </div>
              <div className="absolute inset-0 bg-blue-400 rounded-[3rem] blur-2xl opacity-20"></div>
            </div>
            <h1 className="text-3xl font-serif italic text-navy-900 mb-2">{candidate.full_name}</h1>
            <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] mb-8 flex items-center justify-center">
              <Clock size={12} className="mr-2 text-blue-400" /> Applied {new Date(candidate.created_at).toLocaleDateString()}
            </p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center p-4 bg-bg-admin rounded-2xl border border-border text-navy-900">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-400 shadow-sm mr-4 shrink-0">
                  <Mail size={18} />
                </div>
                <span className="text-sm font-bold truncate">{candidate.email}</span>
              </div>
              <div className="flex items-center p-4 bg-bg-admin rounded-2xl border border-border text-navy-900">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-400 shadow-sm mr-4 shrink-0">
                  <Phone size={18} />
                </div>
                <span className="text-sm font-bold">{candidate.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="bg-navy-900 p-10 rounded-[2.5rem] shadow-2xl shadow-navy-900/40 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-xl font-serif italic mb-10 flex items-center">
              <TrendingUp size={24} className="mr-3 text-blue-400" />
              AI Match Analysis
            </h3>
            
            <div className="h-64 relative mb-10">
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
                    cornerRadius={30}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-serif italic">{(candidate.match_score * 100).toFixed(0)}%</span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">Semantic Accuracy</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative z-10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">AI Intelligence Note:</p>
              <div className="flex items-start space-x-4">
                {candidate.match_score > 0.4 ? (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-white/70 italic">Candidate shows strong alignment with core requirements and mandatory criteria.</p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-error/20 text-error flex items-center justify-center shrink-0">
                      <XCircle size={18} />
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-white/70 italic">Candidate lacks essential skills or experience required for this specific role.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Experience, Education & CV */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-12 rounded-[3rem] border border-border shadow-cool">
            <h3 className="text-2xl font-serif italic text-navy-900 mb-12">Professional Profile Matrix</h3>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] flex items-center">
                    <TrendingUp size={14} className="mr-3 text-blue-400" /> Skill Inventory
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {candidate.skills.map(skill => (
                      <span key={skill} className="px-5 py-2.5 bg-bg-admin text-navy-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-border shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-bg-admin rounded-[2.5rem] border border-border shadow-inner">
                  <h4 className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] flex items-center mb-4">
                    <Briefcase size={16} className="mr-3 text-blue-400" />
                    Tenure Experience
                  </h4>
                  <p className="text-4xl font-serif italic text-navy-900">{candidate.experience_years} <span className="text-xl font-sans not-italic text-text-admin-secondary">Years</span></p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="p-8 bg-bg-admin rounded-[2.5rem] border border-border shadow-inner">
                  <h4 className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] flex items-center mb-4">
                    <GraduationCap size={18} className="mr-3 text-blue-400" />
                    Academic Background
                  </h4>
                  <p className="text-lg font-bold text-navy-900 leading-relaxed italic">{candidate.education || 'Credentials not extracted'}</p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] mb-4">Original CV Dossier</h4>
                  <a 
                    href={candidate.cv_url ? (/^https?:\/\//i.test(candidate.cv_url) ? candidate.cv_url : `${API_BASE_URL.replace(/\/$/, '')}/uploads/${candidate.cv_url}`) : '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-navy-900 rounded-[2rem] border border-navy-700 hover:bg-navy-700 transition-all group shadow-xl"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 mr-4 group-hover:scale-110 transition-transform">
                        <Download size={24} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Download_CV.pdf</p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Encrypted PDF</p>
                      </div>
                    </div>
                    <ExternalLink size={20} className="text-white/20 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-[2.5rem] border border-border shadow-cool p-12 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif italic text-navy-900 mb-1">Application Summary</h3>
              <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em]">Full semantic profile review completed.</p>
            </div>
            <div className="flex space-x-4">
              <button className="px-8 py-4 bg-bg-admin border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-navy-900 hover:bg-white transition-all shadow-sm">
                Print Report
              </button>
              <button className="btn-accent py-4 px-8 text-[10px] uppercase tracking-widest shadow-blue-400/20 animate-shimmer">
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
