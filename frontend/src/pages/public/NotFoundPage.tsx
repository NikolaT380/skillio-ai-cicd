import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-error/10 text-error rounded-3xl flex items-center justify-center mb-8"
      >
        <AlertCircle size={56} />
      </motion.div>

      <h1 className="text-6xl font-black text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Page not found</h2>
      <p className="text-xl text-gray-400 max-w-md mx-auto mb-12">
        The page you're looking for doesn't exist or has been moved to another department.
      </p>

      <Link to="/" className="btn-primary px-8 py-4 flex items-center">
        <Home className="mr-2" size={20} />
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
