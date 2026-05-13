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
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Position not found</h1>
        <Link to="/jobs" className="btn-primary">Return to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      <Link 
        to="/jobs" 
        className="inline-flex items-center text-gray-500 hover:text-accent font-bold mb-12 transition-colors group"
      >
        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to All Positions
      </Link>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left Column: Job Details */}
        <div className="space-y-12">
          <div>
            <div className="bg-accent/10 text-accent px-4 py-1 rounded-full text-sm font-bold inline-block mb-6 uppercase tracking-wider">
              {job.company_name}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 leading-tight">{job.title}</h1>
            <div className="flex flex-wrap gap-6 text-gray-500 font-medium">
              <div className="flex items-center">
                <MapPin size={20} className="mr-2 text-accent" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Building2 size={20} className="mr-2 text-accent" />
                Full-time
              </div>
            </div>
          </div>

          <div className="prose prose-blue max-w-none">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Info className="mr-3 text-accent" size={24} />
              About the Role
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{job.description}</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center">
              <CheckCircle2 className="mr-3 text-accent" size={24} />
              Key Requirements
            </h2>
            <ul className="space-y-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start text-gray-600 text-lg">
                  <span className="w-2 h-2 rounded-full bg-accent mt-2.5 mr-4 shrink-0"></span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Application Form */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
          <h3 className="text-2xl font-bold mb-8">Personal Information</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">First Name</label>
                <input
                  required
                  type="text"
                  placeholder="Jane"
                  className="input-field"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Last Name</label>
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input
                required
                type="email"
                placeholder="jane.doe@example.com"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+32 400 00 00 00"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-sm font-bold text-gray-700">Curriculum Vitae (PDF Preferred)</label>
              <div 
                className={`
                  relative border-2 border-dashed rounded-2xl p-10 text-center transition-all
                  ${dragActive ? 'border-accent bg-accent/5 scale-[0.99]' : 'border-gray-200 hover:border-accent/40'}
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
                      <div className="w-16 h-16 bg-success/20 text-success rounded-xl flex items-center justify-center mb-4">
                        <FileText size={32} />
                      </div>
                      <p className="font-bold text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-500 text-sm font-bold flex items-center hover:underline"
                      >
                        <X size={14} className="mr-1" /> Remove
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="no-file"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileUp size={32} />
                      </div>
                      <p className="font-bold text-gray-800">Drag & drop your CV</p>
                      <p className="text-sm text-gray-500">or click to browse your files</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !file}
              className="w-full btn-accent py-5 text-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-accent/20"
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
            <p className="text-center text-xs text-gray-400">
              By submitting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
