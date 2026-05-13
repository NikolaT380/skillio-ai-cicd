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
  TrendingUp
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
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!candidate) return null;

  const chartData = [
    { name: 'Score', value: candidate.match_score * 100, fill: candidate.match_score > 0.6 ? '#10B981' : candidate.match_score > 0.4 ? '#F59E0B' : '#EF4444' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to List
        </button>
        <div className="flex items-center space-x-3">
          <select 
            value={candidate.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value as Candidate['status'])}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-bold"
          >
            <option value="submitted">Submitted</option>
            <option value="under_review">In Review</option>
            <option value="recommended">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button 
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md border border-red-100 transition-all"
            title="Delete Candidate"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info & Skills */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-primary/5 text-primary flex items-center justify-center text-3xl font-bold mx-auto mb-6 border-4 border-white shadow-sm">
              {candidate.full_name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold">{candidate.full_name}</h1>
            <p className="text-gray-500 mb-6">Applied on {new Date(candidate.created_at).toLocaleDateString()}</p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center text-gray-600">
                <Mail size={18} className="mr-3 text-gray-400" />
                <span className="text-sm truncate">{candidate.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone size={18} className="mr-3 text-gray-400" />
                <span className="text-sm">{candidate.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <TrendingUp size={20} className="mr-2 text-primary" />
              AI Match Analysis
            </h3>
            
            <div className="h-64 relative">
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
                <span className="text-4xl font-black text-primary">{(candidate.match_score * 100).toFixed(0)}%</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Match Score</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-background-alt">
              <p className="text-sm font-medium mb-3">AI Recommendation:</p>
              <div className="flex items-start space-x-3">
                {candidate.match_score > 0.4 ? (
                  <>
                    <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                    <p className="text-sm text-gray-600">Candidate shows strong alignment with core requirements and mandatory criteria.</p>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-500 shrink-0" size={18} />
                    <p className="text-sm text-gray-600">Candidate lacks essential skills or experience required for this specific role.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Experience, Education & CV */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-8">Professional Profile</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Extracted Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-md uppercase">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                    <Clock size={14} className="mr-1" />
                    Total Experience
                  </h4>
                  <p className="font-bold text-lg">{candidate.experience_years} Years</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                    <GraduationCap size={16} className="mr-1" />
                    Education
                  </h4>
                  <p className="text-gray-700">{candidate.education || 'Data not extracted'}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">CV Document</h4>
                  <a 
                    href={candidate.cv_url ? (/^https?:\/\//i.test(candidate.cv_url) ? candidate.cv_url : `${API_BASE_URL.replace(/\/$/, '')}/uploads/${candidate.cv_url}`) : '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center">
                      <Download className="text-primary mr-3" size={20} />
                      <span className="font-medium">Original_CV.pdf</span>
                    </div>
                    <span className="text-xs text-gray-400">PDF Document</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">CV Text Analysis (Raw Extraction)</h4>
              <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto text-sm text-gray-600 font-mono whitespace-pre-wrap leading-relaxed">
                {candidate.raw_text || 'Raw text data is not available for this candidate.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
