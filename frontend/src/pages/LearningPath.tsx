import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Book, CheckCircle2, Circle, PlayCircle, ExternalLink, RefreshCw, Zap, Clock, ArrowRight, Flag, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPath() {
  const { user } = useAuth();
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
      <div className="w-10 h-10 border-4 border-sage/100 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl shadow-sm border border-sage/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Map size={120} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage/10 text-forest rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Zap size={14} className="text-sage/100" /> AI Curriculum
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Your Learning Roadmap</h1>
          <p className="text-cream/500 mt-2 font-medium max-w-xl">
            A highly curated, step-by-step educational pathway designed to close your specific skill gaps and prepare you for your target role.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-forest text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-forest/20 hover:bg-ink disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {generating ? (
              <><RefreshCw size={18} className="animate-spin" /> Generating...</>
            ) : path ? (
              <><RefreshCw size={18} /> Regenerate Roadmap</>
            ) : (
              <><Zap size={18} /> Generate Roadmap</>
            )}
          </button>
        </div>
      </div>

      {!path || path.items.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-sage/20 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-cream/50 rounded-full flex items-center justify-center mb-6">
            <Book className="text-muted" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-3">No Active Learning Roadmap</h2>
          <p className="text-cream/500 font-medium max-w-md mb-8">
            Analyze your skill gaps and select a target career first, then generate your personalized step-by-step curriculum.
          </p>
          <button onClick={handleGenerate} disabled={generating} className="bg-forest text-white px-8 py-3.5 rounded-xl font-bold hover:bg-forest-dark transition shadow-lg shadow-forest/20">
            Generate Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Progress Overview Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-sage/20 sticky top-28">
              <h3 className="text-lg font-bold text-ink mb-6">Roadmap Progress</h3>
              
              <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    stroke="#6366f1" strokeWidth="12" fill="none" 
                    strokeLinecap="round"
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * path.progress) / 100} 
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * path.progress) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-ink">{path.progress}%</span>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-sage/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cream/500 font-medium flex items-center gap-2"><CheckCircle2 size={16} className="text-sage/100"/> Completed</span>
                  <span className="font-bold text-ink">{path.items.filter((i:any) => i.status === 'COMPLETED').length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cream/500 font-medium flex items-center gap-2"><PlayCircle size={16} className="text-sage/100"/> In Progress</span>
                  <span className="font-bold text-ink">{path.items.filter((i:any) => i.status === 'IN_PROGRESS').length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cream/500 font-medium flex items-center gap-2"><Circle size={16} className="text-sage/30"/> Upcoming</span>
                  <span className="font-bold text-ink">{path.items.filter((i:any) => i.status === 'PENDING').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-8 relative">
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-sage/10 rounded-full z-0 hidden md:block"></div>
            
            <div className="space-y-6 relative z-10">
              {/* Start Node */}
              <div className="flex items-center gap-4 hidden md:flex">
                <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center text-white shadow-lg shrink-0 z-10 border-4 border-white">
                  <Flag size={24} />
                </div>
                <h3 className="text-xl font-black text-ink uppercase tracking-widest">START</h3>
              </div>

              {path.items.map((item: any, index: number) => {
                const isCompleted = item.status === 'COMPLETED';
                const isInProgress = item.status === 'IN_PROGRESS';
                const isPending = item.status === 'PENDING';

                return (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex md:items-start gap-4 md:gap-8 group"
                  >
                    {/* Timeline Node */}
                    <div className="hidden md:flex flex-col items-center mt-6 z-10 shrink-0">
                      <button 
                        onClick={() => handleStatusChange(item._id, isCompleted ? 'PENDING' : isInProgress ? 'COMPLETED' : 'IN_PROGRESS')}
                        className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all border-4 border-white shadow-md
                          ${isCompleted ? 'bg-forest text-sage hover:bg-forest-dark' : 
                            isInProgress ? 'bg-gold text-forest hover:bg-[#e3b55a] ring-4 ring-gold/20' : 
                            'bg-cream text-muted hover:bg-sage/50 border-sage'}`}
                      >
                        {isCompleted ? <CheckCircle2 size={28} /> : 
                         isInProgress ? <PlayCircle size={28} /> : 
                         <Circle size={28} />}
                      </button>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 p-6 md:p-8 rounded-3xl transition-all border
                      ${isCompleted ? 'bg-sage/10/50 border-sage/20' : 
                        isInProgress ? 'bg-white border-sage/30 shadow-lg shadow-sage/100/5' : 
                        'bg-white border-sage/20 opacity-70 hover:opacity-100'}`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase
                              ${isCompleted ? 'bg-sage/20 text-forest' : 
                                isInProgress ? 'bg-sage/20 text-forest-dark' : 
                                'bg-sage/10 text-cream/500'}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-bold text-muted flex items-center gap-1">
                              <Clock size={14} /> Est. {item.estimatedHours || 2}h
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-ink">{item.title}</h4>
                          <p className="text-forest font-bold text-sm mt-1">{item.skillName}</p>
                        </div>
                        
                        {/* Mobile Action Button */}
                        <button 
                          onClick={() => handleStatusChange(item._id, isCompleted ? 'PENDING' : isInProgress ? 'COMPLETED' : 'IN_PROGRESS')}
                          className={`md:hidden p-3 rounded-xl border ${isCompleted ? 'bg-sage/20 text-forest border-sage/30' : isInProgress ? 'bg-sage/20 text-forest border-sage/30' : 'bg-sage/10 text-cream/500 border-sage/20'}`}
                        >
                           {isCompleted ? <CheckCircle2 size={24} /> : isInProgress ? <PlayCircle size={24} /> : <Circle size={24} />}
                        </button>
                      </div>
                      
                      <p className="text-cream/500 font-medium mb-6">
                        {item.description || "Master the core concepts of this skill by following the curated resource below. Complete practical exercises to reinforce your learning."}
                      </p>

                      <div className="flex items-center justify-between">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 text-sm font-bold text-forest-dark hover:text-forest transition-colors bg-cream/50 hover:bg-sage/10 px-4 py-2.5 rounded-xl"
                        >
                          <ExternalLink size={16} /> Open Resource
                        </a>
                        
                        {isInProgress && (
                          <button 
                            onClick={() => handleStatusChange(item._id, 'COMPLETED')}
                            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-forest hover:bg-forest-dark px-4 py-2.5 rounded-xl shadow-md transition-colors"
                          >
                            Mark Complete <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* End Node */}
              <div className="flex items-center gap-4 hidden md:flex">
                <div className="w-16 h-16 rounded-2xl bg-sage/100 flex items-center justify-center text-white shadow-lg shrink-0 z-10 border-4 border-white">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-black text-ink uppercase tracking-widest">INTERVIEW READY</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
