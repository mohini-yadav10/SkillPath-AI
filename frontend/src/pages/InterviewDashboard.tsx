import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Video, History, Plus, BrainCircuit, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InterviewDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/interview/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.data.reverse()); // Chronological for chart
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const chartData = history.filter(h => h.status === 'COMPLETED').map((h, i) => ({
    name: `Int ${i + 1}`,
    score: h.scores?.overall || 0
  }));

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
        <div>
          <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
            <Video className="text-forest" size={32} />
            Virtual Interview
          </h1>
          <p className="text-forest-dark/70 mt-2">Practice with AI-driven technical and HR interviews.</p>
        </div>
        <Link to="/interview/setup" className="bg-forest text-white px-6 py-3 rounded-xl hover:bg-forest-dark font-bold flex items-center gap-2 transition-colors">
          <Plus size={20} /> New Interview
        </Link>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
          <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
            <TrendingUp className="text-sage/100" /> Performance Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
        <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
          <History className="text-sage/100" /> Interview History
        </h2>
        {history.length === 0 ? (
          <div className="text-center py-8 text-cream/500 flex flex-col items-center">
            <BrainCircuit size={48} className="text-sage/30 mb-4" />
            <p>You haven't taken any interviews yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...history].reverse().map(attempt => (
              <div key={attempt._id} className="flex items-center justify-between p-4 border border-sage/10 rounded-xl hover:bg-cream/50 transition-colors">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">{attempt.type} Interview</span>
                    <span className="px-2 py-1 bg-sage/10 text-forest-dark/70 text-xs rounded-md font-medium">{attempt.difficulty}</span>
                  </div>
                  <p className="text-sm text-cream/500 mt-1">
                    {new Date(attempt.createdAt).toLocaleDateString()} • {attempt.status}
                  </p>
                </div>
                {attempt.status === 'COMPLETED' ? (
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-cream/500 uppercase font-bold tracking-wider">Overall</p>
                      <p className="text-xl font-bold text-forest">{attempt.scores?.overall}%</p>
                    </div>
                    <Link to={`/interview/${attempt._id}/result`} className="text-forest hover:text-forest-dark font-medium bg-sage/10 px-4 py-2 rounded-lg">View Result</Link>
                  </div>
                ) : (
                  <Link to={`/interview/${attempt._id}/active`} className="text-forest hover:text-forest-dark font-medium bg-sage/10 px-4 py-2 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} /> Resume
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
