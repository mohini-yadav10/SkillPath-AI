import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Award, Target, MessageSquare, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function InterviewResult() {
  const { id } = useParams();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/interview/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResult(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResult();
  }, [id]);

  if (!result) return <div className="text-center py-20">Loading Results...</div>;

  const scores = result.scores || { overall: 0, technical: 0, communication: 0, relevance: 0 };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-sage/20 text-forest rounded-full mb-4">
          <Award size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-ink">Interview Evaluation</h1>
        <p className="text-muted mt-2 text-lg">AI Analysis Complete</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-forest to-forest rounded-3xl p-6 text-white flex flex-col justify-center items-center text-center shadow-lg shadow-sage/30">
          <p className="text-sage/20 font-bold uppercase tracking-widest text-sm mb-2">Overall Score</p>
          <div className="text-6xl font-black">{scores.overall}%</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-sage/10 shadow-sm flex flex-col justify-center items-center text-center">
          <Target className="text-forest mb-2" size={28} />
          <p className="text-muted font-bold text-sm">Technical</p>
          <div className="text-3xl font-black text-ink">{scores.technical}%</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-sage/10 shadow-sm flex flex-col justify-center items-center text-center">
          <MessageSquare className="text-sage mb-2" size={28} />
          <p className="text-muted font-bold text-sm">Communication</p>
          <div className="text-3xl font-black text-ink">{scores.communication}%</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-sage/10 shadow-sm flex flex-col justify-center items-center text-center">
          <CheckCircle className="text-amber-500 mb-2" size={28} />
          <p className="text-muted font-bold text-sm">Relevance</p>
          <div className="text-3xl font-black text-ink">{scores.relevance}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-sage/20 shadow-sm">
          <h3 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
            <CheckCircle className="text-sage" /> Key Strengths
          </h3>
          {result.strengths?.length > 0 ? (
            <ul className="space-y-3">
              {result.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-forest bg-sage/10 p-3 rounded-xl font-medium">
                  <div className="w-2 h-2 rounded-full bg-sage" /> Demonstrated mastery in {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No major technical strengths identified in this session.</p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm">
          <h3 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Areas for Improvement
          </h3>
          {result.weaknesses?.length > 0 ? (
            <ul className="space-y-4">
              {result.weaknesses.map((w: any, i: number) => (
                <li key={i} className="text-red-700 bg-red-50 p-4 rounded-xl font-medium text-sm leading-relaxed">
                  <span className="font-bold block text-red-800 mb-1">Issue: {w.skillName}</span>
                  {w.feedback}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Excellent! No critical weaknesses identified.</p>
          )}
        </div>
      </div>

      {result.weaknesses?.length > 0 && (
        <div className="bg-sage/10 border border-sage/20 rounded-3xl p-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-forest-dark mb-1">Learning Path Updated!</h3>
            <p className="text-forest-dark font-medium">We've automatically added review materials for your weak areas.</p>
          </div>
          <Link to="/learning" className="bg-forest text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-forest-dark transition-colors">
            View Learning Path <ArrowRight size={20} />
          </Link>
        </div>
      )}
      
      <div className="mt-10">
        <h3 className="text-xl font-bold text-ink mb-6">Detailed Feedback</h3>
        <div className="space-y-4">
          {result.questions.map((q: any, i: number) => (
            <div key={i} className="bg-white border border-sage/20 rounded-2xl p-6">
              <p className="font-bold text-ink mb-2">Q: {q.questionText}</p>
              <p className="text-forest-dark/70 bg-cream/50 p-4 rounded-xl mb-4 text-sm italic">"{q.studentAnswer}"</p>
              <div className="flex gap-4 mb-4">
                <span className="px-3 py-1 bg-sage/10 text-forest-dark text-xs font-bold rounded-lg">Tech: {q.techScore}/100</span>
                <span className="px-3 py-1 bg-sage/10 text-forest text-xs font-bold rounded-lg">Comm: {q.commScore}/100</span>
              </div>
              <p className="text-sm font-medium text-forest-dark">💡 AI Feedback: {q.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
