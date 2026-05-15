import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Job } from '../../types';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <motion.div 
      whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      className="bg-white border border-gray-100 rounded-2xl p-6 transition-all group h-full flex flex-col shadow-subtle"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="bg-accent/5 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {job.company_name}
        </div>
        <div className="text-gray-400">
          <Calendar size={18} />
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">{job.title}</h3>
      
      <div className="space-y-2 mb-6 flex-1">
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin size={16} className="mr-2 text-gray-300" />
          {job.location}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Building2 size={16} className="mr-2 text-gray-300" />
          Public Administration
        </div>
      </div>
      
      <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed">
        {job.description}
      </p>
      
      <div className="flex gap-4">
        <Link
          to={`/jobs/${job.id}/apply`}
          className="flex-1 btn-primary py-3 flex items-center justify-center group/btn"
        >
          Apply Now
          <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
        <Link
          to={`/jobs/${job.id}/apply`}
          className="px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-400 hover:text-primary hover:bg-gray-50 transition-all text-sm flex items-center justify-center"
        >
          Details
        </Link>
      </div>
    </motion.div>
  );
};

export default JobCard;
