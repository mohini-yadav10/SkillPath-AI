import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Book, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Clock, 
  ArrowRight, 
  Flag, 
  Map,
  Sparkles,
  AlertTriangle,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPath() {
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPath = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/learning/path', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPath(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPath();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/learning/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPath(res.data.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to generate learning path.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (itemId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/learning/progress/${itemId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPath(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalHours = path?.totalEstimatedHours || path?.items?.reduce((acc: number, i: any) => acc + (i.estimatedHours || 10), 0) || 40;
  const completedCount = path?.items?.filter((i: any) => i.status === 'COMPLETED').length || 0;
  const inProgressCount = path?.items?.filter((i: any) => i.status === 'IN_PROGRESS').length || 0;
  const pendingCount = path?.items?.filter((i: any) => i.status === 'PENDING').length || 0;
  const adaptiveRemediationCount = path?.items?.filter((i: any) => i.isAdaptiveRemediation).length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl shadow-sm border border-sage/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Map size={140} />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest/10 text-forest rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Zap size={14} className="text-gold" /> Adaptive AI Curriculum
          </div>
          <h1 className="text-3xl font-black text-forest tracking-tight">Adaptive Learning Roadmap</h1>
          <p className="text-muted mt-2 font-medium">
            Dynamically sequenced based on prerequisite dependencies and prioritized skill gaps. Poor assessment scores automatically inject reinforcement modules.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-forest text-cream px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:bg-forest-dark disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {generating ? (
              <><RefreshCw size={18} className="animate-spin" /> Sequencing Roadmap...</>
            ) : path ? (
              <><RefreshCw size={18} /> Regenerate Roadmap</>
            ) : (
              <><Zap size={18} /> Generate Roadmap</>
            )}
          </button>
        </div>
      </div>

      {/* Adaptive Remediation Notice (If any remediation items were injected) */}
      {adaptiveRemediationCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900">Adaptive Feedback Loop Active</h4>
              <p className="text-xs text-amber-800 font-medium">
                {adaptiveRemediationCount} reinforcement lab(s) automatically injected based on recent assessment evaluation.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full uppercase tracking-wider">
            Prioritized
          </span>
        </div>
      )}

      {!path || path.items.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-sage/30 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mb-6 text-forest">
            <Book size={40} />
          </div>
          <h2 className="text-2xl font-black text-forest mb-2">No Active Learning Roadmap</h2>
          <p className="text-muted font-medium max-w-md mb-8">
            Click below to generate a tailored, step-by-step curriculum targeting your role requirements.
          </p>
          <button 
            onClick={handleGenerate} 
            disabled={generating} 
            className="bg-forest text-cream px-8 py-3.5 rounded-2xl font-bold hover:bg-forest-dark transition shadow-lg"
          >
            Generate Roadmap Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Progress Overview Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-sage/30 sticky top-28 space-y-6">
              <h3 className="text-lg font-black text-forest">Curriculum Progress</h3>
              
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#DDEBE6" strokeWidth="10" fill="none" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    stroke="#123F36" strokeWidth="10" fill="none" 
                    strokeLinecap="round"
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * path.progress) / 100} 
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * path.progress) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-forest">{path.progress}%</span>
                  <span className="text-[10px] font-bold text-muted uppercase">Completed</span>
                </div>
              </div>
              
              {/* Stats Breakdown */}
              <div className="space-y-3 pt-4 border-t border-sage/20 text-xs font-bold">
                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Completed
                  </span>
                  <span className="font-black text-forest">{completedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-2">
                    <PlayCircle size={16} className="text-gold" /> In Progress
                  </span>
                  <span className="font-black text-forest">{inProgressCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-2">
                    <Circle size={16} className="text-muted" /> Upcoming
                  </span>
                  <span className="font-black text-forest">{pendingCount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-sage/20">
                  <span className="text-muted flex items-center gap-2">
                    <Clock size={16} className="text-forest" /> Total Hours
                  </span>
                  <span className="font-black text-forest">~{totalHours} hrs</span>
                </div>
              </div>

              {/* XP Completion Reward Card */}
              <div className="bg-cream/70 p-4 rounded-2xl border border-sage/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-forest">
                  <Award size={20} />
                </div>
                <div>
                  <span className="text-xs font-black text-forest block">+200 Career XP</span>
                  <span className="text-[10px] text-muted font-semibold">Awarded upon completing full path</span>
                </div>
              </div>

            </div>
          </div>

          {/* Stepped Timeline (8 cols) */}
          <div className="lg:col-span-8 relative">
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-sage/20 rounded-full z-0 hidden md:block"></div>
            
            <div className="space-y-6 relative z-10">
              
              {/* Start Node */}
              <div className="items-center gap-4 hidden md:flex">
                <div className="w-16 h-16 rounded-2xl bg-forest flex items-center justify-center text-cream shadow-md shrink-0 z-10 border-4 border-white">
                  <Flag size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-forest uppercase tracking-widest">START ROADMAP</h3>
                  <span className="text-xs text-muted font-semibold">Ordered by prerequisites</span>
                </div>
              </div>

              {/* Items List */}
              {path.items.map((item: any, index: number) => {
                const isCompleted = item.status === 'COMPLETED';
                const isInProgress = item.status === 'IN_PROGRESS';
                const isRemediation = item.isAdaptiveRemediation;

                return (
                  <motion.div 
                    key={item._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex md:items-start gap-4 md:gap-8 group"
                  >
                    {/* Node Toggle Indicator */}
                    <div className="hidden md:flex flex-col items-center mt-6 z-10 shrink-0">
                      <button 
                        onClick={() => handleStatusChange(item._id, isCompleted ? 'PENDING' : isInProgress ? 'COMPLETED' : 'IN_PROGRESS')}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-4 border-white shadow-md
                          ${isCompleted 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                            : isInProgress 
                            ? 'bg-gold text-forest ring-4 ring-gold/30 hover:scale-105' 
                            : 'bg-white text-muted hover:bg-cream border-sage/40'}`}
                        title="Click to advance status"
                      >
                        {isCompleted ? <CheckCircle2 size={26} strokeWidth={2.5} /> : 
                         isInProgress ? <PlayCircle size={26} strokeWidth={2.5} /> : 
                         <Circle size={24} />}
                      </button>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 p-6 md:p-8 rounded-3xl transition-all border ${
                      isRemediation
                        ? 'bg-amber-50/70 border-amber-300 shadow-md ring-2 ring-amber-200'
                        : isCompleted 
                        ? 'bg-white/80 border-sage/30' 
                        : isInProgress 
                        ? 'bg-white border-forest/30 shadow-lg ring-2 ring-forest/10' 
                        : 'bg-white border-sage/30 opacity-80 hover:opacity-100'
                    }`}>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {isRemediation && (
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                                <Zap size={11} /> Adaptive Reinforcement
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider
                              ${isCompleted 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : isInProgress 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-cream text-muted border border-sage/30'}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-bold text-forest bg-sage/20 px-2 py-0.5 rounded-full">
                              {item.skillName}
                            </span>
                            {item.milestone && (
                              <span className="text-[10px] font-semibold text-muted bg-cream px-2 py-0.5 rounded-full">
                                {item.milestone}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-lg font-black text-forest leading-snug">{item.title}</h4>
                        </div>

                        {/* Mobile Status Toggle Button */}
                        <button 
                          onClick={() => handleStatusChange(item._id, isCompleted ? 'PENDING' : isInProgress ? 'COMPLETED' : 'IN_PROGRESS')}
                          className="md:hidden text-xs font-bold bg-cream px-3 py-1.5 rounded-xl border border-sage/40"
                        >
                          {item.status}
                        </button>
                      </div>

                      {/* Card Footer with Meta and Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-sage/20 text-xs">
                        <span className="font-bold text-muted flex items-center gap-1.5">
                          <Clock size={14} className="text-forest" /> Est. {item.estimatedHours || 10} hours
                        </span>

                        <div className="flex items-center gap-2">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 font-bold text-forest hover:text-gold transition bg-cream hover:bg-sage/20 px-3.5 py-2 rounded-xl border border-sage/30"
                          >
                            <ExternalLink size={14} /> Open Resource
                          </a>
                          
                          {isInProgress && (
                            <button 
                              onClick={() => handleStatusChange(item._id, 'COMPLETED')}
                              className="inline-flex items-center gap-1.5 font-bold text-cream bg-forest hover:bg-forest-dark px-4 py-2 rounded-xl shadow-md transition"
                            >
                              Complete <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}

              {/* End Node */}
              <div className="items-center gap-4 hidden md:flex pt-4">
                <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center text-forest shadow-md shrink-0 z-10 border-4 border-white">
                  <Award size={26} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-forest uppercase tracking-widest">MARKET READY</h3>
                  <span className="text-xs text-muted font-semibold">100% Curriculum Completed</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
