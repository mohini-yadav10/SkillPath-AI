import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Award, CalendarDays, BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import axios from 'axios';

export default function CareerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analytics/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data.data);
      } catch (error) {
        console.error("Error fetching analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-sage/30 p-8 text-center">
        <BarChart3 className="text-sage mb-4" size={48} />
        <h3 className="text-xl font-bold text-forest mb-2">Insufficient Data</h3>
        <p className="text-muted">Complete more assessments to generate your career trends.</p>
      </div>
    );
  }

  // Format data for charts
  const readinessData = analytics.readinessHistory.map((item: any, index: number) => ({
    name: `Week ${index + 1}`,
    score: item.score
  }));

  const assessmentData = analytics.assessmentHistory.map((a: any, i: number) => ({
    name: `Assmt ${i + 1}`,
    score: a.score
  }));

  const currentReadiness = analytics.currentReadiness || 0;
  const initialReadiness = readinessData[0]?.score || 0;
  const readinessChange = currentReadiness - initialReadiness;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-black text-forest tracking-tight">Career Analytics</h1>
        <p className="text-muted mt-2 text-lg">Track how your skills and career readiness are changing over time.</p>
      </div>

      {/* Gamification / Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-sage/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center text-cream">
              <TrendingUp size={20} />
            </div>
            <span className={`text-sm font-bold ${readinessChange >= 0 ? 'text-forest' : 'text-red-500'}`}>
              {readinessChange >= 0 ? '+' : ''}{readinessChange}%
            </span>
          </div>
          <p className="text-sm text-muted font-semibold uppercase tracking-wider mb-1">Career Readiness</p>
          <h3 className="text-3xl font-black text-ink">{currentReadiness}%</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sage/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold">
              <Award size={20} />
            </div>
            <span className="text-xs font-bold text-gold uppercase tracking-widest px-2 py-1 bg-gold/10 rounded-full">Level {analytics.gamification.level}</span>
          </div>
          <p className="text-sm text-muted font-semibold uppercase tracking-wider mb-1">Career XP</p>
          <h3 className="text-3xl font-black text-ink">{analytics.gamification.xp}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sage/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-coral/20 rounded-xl flex items-center justify-center text-coral">
              <CalendarDays size={20} />
            </div>
            {analytics.gamification.learningStreak > 0 && (
              <span className="text-xs font-bold text-coral uppercase tracking-widest flex items-center gap-1">
                🔥 Hot Streak
              </span>
            )}
          </div>
          <p className="text-sm text-muted font-semibold uppercase tracking-wider mb-1">Learning Streak</p>
          <h3 className="text-3xl font-black text-ink">{analytics.gamification.learningStreak} Days</h3>
        </div>

        <div className="bg-forest text-cream p-6 rounded-3xl border border-forest-dark shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
            <BrainCircuit size={100} />
          </div>
          <h3 className="text-lg font-bold text-sage mb-2 relative z-10">AI Insight</h3>
          <p className="text-sm font-medium leading-relaxed relative z-10">
            {readinessChange > 0 
              ? "Your career readiness is trending upwards! Consistent learning is paying off."
              : "Complete more learning modules and assessments to generate personalized career insights."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Readiness History Chart */}
        <div className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-forest">Career Readiness Over Time</h2>
              <p className="text-sm text-muted">Historical projection based on your activity</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readinessData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#163C35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#163C35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71807B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71807B', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#163C35', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#163C35" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assessment Performance Chart */}
        <div className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-forest">Assessment Performance</h2>
              <p className="text-sm text-muted">Recent assessment scores</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            {assessmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assessmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71807B', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#71807B', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#D6A84A', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#D6A84A" strokeWidth={3} dot={{r: 4, fill: '#D6A84A', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-sage/30 rounded-2xl">
                <Target className="text-sage mb-2" size={32} />
                <p className="text-muted text-sm">Take more assessments to see your trend</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
