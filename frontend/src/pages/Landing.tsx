import { Link } from 'react-router-dom';
import { 
  Brain, Target, Users, BookOpen, ChevronRight, Activity, 
  FileText, Compass, Zap, TrendingUp, Shield, Bot, BarChart3,
  ArrowRight, Star, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Skill Gap Engine',
    description: 'Machine learning algorithms map your current skills against real-time industry benchmarks for any target role.',
    color: 'bg-forest/10 text-forest'
  },
  {
    icon: Target,
    title: 'Digital Career Twin',
    description: 'A living digital replica of your career trajectory — updated in real time as you learn, practice and complete assessments.',
    color: 'bg-gold/10 text-gold'
  },
  {
    icon: Bot,
    title: 'RAG-Grounded AI Mentor',
    description: 'Context-aware personal coach that synthesizes your Career Twin profile and uploaded course notes to give precise guidance.',
    color: 'bg-sage/20 text-forest'
  },
  {
    icon: Activity,
    title: 'What-if Career Simulator',
    description: 'Simulate hypothetical skill improvements and instantly see how they project onto your career readiness score.',
    color: 'bg-forest/10 text-forest'
  },
  {
    icon: Shield,
    title: 'AI-Proctored Assessments',
    description: 'Adaptive assessments with live face detection and multi-face alerts, ensuring verified and credible skill scores.',
    color: 'bg-amber-50 text-amber-700'
  },
  {
    icon: Users,
    title: 'Alumni Mentorship Network',
    description: 'Connect with industry professionals and alumni at your dream companies for direct 1-on-1 career mentorship.',
    color: 'bg-emerald-50 text-emerald-700'
  },
];

const STATS = [
  { value: '50+', label: 'Career Roles Mapped' },
  { value: '500+', label: 'Practice Questions' },
  { value: '95%', label: 'Placement Accuracy' },
  { value: '8 Phases', label: 'AI-Powered Engine' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-sage/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-gold/10 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Version badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sage/30 text-forest font-bold text-sm mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Career Intelligence Platform — Now Live
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-forest tracking-tight leading-[1.05] text-balance mb-6"
          >
            Bridge the gap between<br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest via-sage to-gold">
                Education and Industry
              </span>
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-forest-dark/70 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            SkillPath AI analyzes your skills against real industry benchmarks, identifies your exact gaps, synthesizes your Digital Career Twin, and generates a hyper-personalized roadmap to get you hired.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {user ? (
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 bg-forest hover:bg-forest-dark text-white rounded-2xl font-black text-lg shadow-xl shadow-forest/25 transition-all flex items-center justify-center gap-2 group"
              >
                Go to Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto px-8 py-4 bg-forest hover:bg-forest-dark text-white rounded-2xl font-black text-lg shadow-xl shadow-forest/25 transition-all flex items-center justify-center gap-2 group"
                >
                  Start for Free <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-cream text-forest border border-sage/40 rounded-2xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-sage/30 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-black text-forest">{stat.value}</p>
                <p className="text-xs text-muted font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-forest bg-sage/10 px-4 py-2 rounded-full mb-4">
            <Zap size={14} className="text-gold" /> How It Works
          </span>
          <h2 className="text-4xl font-black text-forest tracking-tight">Your career journey in 4 steps</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', icon: Target, label: 'Set Your Target', desc: 'Choose your dream role and company. The system calibrates everything to your goal.' },
            { step: '02', icon: Brain, label: 'Analyze Your Gaps', desc: 'AI compares your profile against role requirements and maps your exact skill gaps.' },
            { step: '03', icon: BookOpen, label: 'Follow Your Roadmap', desc: 'Adaptive curriculum ordered by prerequisites — with feedback loops on poor results.' },
            { step: '04', icon: TrendingUp, label: 'Track & Get Hired', desc: 'Your Career Twin updates in real time. Watch your readiness score climb to 100%.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-cream/60 border border-sage/30 rounded-3xl p-6 shadow-sm"
            >
              <div className="text-[10px] font-black text-gold tracking-widest uppercase mb-3">{item.step}</div>
              <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center text-cream mb-4">
                <item.icon size={20} />
              </div>
              <h3 className="font-black text-forest mb-2">{item.label}</h3>
              <p className="text-sm text-muted font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-forest bg-white px-4 py-2 rounded-full border border-sage/30 mb-4">
              <Star size={14} className="text-gold" /> Platform Features
            </span>
            <h2 className="text-4xl font-black text-forest tracking-tight">Everything you need to get hired</h2>
            <p className="text-muted mt-3 max-w-xl mx-auto text-lg">8 AI-powered modules working together to close your skill gap and land your dream role.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm hover:shadow-md hover:border-sage/50 transition-all group"
              >
                <div className={`w-12 h-12 ${feat.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={22} />
                </div>
                <h3 className="text-lg font-black text-forest mb-2">{feat.title}</h3>
                <p className="text-sm text-muted font-medium leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Checklist */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-forest rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <Compass size={400} className="absolute -right-20 -top-20" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-cream mb-6 relative z-10">
              Stop guessing. Start tracking.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 relative z-10 text-left">
              {[
                'Resume-parsed skill extraction',
                'Company-specific interview prep',
                'Adaptive proctored assessments',
                'AI mentor grounded in your profile',
                'Live career readiness score',
                'One-click roadmap generation',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sage font-semibold text-sm">
                  <CheckCircle2 size={18} className="text-gold shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="relative z-10">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-yellow-400 text-forest font-black px-8 py-4 rounded-2xl text-lg shadow-lg transition group"
                >
                  Open Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-yellow-400 text-forest font-black px-8 py-4 rounded-2xl text-lg shadow-lg transition group"
                >
                  Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream border-t border-sage/20 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Compass size={18} className="text-forest" />
          <span className="font-black text-forest">SkillPath AI</span>
        </div>
        <p className="text-xs text-muted">AI-Powered Personalized Learning & Career Skill-Gap Prediction Platform</p>
      </footer>

    </div>
  );
}
