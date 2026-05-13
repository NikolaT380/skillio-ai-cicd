import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background-alt">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">HR Admin Login</h1>
            <p className="text-gray-500 mt-2">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="admin@skillio.ai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Login to Dashboard'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Secure Access Only</p>
            <p className="text-xs text-gray-500 mt-2">Skillio AI uses enterprise-grade encryption to protect administrative sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
