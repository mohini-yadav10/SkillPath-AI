import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Zap, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Layers,
  Code,
  Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CareerTwinPayload {
  archetype: string;
  marketReadinessIndex: number;
  cognitiveScores: {
    technicalProficiency: number;
    practicalApplication: number;
    interviewReadiness: number;
    consistencyStreak: number;
  };
  learningVelocity: number;
  estimatedWeeksToHire: number;
  aiDiagnosis: string;
  nextBestAction: string;
  lastSynthesizedAt?: string;
}

interface CareerTwinCardProps {
  twin?: CareerTwinPayload;
  roleTitle?: string;
  companyName?: string;
  projects?: Array<{
    title: string;
    description: string;
    techStack: string[];
    verified: boolean;
  }>;
  onRefresh?: () => void;
}

export default function CareerTwinCard({ twin, roleTitle, companyName, projects = [] }: CareerTwinCardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DIMENSIONS' | 'PROJECTS'>('OVERVIEW');

  if (!twin) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-sage/30 shadow-sm text-center">
        <Bot size={36} className="text-forest mx-auto mb-3" />
        <h3 className="text-lg font-bold text-forest">Digital Career Twin Uninitialized</h3>
        <p className="text-sm text-muted mt-1">Set a Target Career to activate your AI Career Twin model.</p>
      </div>
    );
  }

  const scores = twin.cognitiveScores || {
    technicalProficiency: 60,
    practicalApplication: 70,
    interviewReadiness: 65,
    consistencyStreak: 50
  };

  const dimensions = [
    { label: 'Technical Mastery', value: scores.technicalProficiency, color: 'bg-emerald-600', icon: Code },
    { label: 'Practical Application', value: scores.practicalApplication, color: 'bg-amber-500', icon: Layers },
    { label: 'Interview Agility', value: scores.interviewReadiness, color: 'bg-blue-600', icon: Video },
    { label: 'Consistency Streak', value: scores.consistencyStreak, color: 'bg-rose-500', icon: Calendar }
  ];

  return (
    <div className="bg-white rounded-3xl border border-sage/30 shadow-sm p-6 lg:p-8 relative overflow-hidden flex flex-col justify-between space-y-6">
      
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-forest/5 rounded-full filter blur-3xl -z-0 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-forest text-cream flex items-center justify-center shadow-md">
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-forest">Digital Career Twin</h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gold/20 text-forest border border-gold/30">
                AI Synthesized
              </span>
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">
              {twin.archetype} &bull; Targeting {roleTitle || 'Target Role'} {companyName ? `@ ${companyName}` : ''}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-cream p-1 rounded-2xl border border-sage/30 text-xs font-bold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'OVERVIEW' ? 'bg-forest text-cream shadow-sm' : 'text-muted hover:text-forest'
            }`}
          >
            Twin State
          </button>
          <button
            onClick={() => setActiveTab('DIMENSIONS')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'DIMENSIONS' ? 'bg-forest text-cream shadow-sm' : 'text-muted hover:text-forest'
            }`}
          >
            4-Factor Matrix
          </button>
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'PROJECTS' ? 'bg-forest text-cream shadow-sm' : 'text-muted hover:text-forest'
            }`}
          >
            Portfolio ({projects.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="relative z-10 space-y-5">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-cream/60 p-4 rounded-2xl border border-sage/30">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                Market Readiness
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-forest">{twin.marketReadinessIndex}%</span>
                <span className="text-xs font-bold text-emerald-600">+12% mo</span>
              </div>
            </div>

            <div className="bg-cream/60 p-4 rounded-2xl border border-sage/30">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                Est. Weeks to Hire
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-forest">~{twin.estimatedWeeksToHire}</span>
                <span className="text-xs font-bold text-muted">weeks</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-cream/60 p-4 rounded-2xl border border-sage/30">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                Learning Velocity
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-forest">+{twin.learningVelocity}</span>
                <span className="text-xs font-bold text-muted">pts / sprint</span>
              </div>
            </div>
          </div>

          {/* AI Diagnosis Card */}
          <div className="bg-forest/5 p-5 rounded-2xl border border-forest/15 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-forest">
              <Sparkles size={14} className="text-gold" /> AI Twin Diagnosis
            </div>
            <p className="text-xs md:text-sm text-forest-dark font-medium leading-relaxed">
              {twin.aiDiagnosis}
            </p>
          </div>

          {/* Next Highest ROI Action */}
          <div className="bg-cream p-5 rounded-2xl border border-sage/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-0.5">
                Highest-ROI Next Move
              </span>
              <p className="text-xs md:text-sm font-bold text-forest">
                {twin.nextBestAction}
              </p>
            </div>
            <button
              onClick={() => navigate('/learning')}
              className="bg-forest hover:bg-forest-dark text-cream text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              Action Roadmap <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: 4-Factor Dimensions Matrix */}
      {activeTab === 'DIMENSIONS' && (
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              return (
                <div key={dim.label} className="bg-cream/60 p-4 rounded-2xl border border-sage/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-forest shadow-sm">
                        <Icon size={15} />
                      </div>
                      <span className="text-xs font-bold text-forest">{dim.label}</span>
                    </div>
                    <span className="text-sm font-black text-forest">{dim.value}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-sage/20">
                    <div 
                      className={`h-full ${dim.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dim.value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-cream rounded-2xl border border-sage/20 text-xs text-muted font-medium flex items-center justify-between">
            <span>Aggregated across code tests, resume NLP, quizzes & interviews.</span>
            <button 
              onClick={() => navigate('/assessment')} 
              className="text-forest font-bold hover:underline"
            >
              Take assessment &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Verified Projects Portfolio */}
      {activeTab === 'PROJECTS' && (
        <div className="relative z-10 space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-6 text-muted text-xs font-medium">
              No projects linked to your twin yet. Build and link GitHub repositories to increase Practical Application score.
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx} className="bg-cream/60 p-4 rounded-2xl border border-sage/30 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-forest">{proj.title}</h4>
                      {proj.verified && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {proj.techStack.map(t => (
                        <span key={t} className="text-[10px] font-bold bg-white text-forest px-2 py-0.5 rounded-lg border border-sage/30">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
