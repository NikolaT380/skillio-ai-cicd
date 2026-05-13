import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Lock,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard: React.FC<{ icon: any, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-2xl border border-gray-100 shadow-subtle flex flex-col items-center text-center"
  >
    <div className="w-14 h-14 bg-accent/5 rounded-xl flex items-center justify-center text-accent mb-6">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        {/* Dot pattern background */}
        <div className="absolute inset-0 -z-10 bg-white" style={{ 
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }}></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/80 to-background-alt"></div>

        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-bold tracking-wider uppercase mb-8">
              Revolutionizing Public Sector Hiring
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-primary mb-8 leading-[1.1] tracking-tight">
              Find your next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">great hire</span> with AI
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              Skillio AI uses semantic precision to rank candidates for public administration roles, reducing bias and saving hundreds of HR hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/jobs" className="btn-accent text-lg px-8 py-4 flex items-center">
                Browse Open Positions <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link to="/login" className="btn-primary text-lg px-8 py-4">
                HR Admin Login
              </Link>
            </div>
          </motion.div>
          
          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="aspect-[16/9] rounded-2xl bg-white border border-gray-200 shadow-2xl p-4 md:p-8 overflow-hidden">
              <div className="w-full h-full rounded-xl bg-background-alt border border-gray-100 flex items-center justify-center relative group">
                <BrainCircuit className="text-accent/20 transition-transform group-hover:scale-110 duration-700" size={120} />
                <div className="absolute top-8 left-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 max-w-[200px] animate-bounce-slow">
                  <div className="h-2 w-12 bg-accent/20 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-accent/40 rounded"></div>
                </div>
                <div className="absolute bottom-8 right-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 max-w-[200px] animate-pulse">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center"><CheckCircle2 size={12} /></div>
                    <div className="h-2 w-16 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">How it works</h2>
            <p className="text-gray-500">Streamlining your recruitment pipeline in three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
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
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 relative z-10 shadow-xl font-bold text-2xl">
                  {idx + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-background-alt">
        <div className="max-w-7xl mx-auto px-4">
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
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">Ready to transform your hiring?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link to="/login" className="btn-accent px-10 py-5 text-xl">
                Get Started Now
              </Link>
              <Link to="/jobs" className="text-white font-bold hover:text-accent border-b-2 border-transparent hover:border-accent transition-all pb-1">
                View Demo Jobs Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
