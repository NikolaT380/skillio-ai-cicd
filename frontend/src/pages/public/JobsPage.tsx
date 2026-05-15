import React, { useEffect, useState } from 'react';
import { Search, Loader2, Briefcase, Filter } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import JobCard from '../../components/jobs/JobCard';
import { motion, AnimatePresence } from 'framer-motion';

const JobsPage: React.FC = () => {
  const { jobs, loading, fetchJobs } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterLocation === '' || job.location === filterLocation)
  );

  const locations = Array.from(new Set(jobs.map(j => j.location)));

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-accent" size={48} />
        <p className="text-gray-400 font-medium animate-pulse">Scanning open positions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-black mb-4">Open Positions</h1>
        <p className="text-xl text-gray-500">Discover your next career move in public administration.</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-2xl shadow-subtle border border-gray-100 mb-12 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by job title, department..."
            className="input-field pl-12 py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-72 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            className="input-field pl-12 py-3 appearance-none"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <AnimatePresence mode="wait">
        {filteredJobs.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-background-alt rounded-3xl border-2 border-dashed border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Briefcase size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No open positions right now</h3>
            <p className="text-gray-400 max-w-sm mx-auto">We're constantly updating our database. Check back soon for new opportunities.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobsPage;
