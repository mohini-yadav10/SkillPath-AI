import { Link } from 'react-router-dom';
import { Brain, Target, Users, BookOpen, ChevronRight, Activity, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 border border-sage/20 text-forest-dark font-medium text-sm mb-4">
          <span className="flex h-2 w-2 rounded-full bg-forest animate-pulse"></span>
          SkillPath AI Version 1.0 is Live
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-forest tracking-tight leading-tight text-balance">
          Bridge the gap between <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest to-gold">
            Education and Industry
          </span>
        </h1>

        <p className="text-xl text-forest-dark/70 max-w-2xl mx-auto leading-relaxed">
          An AI-powered platform that analyzes your skills, identifies your career gaps, and generates a hyper-personalized learning path to get you hired.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          {user ? (
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold text-lg shadow-lg shadow-sage/30 transition-all flex items-center justify-center gap-2">
              Go to Dashboard <ChevronRight size={20} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold text-lg shadow-lg shadow-sage/30 transition-all flex items-center justify-center gap-2">
                Start Learning Free <ChevronRight size={20} />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-cream/50 text-forest-dark border border-sage/20 rounded-xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2">
                Login to Account
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center text-forest mb-4">
              <Brain size={24} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">AI Gap Analysis</h3>
            <p className="text-forest-dark/70">Machine learning algorithms compare your profile against real-time industry requirements.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-forest mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Resume Parsing</h3>
            <p className="text-forest-dark/70">Upload your PDF resume and let our NLP engine automatically extract and verify your skills.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center text-forest mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Alumni Network</h3>
            <p className="text-forest-dark/70">Connect directly with college alumni working at your dream companies for 1-on-1 mentorship.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
