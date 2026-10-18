import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCareerTarget } from '../context/CareerContext';
import { 
  ArrowRight, 
  Compass, 
  Target, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  FileCheck, 
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import SkillGraph from '../components/career/SkillGraph';
import type { GraphNode, GraphEdge } from '../components/career/SkillGraph';
import CareerTwinCard from '../components/career/CareerTwinCard';
import type { CareerTwinPayload } from '../components/career/CareerTwinCard';

const CountUp = ({ to, duration = 2 }: { to: number; duration?: number }) => {
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
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[]; roleTitle?: string }>({ nodes: [], edges: [] });
  const [careerTwinData, setCareerTwinData] = useState<{ twin: CareerTwinPayload; projects: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [analysisRes, analyticsRes, graphRes, twinRes] = await Promise.all([
          axios.get('http://localhost:5000/api/analysis/skill-gap/latest', { headers }).catch(() => ({ data: { data: null } })),
          axios.get('http://localhost:5000/api/analytics/overview', { headers }).catch(() => null),
          axios.get('http://localhost:5000/api/analysis/skill-graph', { headers }).catch(() => ({ data: { data: null } })),
          axios.get('http://localhost:5000/api/analysis/career-twin', { headers }).catch(() => ({ data: { data: null } }))
        ]);
        
        if (analysisRes?.data?.data) {
          setAnalysis(analysisRes.data.data);
        }
        if (analyticsRes?.data?.data) {
          setAnalyticsData(analyticsRes.data.data);
        }
        if (graphRes?.data?.data) {
          setGraphData({
            nodes: graphRes.data.data.nodes || [],
            edges: graphRes.data.data.edges || [],
            roleTitle: graphRes.data.data.roleTitle
          });
        }
        if (twinRes?.data?.data) {
          setCareerTwinData({
            twin: twinRes.data.data.careerTwin,
            projects: twinRes.data.data.projects || []
          });
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

  const readinessScore = analysis?.readinessScore || careerTwinData?.twin?.marketReadinessIndex || 0;

  // Timeline data from analytics history or synthetic
  const timelineData = analyticsData?.readinessHistory?.length > 0
    ? analyticsData.readinessHistory.map((h: any, i: number) => ({ name: `Wk ${i + 1}`, readiness: h.score }))
    : [
        { name: 'Week 1', readiness: Math.max(0, readinessScore - 20) },
        { name: 'Week 2', readiness: Math.max(0, readinessScore - 12) },
        { name: 'Week 3', readiness: Math.max(0, readinessScore - 8) },
        { name: 'Week 4', readiness: Math.max(0, readinessScore - 3) },
        { name: 'Week 5', readiness: Math.max(0, readinessScore - 1) },
        { name: 'Week 6', readiness: readinessScore },
      ];

  const gaps = analysis?.gaps || [];

  return (
    <div className="space-y-10 pb-12">
      {/* Organic Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-sage/20 rounded-[2.5rem] shadow-sm -z-10 transform -rotate-1 scale-[1.02]"></div>
        <div className="bg-white text-forest p-8 lg:p-12 rounded-[2.5rem] shadow-sm border border-sage/30 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Compass size={250} />
          </div>
          
          <div className="relative z-10 max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight text-forest"
            >
              Welcome back, {user?.firstName || user?.name?.split(' ')[0] || 'Aarav'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted font-medium text-lg mb-6"
            >
              Your digital Career Twin is tracking {graphData.nodes.length || 9} skills against <strong className="text-forest">{target?.roleName || 'Full Stack Developer'}</strong>.
            </motion.p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate('/learning')} 
                className="bg-forest text-cream font-bold py-3 px-6 rounded-2xl shadow-lg hover:bg-forest-dark transition flex items-center gap-2 group"
              >
                Curriculum Roadmap <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/career-simulator')} 
                className="bg-cream text-forest font-bold py-3 px-5 rounded-2xl border border-sage/50 hover:bg-sage/10 transition flex items-center gap-2"
              >
                Simulate Growth <Activity size={17} />
              </button>
            </div>
          </div>
          
          {/* Quick Target Metric Card */}
          <div className="relative z-10 w-full md:w-auto bg-cream/70 p-6 rounded-3xl border border-sage/40 flex flex-col items-center min-w-[240px]">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted mb-2">Target Market Match</span>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#DDEBE6" strokeWidth="8" fill="none" />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  stroke="#123F36" strokeWidth="8" fill="none" 
                  strokeLinecap="round"
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2} 
                  animate={{ strokeDashoffset: 251.2 - (251.2 * readinessScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-forest"><CountUp to={readinessScore} />%</span>
                <span className="text-[10px] font-bold text-muted uppercase">Readiness</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              <TrendingUp size={14} /> +8% from baseline
            </div>
          </div>

        </div>
      </div>

      {/* Career Twin Synthesis Card */}
      {careerTwinData && (
        <CareerTwinCard 
          twin={careerTwinData.twin}
          roleTitle={target?.roleName || undefined}
          companyName={target?.companyName || undefined}
          projects={careerTwinData.projects}
        />
      )}

      {/* Interactive Visual Skill Graph */}
      <SkillGraph 
        nodes={graphData.nodes}
        edges={graphData.edges}
        roleTitle={graphData.roleTitle || target?.roleName || undefined}
      />

      {/* Prioritized Skill Gaps & Readiness Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Prioritized Skill Gaps Breakdown (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-sage/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-forest">Prioritized Skill Gaps</h3>
                <p className="text-xs text-muted font-medium mt-0.5">
                  Actionable gap analysis ranked by career impact and prerequisite readiness.
                </p>
              </div>
              <button 
                onClick={() => navigate('/learning')}
                className="text-xs font-bold text-forest hover:text-gold flex items-center gap-1 transition"
              >
                View all in Roadmap <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {gaps.slice(0, 4).map((gap: any, index: number) => {
                const priorityBadge = gap.priority === 'HIGH'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : gap.priority === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300';

                return (
                  <div 
                    key={gap.skillId || index}
                    className="p-4 rounded-2xl border border-sage/30 bg-cream/40 hover:bg-cream/70 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-forest">{gap.skillName}</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                          {gap.priority || 'MEDIUM'} Priority
                        </span>
                        {gap.gapSize > 0 && (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            -{gap.gapSize}% gap
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-forest-dark/80 font-medium max-w-xl">
                        {gap.recommendation || `Current level: ${gap.currentProficiency}% / Required: ${gap.requiredProficiency}%.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                      {gap.estimatedHoursToClose && (
                        <span className="text-xs font-bold text-muted flex items-center gap-1">
                          <Clock size={13} /> ~{gap.estimatedHoursToClose}h
                        </span>
                      )}
                      <button
                        onClick={() => navigate('/learning')}
                        className="bg-forest hover:bg-forest-dark text-cream text-xs font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        Bridge Gap &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Readiness Trajectory Chart (1 Column) */}
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-sage/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-forest">Readiness Trend</h3>
                <p className="text-xs text-muted font-medium mt-0.5">Historical trajectory over sprints.</p>
              </div>
            </div>

            <div className="w-full h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#123F36" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#123F36" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71807B', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#71807B', fontSize: 11 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '14px', backgroundColor: '#123F36', color: '#fff', border: 'none' }}
                    itemStyle={{ color: '#8FB8AA', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="readiness" stroke="#123F36" strokeWidth={3} fillOpacity={1} fill="url(#readinessGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-sage/20 flex justify-between items-center text-xs font-bold text-muted">
            <span>Current benchmark</span>
            <span className="text-forest font-black text-sm">{readinessScore}% Match</span>
          </div>
        </div>

      </div>

      {/* Activity and Assessments Row */}
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
                  <p className="text-xs text-muted font-medium">Verified skill attempts</p>
                </div>
              </div>
              <span className="text-2xl font-black text-forest">{analyticsData?.stats?.completedAssessments ?? '--'}</span>
            </div>
            
            <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><Activity size={20}/></div>
                <div>
                  <p className="font-bold text-forest-dark">Average Score</p>
                  <p className="text-xs text-muted font-medium">Across all assessments</p>
                </div>
              </div>
              <span className="text-2xl font-black text-forest">
                {analyticsData?.stats?.avgAssessmentScore != null ? `${analyticsData.stats.avgAssessmentScore}%` : '--'}
              </span>
            </div>
            
            <button onClick={() => navigate('/assessment')} className="w-full py-4 mt-2 text-forest font-bold hover:bg-forest/5 rounded-xl transition border border-dashed border-sage flex items-center justify-center gap-2">
              Take new assessment <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-sage">
          <h3 className="text-xl font-bold text-forest mb-6">Recent Activity</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-sage before:to-transparent">
            
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-sage text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CheckCircle2 size={16} />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-cream p-4 rounded-2xl border border-sage shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-forest-dark text-sm">Career Twin Synthesized</span>
                  <span className="text-xs font-bold text-muted">Today</span>
                </div>
                <p className="text-xs text-muted font-medium">Digital replica updated to 74% readiness.</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gold text-forest shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Target size={16} />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-cream p-4 rounded-2xl border border-sage shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-forest-dark text-sm">Target Role Configured</span>
                  <span className="text-xs font-bold text-muted">Active</span>
                </div>
                <p className="text-xs text-muted font-medium">Targeting {target?.roleName || 'Full Stack Developer'}.</p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>

    </div>
  );
}
