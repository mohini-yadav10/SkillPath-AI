import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCareerTarget } from '../context/CareerContext';
import { ArrowRight, Compass, Target, BrainCircuit, Activity, BarChart3, TrendingUp, Sparkles, BookOpen, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const CountUp = ({ to, duration = 2 }: { to: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = to;
    if (start === end) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [to, duration]);
  
  return <>{count}</>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { target } = useCareerTarget();
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const [analysisRes, analyticsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/analysis/skill-gap/latest', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/analytics/overview', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
        ]);
        
        setAnalysis(analysisRes.data.data);
        if (analyticsRes && analyticsRes.data) {
          setAnalyticsData(analyticsRes.data.data);
        }
      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const readinessScore = analysis?.readinessScore || 0;

  // Mock timeline data since API might not have it yet
  const timelineData = [
    { name: 'Week 1', readiness: Math.max(0, readinessScore - 20) },
    { name: 'Week 2', readiness: Math.max(0, readinessScore - 12) },
    { name: 'Week 3', readiness: Math.max(0, readinessScore - 8) },
    { name: 'Week 4', readiness: Math.max(0, readinessScore - 3) },
    { name: 'Week 5', readiness: Math.max(0, readinessScore - 1) },
    { name: 'Week 6', readiness: readinessScore },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Organic Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-sage/20 rounded-[2.5rem] shadow-sm -z-10 transform -rotate-1 scale-[1.02]"></div>
        <div className="bg-white text-forest p-10 lg:p-12 rounded-[2.5rem] shadow-sm border border-sage/30 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
          
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Compass size={250} />
          </div>
          
          <div className="relative z-10 max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight text-forest"
            >
              Welcome back, {user?.name?.split(' ')[0] || 'Aarav'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted font-medium text-lg mb-8"
            >
              Your career path is getting clearer.
            </motion.p>
            
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/learning')} className="bg-forest text-cream font-bold py-3 px-6 rounded-2xl shadow-lg hover:bg-forest-dark transition-colors flex items-center gap-2 group">
                Explore my path <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Animated Path Illustration */}
          <div className="relative z-10 hidden lg:flex flex-col items-center bg-cream/50 p-8 rounded-3xl border border-sage/40 min-w-[300px]">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Journey to {target?.roleName || 'Target Role'}</p>
            
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-forest font-bold shadow-sm z-10 border-2 border-forest">YOU</div>
              <div className="h-6 w-0.5 bg-sage/50 relative">
                <motion.div className="absolute top-0 left-0 w-full bg-forest" animate={{ height: ['0%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-muted font-bold shadow-sm border border-sage/50 z-10 text-xs">Gaps</div>
              <div className="h-6 w-0.5 bg-sage/50"></div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-muted font-bold shadow-sm border border-sage/50 z-10"><BookOpen size={16}/></div>
              <div className="h-6 w-0.5 bg-sage/50"></div>
              <div className="w-14 h-14 bg-forest rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-forest/20 z-10 border-4 border-white"><Target size={24}/></div>
            </div>
          </div>
        </div>
      </div>

      {analyticsData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-sage/30 shadow-sm flex items-center justify-between group hover:border-forest transition-colors cursor-pointer" onClick={() => navigate('/analytics')}>
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Readiness</p>
              <h3 className="text-2xl font-black text-forest">{(!analysis || analysis.totalRequiredSkills === 0) ? "--" : `${analyticsData?.currentReadiness || 0}%`}</h3>
            </div>
            <div className="w-12 h-12 bg-sage/20 text-forest rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target size={20} />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-3xl border border-sage/30 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">XP / Level</p>
              <h3 className="text-2xl font-black text-gold">{analyticsData.gamification.xp} <span className="text-base text-muted ml-1">Lvl {analyticsData.gamification.level}</span></h3>
            </div>
            <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sage/30 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Hot Streak</p>
              <h3 className="text-2xl font-black text-coral">{analyticsData.gamification.learningStreak} Days</h3>
            </div>
            <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>

          <div className="bg-forest text-cream p-5 rounded-3xl border border-forest-dark shadow-sm flex items-center justify-between cursor-pointer group hover:bg-forest-dark transition-colors" onClick={() => navigate('/analytics')}>
            <div>
              <p className="text-xs font-bold text-sage uppercase tracking-widest mb-1">Insights</p>
              <h3 className="text-lg font-bold">View Analytics</h3>
            </div>
            <div className="w-10 h-10 bg-cream/10 text-cream rounded-2xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Career Readiness Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-white p-8 rounded-[2rem] shadow-sm border border-sage relative overflow-hidden flex flex-col items-center justify-center"
        >
          <div className="absolute top-6 left-6 text-xs font-bold text-muted uppercase tracking-wider">Metric</div>
          <h3 className="text-xl font-bold text-forest mb-6 mt-4">Career Readiness</h3>
          
          {(!analysis || analysis.totalRequiredSkills === 0) ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-sage/20 text-forest flex items-center justify-center mb-4">
                <AlertCircle size={28} />
              </div>
              <p className="text-forest-dark font-medium text-sm">
                Readiness unavailable — target skill requirements are being prepared.
              </p>
            </div>
          ) : (
            <>
              <div className="relative w-48 h-48 flex items-center justify-center mb-4 group cursor-pointer" onClick={() => navigate('/career')}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#DDEBE6" strokeWidth="8" fill="none" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    stroke="#173F3A" strokeWidth="8" fill="none" 
                    strokeLinecap="round"
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2} 
                    animate={{ strokeDashoffset: 251.2 - (251.2 * readinessScore) / 100 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-5xl font-black text-forest"><CountUp to={readinessScore} />%</span>
                </div>
              </div>
              
              <div className="bg-sage/20 text-forest-dark px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 mb-2">
                <TrendingUp size={16} /> +8% this month
              </div>
              <p className="text-sm text-muted text-center font-medium px-4">Consistent progress across core competencies.</p>
            </>
          )}
        </motion.div>

        {/* AI Insight & Target Role */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Target Role Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/career')}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-sage/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:shadow-md hover:border-sage transition-all group"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Target Role</span>
                <span className="bg-forest text-cream text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest">{target?.companyName || 'Any Company'}</span>
              </div>
              <h2 className="text-3xl font-black text-forest mb-4 group-hover:text-sage transition-colors">{target?.roleName || 'Target Role Not Selected'}</h2>
              
              <div className="flex flex-wrap gap-2">
                {analysis?.gaps?.slice(0, 4).map((gap: any, i: number) => (
                  <span key={i} className="bg-cream border border-sage/50 text-forest-dark px-3 py-1.5 rounded-xl text-xs font-bold">
                    {gap.skillName}
                  </span>
                ))}
                {analysis?.gaps?.length > 4 && (
                  <span className="bg-cream border border-sage/50 text-muted px-3 py-1.5 rounded-xl text-xs font-bold">+{analysis.gaps.length - 4}</span>
                )}
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center bg-cream p-4 rounded-2xl border border-sage/50 min-w-[120px]">
              <span className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Match</span>
              {(!analysis || analysis.totalRequiredSkills === 0) ? (
                <span className="text-4xl font-black text-forest">--</span>
              ) : (
                <span className="text-4xl font-black text-forest"><CountUp to={readinessScore} />%</span>
              )}
            </div>
          </motion.div>

          {/* Elegant AI Insight */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-cream p-8 rounded-[2rem] border border-sage/50 relative overflow-hidden"
          >
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-2">AI Career Insight</h3>
                <p className="text-forest-dark font-medium leading-relaxed max-w-2xl text-sm md:text-base">
                  Your core skills are approaching the target level for {target?.companyName || 'your target role'}. 
                  {analysis?.gaps?.length > 0 ? (
                    <>However, <strong>{analysis.gaps[0].skillName}</strong> is currently your largest gap. Focusing here could increase your target-role match significantly.</>
                  ) : (
                    <>Keep learning and take assessments to identify potential skill gaps.</>
                  )}
                </p>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => navigate('/learning')} className="text-sm font-bold text-forest hover:text-gold transition-colors flex items-center gap-1">
                    View recommendation <ArrowRight size={14} />
                  </button>
                  <button className="text-sm font-medium text-muted hover:text-forest transition-colors">
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>

      {/* Interactive Skill Constellation & Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Skill Constellation (Visual Map Representation) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-sage flex flex-col relative min-h-[450px]">
          <h3 className="text-xl font-bold text-forest mb-2">Skill Map</h3>
          <p className="text-sm text-muted font-medium mb-6">Interactive view of your capability network.</p>
          
          <div className="flex-1 relative bg-cream/50 rounded-3xl border border-sage/50 overflow-hidden flex items-center justify-center p-4">
            
            {/* Highly stylized constellation representation */}
            <div className="relative w-full h-full min-h-[300px]">
              
              {/* SVG Connecting Lines (Decorative representation) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <path d="M 30% 30% Q 50% 20% 70% 40% T 50% 70% T 20% 60% Z" fill="none" stroke="#DDEBE6" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 50% 50% L 70% 40%" fill="none" stroke="#DDEBE6" strokeWidth="2" />
                <path d="M 50% 50% L 30% 30%" fill="none" stroke="#DDEBE6" strokeWidth="2" />
                <path d="M 50% 50% L 50% 70%" fill="none" stroke="#DDEBE6" strokeWidth="2" />
                <path d="M 50% 50% L 20% 60%" fill="none" stroke="#DDEBE6" strokeWidth="2" />
              </svg>

              {/* Central Target Node */}
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-forest rounded-full shadow-lg border-4 border-white flex flex-col items-center justify-center text-white cursor-pointer z-10 hover:scale-110 transition-transform"
                onClick={() => setSelectedNode(null)}
              >
                <Target size={24} />
                <span className="text-[10px] font-bold mt-1">CORE</span>
              </motion.div>

              {/* Render dynamic nodes based on gaps */}
              {analysis?.gaps?.slice(0, 5).map((gap: any, i: number) => {
                const positions = [
                  { top: '30%', left: '30%' },
                  { top: '40%', left: '70%' },
                  { top: '70%', left: '50%' },
                  { top: '60%', left: '20%' },
                  { top: '20%', left: '50%' },
                ];
                const pos = positions[i % 5];
                
                // Color logic based on gap
                let bgColor = 'bg-gold'; // Medium
                let ringColor = 'ring-gold/30';
                if (gap.gapSize > 40) { bgColor = 'bg-coral'; ringColor = 'ring-coral/30'; } // Weak
                if (gap.gapSize < 15) { bgColor = 'bg-forest'; ringColor = 'ring-forest/30'; } // Strong

                const isSelected = selectedNode?.skillName === gap.skillName;

                return (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 ${bgColor} rounded-full shadow-md border-2 border-white flex items-center justify-center cursor-pointer z-10 transition-all duration-300 ${isSelected ? `ring-4 ${ringColor} scale-110` : 'hover:scale-110'}`}
                    style={pos}
                    onClick={() => setSelectedNode(gap)}
                    whileHover={{ scale: 1.15 }}
                  >
                    <span className={`text-[10px] font-bold text-center px-1 ${bgColor === 'bg-forest' ? 'text-white' : 'text-forest-dark'}`}>{gap.skillName}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Node Details Overlay */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-2xl shadow-xl border border-sage z-20 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-forest">{selectedNode.skillName}</h4>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span className="text-muted font-medium">Level: <strong className="text-forest-dark">{selectedNode.currentProficiency}%</strong></span>
                      <span className="text-muted font-medium">Required: <strong className="text-forest-dark">{selectedNode.requiredProficiency}%</strong></span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/learning')} className="bg-forest text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-forest-dark transition-colors">
                    Learn →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Career Progress Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-sage flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-forest mb-1">Career Progress</h3>
              <p className="text-sm text-muted font-medium">Readiness trend over time.</p>
            </div>
            <select className="bg-cream border border-sage text-forest-dark text-sm font-bold rounded-xl px-3 py-1.5 outline-none">
              <option>90 Days</option>
              <option>30 Days</option>
            </select>
          </div>
          
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173F3A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#173F3A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71807B', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71807B', fontSize: 12, fontWeight: 500 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0F302D', color: '#fff' }}
                  itemStyle={{ color: '#DDEBE6', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="readiness" stroke="#173F3A" strokeWidth={4} fillOpacity={1} fill="url(#colorReadiness)" activeDot={{ r: 6, fill: '#D6A84A', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Activity and Assessments row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Assessment Performance */}
        <div className="bg-cream p-8 rounded-[2.5rem] border border-sage/50">
          <h3 className="text-xl font-bold text-forest mb-6">Assessment Profile</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-dark/5 flex items-center justify-center text-forest"><FileCheck size={20}/></div>
                <div>
                  <p className="font-bold text-forest-dark">Completed Tests</p>
                  <p className="text-xs text-muted font-medium">Verified attempts</p>
                </div>
              </div>
              <span className="text-2xl font-black text-forest">3</span>
            </div>
            
            <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><Activity size={20}/></div>
                <div>
                  <p className="font-bold text-forest-dark">Average Score</p>
                  <p className="text-xs text-muted font-medium">Across all domains</p>
                </div>
              </div>
              <span className="text-2xl font-black text-forest">84%</span>
            </div>
            
            <button onClick={() => navigate('/assessment')} className="w-full py-4 mt-2 text-forest-dark font-bold hover:bg-forest/5 rounded-xl transition-colors border border-dashed border-sage flex items-center justify-center gap-2">
              Take new assessment <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Elegant Timeline */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-sage">
          <h3 className="text-xl font-bold text-forest mb-6">Recent Activity</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-sage before:to-transparent">
            
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-sage text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CheckCircle2 size={16} />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-cream p-4 rounded-2xl border border-sage shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-forest-dark text-sm">Skill Assessment</span>
                  <span className="text-xs font-bold text-muted">2d ago</span>
                </div>
                <p className="text-xs text-muted font-medium">Scored 88% proficiency.</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gold text-forest shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Target size={16} />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-cream p-4 rounded-2xl border border-sage shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-forest-dark text-sm">Target Updated</span>
                  <span className="text-xs font-bold text-muted">1w ago</span>
                </div>
                <p className="text-xs text-muted font-medium">Set Full Stack Developer.</p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>

    </div>
  );
}
