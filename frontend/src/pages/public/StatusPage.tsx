import React, { useState } from 'react';
import { Mail, FileSearch, BadgeCheck, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { candidateService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { CandidateStatusResponse } from '../../types';

type StatusKey = CandidateStatusResponse['status'];

const statusConfig: Record<StatusKey, { icon: React.ElementType; color: string; text: string }> = {
  'submitted': { icon: Clock, color: 'text-blue-600 bg-blue-100', text: 'Submitted' },
  'under_review': { icon: FileSearch, color: 'text-warning bg-warning/10', text: 'Under Review' },
  'recommended': { icon: BadgeCheck, color: 'text-success bg-success/10', text: 'Recommended' },
  'rejected': { icon: XCircle, color: 'text-error bg-error/10', text: 'Rejected' },
};

const StatusPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<CandidateStatusResponse | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await candidateService.getCandidateStatus(email);
      setApplication(data);
    } catch (error) {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 min-h-[70vh]">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-black mb-4">Track Application</h1>
        <p className="text-xl text-gray-500">Enter the email you used to apply to check your current status.</p>
      </div>

      <div className="max-w-md mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
          <input
            required
            type="email"
            placeholder="your-email@example.com"
            className="input-field pl-12 py-4 text-lg shadow-lg shadow-primary/5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-lg font-bold hover:bg-accent transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Check'}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            {application ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Position Applied</p>
                    <h3 className="text-2xl font-black text-primary">{application.job_title}</h3>
                  </div>
                  {(() => {
                    const config = statusConfig[application.status] ?? statusConfig['submitted'];
                    const Icon = config.icon;
                    return (
                      <div className={`px-4 py-2 rounded-full font-bold flex items-center space-x-2 ${config.color}`}>
                        <Icon size={18} />
                        <span>{config.text}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Date Applied</span>
                    <span className="font-bold text-primary">{new Date(application.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Application ID</span>
                    <span className="font-mono text-accent">{application.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="mt-12 bg-gray-50 p-6 rounded-2xl flex items-start space-x-4">
                  <AlertCircle className="text-gray-400 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Our team is currently reviewing your application against several criteria. 
                    You'll be notified via email once a decision is made.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-background-alt rounded-3xl border-2 border-dashed border-gray-200">
                <FileSearch className="mx-auto text-gray-300 mb-6" size={64} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No application found</h3>
                <p className="text-gray-400 max-w-sm mx-auto">
                  We couldn't find any active applications for <span className="text-primary font-bold">{email}</span>. 
                  Please check the spelling or try another email.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusPage;
