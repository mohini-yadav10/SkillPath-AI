import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Video,
  History,
  Plus,
  BrainCircuit,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Building2,
  Award,
  Layers
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import QuestionBankLibrary from '../components/interview/QuestionBankLibrary';

export default function InterviewDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionBank, setShowQuestionBank] = useState(false);

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

  const completedInterviews = history.filter(h => h.status === 'COMPLETED');
  const chartData = completedInterviews.map((h, i) => ({
    name: `Session ${i + 1}`,
    score: h.scores?.overall || 0,
    technical: h.scores?.technical || 0,
    communication: h.scores?.communication || 0
  }));

  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, h) => sum + (h.scores?.overall || 0), 0) /
            completedInterviews.length
        )
      : 0;

  if (loading) {
    return (
      <div className="text-center py-20 text-forest font-bold text-sm flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
        <span>Loading Virtual Interview Hub...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Question Bank Modal */}
      {showQuestionBank && (
        <QuestionBankLibrary
          isOpenAsModal={true}
          onClose={() => setShowQuestionBank(false)}
        />
      )}

      {/* Hero Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-sage/20">
        <div>
          <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider mb-1">
            <Video size={16} /> Virtual Interview Hub
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Interview Intelligence & Practice</h1>
          <p className="text-xs sm:text-sm text-muted font-medium mt-1">
            Simulate company-specific technical rounds, evaluate real answer evidence, and track performance.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowQuestionBank(true)}
            className="bg-cream hover:bg-sage/20 text-forest font-bold px-5 py-3 rounded-2xl border border-sage/30 text-xs transition shadow-xs flex items-center gap-2"
          >
            <BookOpen size={16} /> Question Bank
          </button>
          <Link
            to="/interview/setup"
            className="bg-forest text-cream px-6 py-3 rounded-2xl hover:bg-forest-dark font-bold text-xs flex items-center gap-2 transition shadow-md"
          >
            <Plus size={16} /> New Virtual Interview
          </Link>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted block">Completed</span>
            <span className="text-xl font-black text-ink">{completedInterviews.length} Sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 text-forest flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted block">Average Score</span>
            <span className="text-xl font-black text-ink">{avgScore}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted block">Company Sourced</span>
            <span className="text-xl font-black text-emerald-800">TCS / Top Tech</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted block">Adaptive Engine</span>
            <span className="text-xl font-black text-amber-900">Active</span>
          </div>
        </div>
      </div>

      {/* Performance Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-sage/20 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-forest flex items-center gap-2">
              <TrendingUp className="text-gold" size={20} /> Performance Progression
            </h2>
            <span className="text-xs text-muted font-medium">Session Score History</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#627A73" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#627A73" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #DCE5E1',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Overall Score"
                  stroke="#123F36"
                  strokeWidth={3}
                  dot={{ fill: '#E3B341', r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="technical"
                  name="Technical Rubric"
                  stroke="#8FB8AA"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History Records */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-sage/20 space-y-4">
        <h2 className="text-lg font-black text-forest flex items-center gap-2">
          <History className="text-forest" size={20} /> Interview History Records
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-12 text-muted flex flex-col items-center max-w-sm mx-auto">
            <BrainCircuit size={48} className="text-sage/40 mb-3" />
            <p className="font-bold text-ink">No interviews recorded yet</p>
            <p className="text-xs mt-1">
              Start your first session to benchmark your technical communication and receive personalized learning recommendations.
            </p>
            <Link
              to="/interview/setup"
              className="mt-4 bg-forest text-cream px-5 py-2 rounded-xl font-bold text-xs hover:bg-forest-dark transition"
            >
              Start Virtual Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {[...history].reverse().map(attempt => (
              <div
                key={attempt._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-sage/15 rounded-2xl hover:bg-cream/30 transition-colors gap-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink text-sm">
                      {attempt.type} Session
                    </span>
                    {attempt.company && (
                      <span className="px-2 py-0.5 bg-sage/15 text-forest-dark text-[11px] rounded-md font-bold flex items-center gap-1">
                        <Building2 size={11} /> {attempt.company}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-cream text-muted text-[10px] rounded-md font-semibold border border-sage/30">
                      {attempt.difficulty}
                    </span>
                    <span className="px-2 py-0.5 bg-cream text-muted text-[10px] rounded-md font-semibold border border-sage/30">
                      {attempt.sessionMode?.replace(/_/g, ' ') || 'ADAPTIVE MOCK'}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {new Date(attempt.createdAt).toLocaleDateString()} • {attempt.status} •{' '}
                    {attempt.questions?.length || 0} Questions
                  </p>
                </div>

                {attempt.status === 'COMPLETED' ? (
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-sage/10">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Overall Score</p>
                      <p className="text-xl font-black text-forest">{attempt.scores?.overall || 0}%</p>
                    </div>
                    <Link
                      to={`/interview/${attempt._id}/result`}
                      className="text-xs font-bold bg-forest text-cream hover:bg-forest-dark px-4 py-2.5 rounded-xl transition shadow-xs"
                    >
                      View Report
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={`/interview/${attempt._id}/active`}
                    className="text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <AlertCircle size={14} /> Resume Session
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
