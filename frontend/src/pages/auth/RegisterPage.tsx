import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    await register({
      email,
      full_name: fullName,
      password,
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-bg-admin relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-900/5 rounded-full blur-3xl -ml-64 -mb-64"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10 py-12"
      >
        <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-warm border border-border">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm">
              <User size={32} />
            </div>
            <h1 className="text-3xl font-semibold text-navy-900">Create HR Account</h1>
            <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] mt-3">Join the Intelligence Network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-admin-secondary group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-400/5 focus:border-blue-400/40 transition-all font-medium text-sm text-navy-900 placeholder:text-text-admin-secondary/30"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-admin-secondary group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-400/5 focus:border-blue-400/40 transition-all font-medium text-sm text-navy-900 placeholder:text-text-admin-secondary/30"
                  placeholder="admin@skillio.ai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] ml-1">Access Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-admin-secondary group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-400/5 focus:border-blue-400/40 transition-all font-medium text-sm text-navy-900 placeholder:text-text-admin-secondary/30"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-admin-secondary group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-400/5 focus:border-blue-400/40 transition-all font-medium text-sm text-navy-900 placeholder:text-text-admin-secondary/30"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full btn-primary py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin mr-3" size={20} /> : 'Create Administrator Account'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs font-semibold text-text-admin-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-black uppercase tracking-widest hover:underline ml-1">
                Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
