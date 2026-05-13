import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Auth
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import JobsPage from './pages/public/JobsPage';
import ApplyPage from './pages/public/ApplyPage';
import SuccessPage from './pages/public/SuccessPage';
import StatusPage from './pages/public/StatusPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import JobsManagementPage from './pages/dashboard/JobsManagementPage';
import CandidatesListPage from './pages/dashboard/CandidatesListPage';
import GeneralCandidatesPage from './pages/dashboard/GeneralCandidatesPage';
import CandidateProfile from './pages/dashboard/CandidateProfile';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout variant="public"><LandingPage /></Layout>} />
        <Route path="/jobs" element={<Layout variant="public"><JobsPage /></Layout>} />
        <Route path="/jobs/:id/apply" element={<Layout variant="public"><ApplyPage /></Layout>} />
        <Route path="/apply/success" element={<Layout variant="public"><SuccessPage /></Layout>} />
        <Route path="/status" element={<Layout variant="public"><StatusPage /></Layout>} />
        <Route path="/login" element={<Layout variant="public"><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout variant="public"><RegisterPage /></Layout>} />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout variant="dashboard"><Dashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/jobs" 
          element={
            <ProtectedRoute>
              <Layout variant="dashboard"><JobsManagementPage /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/jobs/:id/candidates" 
          element={
            <ProtectedRoute>
              <Layout variant="dashboard"><CandidatesListPage /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/candidates" 
          element={
            <ProtectedRoute>
              <Layout variant="dashboard"><GeneralCandidatesPage /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/candidates/:id" 
          element={
            <ProtectedRoute>
              <Layout variant="dashboard"><CandidateProfile /></Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/settings" 
          element={
            <ProtectedRoute>
              <Layout variant="dashboard"><div className="card p-8">Settings logic coming soon...</div></Layout>
            </ProtectedRoute>
          } 
        />

        {/* 404 Page */}
        <Route path="*" element={<Layout variant="public"><NotFoundPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
