import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { FileText, Zap, ShieldCheck, Download, ArrowRight, Brain, Sparkles, Layout, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="blob -top-20 -right-20 opacity-30"></div>
        <div className="blob top-1/2 -left-40 opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8 font-display">
                  Smart <span className="text-gradient">Question Paper</span> Generator
                </h1>
                <p className="text-xl text-gray-500 mb-10 leading-relaxed mx-auto">
                  Automatically generate structured question papers based on syllabus, difficulty, and Bloom's Taxonomy levels in seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to={user ? "/generate" : "/login"} className="btn-gradient group">
                    Start Generating
                    <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {!user && (
                    <Link to="/login" className="btn-dark">
                      Sign In
                    </Link>
                  )
                  }
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-brand-pink font-bold uppercase tracking-widest text-sm">Core Features</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 font-display">
              Intelligent Question Generation<br />For Modern Educators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            //bloom taxonomy section added
            <ServiceCard 
              icon={<Layout className="h-8 w-8 text-white" />}
              title="Syllabus Analysis"
              description="Upload your syllabus and let AI extract key topics for comprehensive coverage."
              color="bg-brand-purple"
            />
            
            <ServiceCard 
              icon={<Brain className="h-8 w-8 text-white" />}
              title="Bloom's Taxonomy"
              description="Generate questions across all cognitive levels from Remember to Create."
              color="bg-brand-pink"
            />
            <ServiceCard 
              icon={<Download className="h-8 w-8 text-white" />}
              title="Export & Print"
              description="Download your generated papers in professional PDF formats ready for printing."
              color="bg-brand-blue"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-brand-purple font-bold uppercase tracking-widest text-sm">Simple Workflow</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-4 font-display">
              Generate Papers in 3 Easy Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-brand-purple border border-gray-100">1</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 font-display">Input Syllabus</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Paste your syllabus or upload content to define the scope.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-brand-pink border border-gray-100">2</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 font-display">Set Parameters</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Choose difficulty, Bloom's levels, and question types.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-brand-blue border border-gray-100">3</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 font-display">AI Generation</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Get a balanced, structured question paper instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <span className="text-brand-blue font-bold uppercase tracking-widest text-sm">Advanced Capabilities</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-4 font-display">
              Everything You Need
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureItem 
              icon="📝"
              title="Multiple Types"
              description="Generate MCQs, Descriptive, and Case-based questions effortlessly."
            />
            <FeatureItem 
              icon="⚖️"
              title="Balanced Marks"
              description="Automatic distribution of marks across topics and difficulty levels."
            />
            <FeatureItem 
              icon="🚫"
              title="No Repetition"
              description="Smart algorithms ensure unique questions every time you generate."
            />
            <FeatureItem 
              icon="🔒"
              title="Secure Storage"
              description="All your generated papers are saved securely in your dashboard."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="soft-card p-10 text-center relative group"
    >
      <div className={`${color} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 font-display">{title}</h3>
      <p className="text-gray-500 leading-relaxed mb-8">{description}</p>
      <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center mx-auto text-white cursor-pointer hover:scale-110 transition-transform`}>
        <ArrowRight className="h-5 w-5" />
      </div>
    </motion.div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="soft-card p-8 group">
      <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <h4 className="text-xl font-bold text-gray-900 mb-3 font-display">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
