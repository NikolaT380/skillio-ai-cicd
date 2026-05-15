import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const jobTitle = location.state?.jobTitle || 'the position';

  return (
    <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mb-8"
      >
        <CheckCircle2 size={56} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-xl"
      >
        <h1 className="text-4xl font-black mb-4">Application Submitted!</h1>
        <p className="text-xl text-gray-500 mb-12 leading-relaxed">
          We've received your CV for <span className="text-primary font-bold">{jobTitle}</span> and will review it shortly. 
          Check your email for a formal confirmation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/jobs" className="btn-accent px-8 py-4 flex items-center">
            Browse More Positions <ArrowRight className="ml-2" size={20} />
          </Link>
          <Link to="/" className="text-gray-500 font-bold hover:text-primary transition-colors">
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
