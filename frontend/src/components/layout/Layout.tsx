import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  LogOut, 
  Menu, 
  X,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  variant?: 'public' | 'dashboard';
}

const Layout: React.FC<LayoutProps> = ({ children, variant = 'public' }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Jobs', icon: Briefcase, path: '/dashboard/jobs' },
    { label: 'Candidates', icon: Users, path: '/dashboard/candidates' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  if (variant === 'public') {
    return (
      <div className="min-h-screen bg-bg-candidate">
        <header className="bg-bg-candidate/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-24 items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo />
              </Link>
              <nav className="hidden md:flex items-center space-x-10">
                <Link to="/jobs" className="text-text-secondary hover:text-navy-900 font-extrabold text-sm uppercase tracking-widest transition-colors">Browse Jobs</Link>
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-accent">Go to Dashboard</Link>
                ) : (
                  <Link to="/login" className="btn-primary">HR Admin Login</Link>
                )}
              </nav>
              <button 
                className="md:hidden p-2 text-navy-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden bg-white border-t border-border py-8 px-6 space-y-6 absolute w-full shadow-2xl"
              >
                <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg text-text-secondary font-bold uppercase tracking-widest">Browse Jobs</Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-xl text-navy-900 ">HR Login</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="min-h-[calc(100vh-96px)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="bg-slate-50 text-navy-900 py-24 border-t border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start space-y-12 md:space-y-0">
              <div className="max-w-sm">
                <Logo className="mb-8" />
                <p className="text-text-secondary font-medium leading-relaxed">Elevating public administration recruitment with AI-driven semantic precision.</p>
              </div>
              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-4">
                  <h4 className="text-navy-900 font-semibold text-lg mb-6">Candidate</h4>
                  <Link to="/jobs" className="block text-text-secondary hover:text-navy-900 transition-colors font-medium">Find Work</Link>
                  <Link to="/status" className="block text-text-secondary hover:text-navy-900 transition-colors font-medium">Track Application</Link>
                </div>
                <div className="space-y-4">
                  <h4 className="text-navy-900 font-semibold text-lg mb-6">Legal</h4>
                  <a href="#" className="block text-text-secondary hover:text-navy-900 transition-colors font-medium">Privacy Policy</a>
                  <a href="#" className="block text-text-secondary hover:text-navy-900 transition-colors font-medium">Terms of Service</a>
                </div>
              </div>
            </div>
            <div className="mt-24 pt-8 border-t border-border flex justify-between items-center text-text-admin-secondary text-xs font-bold uppercase tracking-widest">
              <p>© 2026 Skillio AI. Built for the Public Sector.</p>
              <div className="flex space-x-6">
                <span>v1.2.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-admin flex overflow-hidden font-sans">
      {/* Sidebar for Dashboard - Lightened */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 96 : 300 }}
        className="hidden md:flex flex-col bg-white text-navy-900 sticky top-0 h-screen z-50 transition-all duration-300 border-r border-border shadow-sm"
      >
        <div className="p-8 h-28 flex items-center justify-between overflow-hidden">
          {!isSidebarCollapsed && <Logo />}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-xl bg-bg-admin hover:bg-slate-100 transition-colors ml-auto text-text-admin-secondary"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-400/10 text-blue-600 shadow-sm border border-blue-400/10' 
                    : 'text-text-admin-secondary hover:text-navy-900 hover:bg-bg-admin'}
                `}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <item.icon size={24} className={`shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'group-hover:text-blue-600'}`} />
                {!isSidebarCollapsed && <span className="font-extrabold uppercase tracking-widest text-[10px]">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-4 p-4 mb-6 bg-bg-admin rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center font-semibold text-xl text-blue-600 shadow-sm shrink-0">
                {user?.full_name?.charAt(0) || 'H'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{user?.full_name || 'HR Admin'}</p>
                <p className="text-[10px] text-text-admin-secondary uppercase tracking-widest font-black truncate">{user?.email || 'hr@skillio.ai'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              flex items-center space-x-4 px-4 py-4 w-full rounded-xl text-error/60 hover:text-error hover:bg-error/5 transition-colors font-extrabold uppercase tracking-widest text-[10px]
              ${isSidebarCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={24} className="shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-border h-24 flex items-center justify-between px-8 lg:px-12 shrink-0 relative z-40">
          <Menu 
            className="md:hidden text-navy-900 cursor-pointer" 
            onClick={() => setIsMobileMenuOpen(true)}
            size={32} 
          />
          
          <div className="hidden md:flex items-center bg-bg-admin rounded-xl px-4 py-2.5 border border-border w-96 group focus-within:ring-2 focus-within:ring-blue-400/20 focus-within:border-blue-400 transition-all">
            <Search className="text-text-admin-secondary mr-3" size={18} />
            <input 
              type="text" 
              placeholder="Search applicants, jobs..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-text-admin-secondary/50"
            />
          </div>

          <div className="flex items-center space-x-8">
            <button className="relative p-2 text-text-admin-secondary hover:text-navy-900 transition-colors">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-400 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-border"></div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-0.5">Staging Environment</p>
                <p className="text-sm font-extrabold text-navy-900">Skillio AI Portal</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl shadow-sm">
                S
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-bg-admin p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-white z-[70] p-8 flex flex-col md:hidden shadow-2xl border-r border-border"
            >
              <div className="flex justify-between items-center mb-16">
                <Logo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-admin-secondary p-2">
                  <X size={32} />
                </button>
              </div>
              <nav className="flex-1 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-6 px-6 py-5 rounded-2xl font-extrabold uppercase tracking-[0.2em] text-xs
                      ${location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                        : 'text-text-admin-secondary hover:text-navy-900 hover:bg-slate-50'}
                    `}
                  >
                    <item.icon size={24} className={location.pathname === item.path ? 'text-blue-600' : ''} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-6 px-6 py-5 w-full rounded-2xl text-error/60 font-extrabold uppercase tracking-[0.2em] text-xs"
              >
                <LogOut size={24} />
                <span>Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
