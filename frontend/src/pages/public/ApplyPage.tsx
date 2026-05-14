import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileUp, 
  MapPin, 
  Building2, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  Info,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useCandidates } from '../../hooks/useCandidates';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job } from '../../types';

const ApplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob } = useJobs();
  const { uploadCV } = useCandidates();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchJob = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getJob(id);
        if (isMounted && data) {
          setJob(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchJob();
    
    return () => {
      isMounted = false;
    };
  }, [id, getJob]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !id || !job) return;

    setSubmitting(true);
    try {
      await uploadCV(id, file, {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
      });
      navigate('/apply/success', { state: { jobTitle: job.title } });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <AlertCircle size={64} className="mx-auto text-error mb-6" />
        <h1 className="text-3xl font-serif mb-4">Position not found</h1>
        <Link to="/jobs" className="btn-primary">Return to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-candidate">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24">
        <Link 
          to="/jobs" 
          className="inline-flex items-center text-text-secondary hover:text-navy-700 font-bold mb-12 transition-colors group"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to All Positions
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Job Details */}
          <div className="space-y-12 bg-bg-candidate lg:pr-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-blue-400/10 text-navy-700 px-4 py-1.5 rounded-full text-xs font-extrabold inline-block mb-6 uppercase tracking-widest border border-blue-400/20">
                {job.company_name}
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-navy-900 mb-8 leading-tight">{job.title}</h1>
              <div className="flex flex-wrap gap-8 text-text-secondary font-semibold">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-warm flex items-center justify-center text-blue-400 mr-3">
                    <MapPin size={20} />
                  </div>
                  {job.location}
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-warm flex items-center justify-center text-blue-400 mr-3">
                    <Building2 size={20} />
                  </div>
                  Full-time
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-slate max-w-none"
            >
              <h2 className="text-2xl font-serif text-navy-900 mb-6 flex items-center">
                <Info className="mr-4 text-blue-400" size={24} />
                About the Role
              </h2>
              <p className="text-text-secondary leading-relaxed text-lg font-medium whitespace-pre-wrap">{job.description}</p>
              
              <h2 className="text-2xl font-serif text-navy-900 mt-12 mb-6 flex items-center">
                <CheckCircle2 className="mr-4 text-blue-400" size={24} />
                Key Requirements
              </h2>
              <ul className="space-y-4">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start text-text-secondary text-lg font-medium">
                    <span className="w-6 h-6 rounded-full bg-blue-400/10 text-blue-400 flex items-center justify-center mr-4 shrink-0 mt-0.5">
                      <CheckCircle2 size={14} />
                    </span>
                    {req}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right Column: Application Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-warm border border-border sticky top-24"
          >
            <h3 className="text-3xl font-serif text-navy-900 mb-10">Personal Information</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-navy-900 uppercase tracking-wider">First Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Jane"
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-navy-900 uppercase tracking-wider">Last Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Doe"
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-extrabold text-navy-900 uppercase tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="jane.doe@example.com"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-extrabold text-navy-900 uppercase tracking-wider">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+32 400 00 00 00"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-sm font-extrabold text-navy-900 uppercase tracking-wider">Curriculum Vitae (PDF Preferred)</label>
                <div 
                  className={`
                    relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                    ${dragActive ? 'border-blue-400 bg-blue-400/5 scale-[0.99]' : 'border-blue-400/40 hover:border-blue-400'}
                    ${file ? 'bg-success/5 border-success/30' : ''}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div 
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-success/20 text-success rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-success/10">
                          <FileText size={40} />
                        </div>
                        <p className="font-bold text-navy-900 text-lg mb-1">{file.name}</p>
                        <p className="text-sm text-text-secondary mb-6 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-error text-sm font-extrabold flex items-center hover:underline uppercase tracking-wider"
                        >
                          <X size={16} className="mr-2" /> Remove File
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="no-file"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="w-20 h-20 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-400/5">
                          <FileUp size={40} />
                        </div>
                        <p className="font-bold text-navy-900 text-lg mb-1">Drag & drop your CV</p>
                        <p className="text-sm text-text-secondary font-medium">or click to browse your files</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !file}
                className="w-full btn-accent py-6 text-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-2xl animate-shimmer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-3" size={24} />
                    Processing Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
              <p className="text-center text-xs text-text-secondary font-medium uppercase tracking-widest opacity-60">
                Secured by Skillio AI Privacy Shield
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
