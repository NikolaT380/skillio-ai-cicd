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
  ChevronRight
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
      <div className="min-h-screen bg-white">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <Link to="/">
                <Logo />
              </Link>
              <nav className="hidden md:flex items-center space-x-10">
                <Link to="/jobs" className="text-gray-600 hover:text-primary font-semibold transition-colors">Browse Jobs</Link>
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-accent">Go to Dashboard</Link>
                ) : (
                  <Link to="/login" className="btn-primary">HR Admin Login</Link>
                )}
              </nav>
              <button 
                className="md:hidden p-2 text-primary"
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
                className="md:hidden bg-white border-t border-gray-100 py-6 px-4 space-y-4 absolute w-full shadow-lg"
              >
                <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg text-gray-600 font-medium">Browse Jobs</Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg text-primary font-bold">HR Login</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="bg-primary text-white py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-center md:text-left">
              <div>
                <Logo className="invert brightness-0 inline-block md:block" />
                <p className="mt-4 opacity-60 max-w-sm">Elevating public administration recruitment with AI-driven semantic precision.</p>
              </div>
              <div className="flex space-x-12 opacity-80 font-medium">
                <Link to="/jobs" className="hover:text-accent transition-colors">Find Work</Link>
                <Link to="/login" className="hover:text-accent transition-colors">Recruiter Portal</Link>
                <a href="#" className="hover:text-accent transition-colors">Privacy</a>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-white/10 text-center opacity-40 text-sm">
              <p>© 2026 Skillio AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-alt flex overflow-hidden">
      {/* Sidebar for Dashboard */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="hidden md:flex flex-col bg-primary text-white sticky top-0 h-screen z-50 transition-all duration-300"
      >
        <div className="p-6 h-24 flex items-center justify-between overflow-hidden">
          {!isSidebarCollapsed && <Logo className="invert brightness-0" />}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-auto"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-accent text-white shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <item.icon size={22} className="shrink-0" />
                {!isSidebarCollapsed && <span className="font-semibold">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-3 p-2 mb-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-sm shrink-0 uppercase">
                {user?.full_name?.charAt(0) || 'HR'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{user?.full_name || 'HR Admin'}</p>
                <p className="text-xs text-white/40 truncate">{user?.email || 'hr@skillio.ai'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              flex items-center space-x-3 px-3 py-3 w-full rounded-lg text-red-300 hover:text-red-100 hover:bg-red-500/10 transition-colors
              ${isSidebarCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={22} />
            {!isSidebarCollapsed && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-6 md:px-10 shrink-0">
          <Menu 
            className="md:hidden text-primary cursor-pointer" 
            onClick={() => setIsMobileMenuOpen(true)}
            size={28} 
          />
          <h2 className="text-xl font-bold text-primary truncate max-w-md hidden sm:block">
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">Skillio AI Portal</p>
              <p className="text-xs text-gray-400">Environment: Staging</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-black text-sm shadow-sm">
              AI
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background-alt p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
              className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-primary z-[70] p-6 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <Logo className="invert brightness-0" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                  <X size={28} />
                </button>
              </div>
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-4 px-4 py-4 rounded-xl font-semibold
                      ${location.pathname === item.path ? 'bg-accent text-white shadow-lg' : 'text-white/60'}
                    `}
                  >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-4 px-4 py-4 w-full rounded-xl text-red-300 font-semibold"
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
