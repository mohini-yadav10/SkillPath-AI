import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Target, TrendingUp, AlertCircle, BookOpen, RefreshCw, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/analysis/skill-gap/latest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/analysis/recalculate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-500 font-medium tracking-wide">Synthesizing your career profile...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            Welcome back, {user?.firstName}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-600 font-medium">Your personalized AI career blueprint is ready.</p>
        </div>
        <button 
          onClick={handleRecalculate}
          disabled={recalculating}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2 disabled:bg-slate-400 disabled:shadow-none font-medium"
        >
          <RefreshCw size={18} className={recalculating ? 'animate-spin' : ''} />
          {recalculating ? 'Running Analysis...' : 'Re-sync Profile'}
        </button>
      </div>

      {!analysis ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <Target className="text-indigo-500" size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Career Target Set</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You need to select a Target Career role before we can analyze your skill gaps and build your learning path.</p>
          <button 
            onClick={() => window.location.href = '/career'}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Explore Career Paths
          </button>
        </div>
      ) : (
        <>
          {/* Top Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target size={80} className={analysis.readinessScore > 75 ? "text-emerald-500" : analysis.readinessScore > 50 ? "text-amber-500" : "text-rose-500"} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${analysis.readinessScore > 75 ? "bg-emerald-100 text-emerald-600" : analysis.readinessScore > 50 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"}`}>
                  <Target size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Career Readiness</h3>
              </div>
              <p className="text-4xl font-extrabold text-slate-800">{analysis.readinessScore}%</p>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                <div className={`h-full rounded-full ${analysis.readinessScore > 75 ? "bg-emerald-500" : analysis.readinessScore > 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${analysis.readinessScore}%` }}></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertCircle size={80} className="text-rose-600" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <AlertCircle size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Critical Gaps</h3>
              </div>
              <p className="text-4xl font-extrabold text-slate-800">{analysis.criticalGapsCount}</p>
              <p className="text-sm text-slate-500 font-medium mt-2">Skills needing immediate focus</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen size={80} className="text-emerald-600" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Matched Skills</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-extrabold text-slate-800">{analysis.matchedSkillsCount}</p>
                <p className="text-lg font-medium text-slate-400">/ {analysis.totalRequiredSkills}</p>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-2">Meeting industry standards</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 opacity-20">
                <TrendingUp size={100} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                  <Zap size={20} />
                </div>
                <h3 className="text-sm font-bold text-indigo-100 uppercase tracking-wider">AI Forecast</h3>
              </div>
              <p className="text-lg font-semibold leading-tight mt-1 mb-4 text-white">Based on recent data, you are projected to hit 85% readiness in 6 weeks.</p>
              <button className="flex items-center gap-1 text-sm font-bold text-indigo-200 hover:text-white transition-colors">
                View Learning Path <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Radar Chart */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">Skill Proficiency Radar</h3>
                <p className="text-sm text-slate-500 font-medium">Compare your current mastery against the target role requirements.</p>
              </div>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analysis.gaps}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skillName" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <Radar name="Target Required" dataKey="requiredProficiency" stroke="#cbd5e1" strokeWidth={2} fill="#cbd5e1" fillOpacity={0.2} />
                    <Radar name="Your Current Level" dataKey="currentProficiency" stroke="#6366f1" strokeWidth={3} fill="#818cf8" fillOpacity={0.5} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gap Analysis List / Bar Chart */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">Targeted Gap Analysis</h3>
                <p className="text-sm text-slate-500 font-medium">Areas of improvement prioritized by AI urgency algorithms.</p>
              </div>
              
              <div className="flex-grow space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                {analysis.gaps
                  .sort((a: any, b: any) => b.gapSize - a.gapSize)
                  .map((gap: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{gap.skillName}</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
                          ${gap.classification === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 
                            gap.classification === 'MAJOR' ? 'bg-orange-100 text-orange-700' :
                            gap.classification === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                          {gap.classification} GAP
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-slate-800">{gap.currentProficiency}</span>
                        <span className="text-sm font-medium text-slate-400"> / {gap.requiredProficiency}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4 flex overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${gap.currentProficiency}%` }}></div>
                      <div className="bg-rose-400 h-full opacity-60" style={{ width: `${gap.gapSize}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500 mt-2">
                      <span>Current Level</span>
                      <span>Target Gap (-{gap.gapSize})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
