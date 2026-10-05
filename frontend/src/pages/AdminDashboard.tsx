import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, AlertTriangle, BookOpen, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      <p className="text-muted font-medium tracking-wide">Loading University Analytics...</p>
    </div>
  );

  if (!stats) return <div className="text-center py-20 text-red-500 font-bold">Failed to load admin stats.</div>;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-forest to-forest-dark p-8 rounded-2xl border border-forest-dark shadow-md text-white">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <Activity className="text-forest" size={32} /> Admin Dashboard
          </h1>
          <p className="text-sage/30 font-medium">University-wide Career Readiness Analytics.</p>
        </div>
      </div>

      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/20 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={80} className="text-forest" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-sage/10 text-forest">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Total Students</h3>
          </div>
          <p className="text-4xl font-extrabold text-ink">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/20 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <GraduationCap size={80} className="text-forest" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-sage/10 text-forest">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Avg Readiness</h3>
          </div>
          <p className="text-4xl font-extrabold text-ink">{stats.avgReadiness}%</p>
          <div className="w-full bg-sage/10 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-sage h-full rounded-full" style={{ width: `${stats.avgReadiness}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/20 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen size={80} className="text-forest" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50 text-forest">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Total Alumni</h3>
          </div>
          <p className="text-4xl font-extrabold text-ink">{stats.totalAlumni}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-sage/20">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-ink">Most Common Critical Skill Gaps</h3>
            <p className="text-sm text-muted font-medium">Skills where the most students are failing to meet target role requirements.</p>
          </div>
        </div>
        
        {stats.topGaps.length === 0 ? (
          <div className="text-center py-10 text-muted">No skill gaps analyzed yet.</div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topGaps} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="count" name="Students Missing Skill" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
