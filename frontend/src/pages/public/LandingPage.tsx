import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Lock,
  Briefcase,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard: React.FC<{ icon: any, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -8, boxShadow: '0 20px 40px -15px rgba(13,27,42,0.12)' }}
    className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-navy-700/12 flex flex-col items-start text-left transition-all duration-300 group"
  >
    <div className="w-14 h-14 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-navy-900">{title}</h3>
    <p className="text-text-secondary leading-relaxed font-medium">{description}</p>
  </motion.div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="overflow-x-hidden bg-bg-candidate font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-56 overflow-hidden">
        {/* Decorative Gradient Mesh */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-navy-700/10 via-blue-400/5 to-transparent rounded-full -mr-96 -mt-96 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center lg:text-left grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-1.5 bg-white border border-border shadow-warm rounded-full mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 mr-3 animate-pulse"></span>
                <span className="text-navy-700 text-sm font-extrabold tracking-wide uppercase">
                  Revolutionizing Public Sector Hiring
                </span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl  text-navy-900 mb-8 leading-[1.05] tracking-tight">
                Find your next <br />
                <span className="text-blue-400">great hire</span> with AI
              </h1>
              
              <p className="text-xl text-text-secondary max-w-xl mb-12 leading-relaxed font-medium">
                Skillio AI uses semantic precision to rank candidates for public administration roles, reducing bias and saving hundreds of HR hours.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Link to="/jobs" className="btn-accent text-lg px-10 py-5 flex items-center w-full sm:w-auto justify-center group">
                  Browse Open Positions 
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link to="/login" className="btn-primary text-lg px-10 py-5 w-full sm:w-auto justify-center flex">
                  HR Admin Login
                </Link>
              </div>
            </motion.div>
            
            {/* Hero Visual - Floating Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="relative perspective-1000 hidden lg:block"
            >
              <div className="relative z-20 bg-white/40 backdrop-blur-md border border-white p-4 rounded-3xl shadow-2xl transform hover:rotate-2 transition-transform duration-700">
                <div className="aspect-[4/3] rounded-2xl bg-white border border-border shadow-warm overflow-hidden relative group">
                  {/* Mockup Content */}
                  <div className="p-8 h-full bg-gradient-to-br from-white to-bg-candidate">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-semibold">S</div>
                        <div className="h-4 w-24 bg-navy-700/10 rounded-full"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-border"></div>
                        <div className="w-3 h-3 rounded-full bg-border"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
                              <Target size={20} />
                            </div>
                            <div>
                              <div className="h-3 w-32 bg-navy-900/10 rounded-full mb-2"></div>
                              <div className="h-2 w-20 bg-navy-900/5 rounded-full"></div>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-navy-700/5 text-navy-700 text-xs font-bold rounded-full">Match 98%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 p-5 bg-white rounded-2xl shadow-2xl border border-border z-30"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <span className="font-bold text-navy-900 text-sm font-semibold">Verified Skills</span>
                    </div>
                    <div className="h-2 w-24 bg-navy-700/10 rounded-full"></div>
                  </motion.div>
                </div>
              </div>
              
              {/* Background Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl  text-navy-900 mb-6">How it works</h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg font-medium">Streamlining your recruitment pipeline in three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
            {/* Dotted Connection Lines (Desktop only) */}
            <div className="absolute top-12 left-0 w-full hidden md:block px-32 pointer-events-none">
              <div className="h-px border-t-2 border-dashed border-navy-700/10 w-full"></div>
            </div>
            
            {[
              { icon: Briefcase, title: "Post a Job", desc: "Define your requirements and mandatory criteria with our intuitive builder." },
              { icon: Target, title: "Candidates Apply", desc: "Applicants upload their CVs as guest users through your public portal." },
              { icon: TrendingUp, title: "AI Ranks Them", desc: "Our system semantically compares CVs to your description instantly." }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-blue-50 text-blue-500 border border-blue-100 rounded-2xl flex items-center justify-center mb-10 relative z-10 shadow-md transition-transform duration-500 group-hover:rotate-6">
                  <span className="font-semibold text-4xl text-blue-400 absolute -top-4 -left-4 bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border border-border">
                    {idx + 1}
                  </span>
                  <step.icon size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-navy-900">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed font-medium px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 relative overflow-hidden">
        {/* Background mesh for features */}
        <div className="absolute inset-0 bg-blue-50/60 -skew-y-3 origin-left"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Zap} 
              title="Semantic Matching" 
              description="Beyond keywords. Our AI understands contexts, skills, and professional experience depth."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Bias Reduction" 
              description="Rankings are based purely on merit and profile fit, ensuring a fair public sector hiring process."
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Instant Ranking" 
              description="Get a ranked list of candidates the second they apply, no more manual CV screening."
            />
            <FeatureCard 
              icon={Lock} 
              title="GDPR Ready" 
              description="Built with privacy in mind. Secure document processing and automated data retention policies."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div 
            whileInView={{ scale: [0.98, 1], opacity: [0, 1] }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] p-12 md:p-24 text-navy-900 relative overflow-hidden border border-border shadow-warm"
          >
            {/* Background elements for CTA - Subtle */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-900/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
            
            <h2 className="text-4xl md:text-6xl  mb-10 relative z-10 leading-tight">Ready to transform your hiring?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link to="/jobs" className="btn-primary px-12 py-6 text-xl shadow-2xl">
                Browse Open Positions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
