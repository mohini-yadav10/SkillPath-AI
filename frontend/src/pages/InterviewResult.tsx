import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Award,
  Target,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  Info,
  Code
} from 'lucide-react';

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

  if (!result) {
    return (
      <div className="text-center py-20 text-forest font-bold text-lg flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
        <span>Loading AI Interview Assessment...</span>
      </div>
    );
  }

  const scores = result.scores || { overall: 0, technical: 0, communication: 0, relevance: 0 };
  const twinImpact = result.careerTwinImpact;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-forest text-gold rounded-3xl mb-4 shadow-lg shadow-forest/20">
          <Award size={44} />
        </div>
        <h1 className="text-4xl font-black text-ink tracking-tight">Interview Evaluation Report</h1>
        <p className="text-muted mt-2 text-base font-medium">
          Comprehensive AI Rubric Breakdown & Career Twin Telemetry Update
        </p>
      </div>

      {/* Career Twin Feedback Loop Callout */}
      {twinImpact && (
        <div className="bg-gradient-to-r from-forest to-forest-dark p-6 rounded-3xl text-cream shadow-md border border-forest/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-wider">
              <Zap size={14} /> Career Twin Telemetry Synchronized
            </div>
            <h3 className="text-xl font-black">Digital Twin Archetype: {twinImpact.archetype || 'Specialist'}</h3>
            <p className="text-xs text-cream/80 max-w-xl font-medium">
              Your interview performance has been factored into your market readiness score and digital twin skill graph.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl border border-white/15">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-cream/70 block">Previous</span>
              <span className="text-xl font-black">{twinImpact.previousReadiness || 0}%</span>
            </div>
            <ArrowRight size={18} className="text-gold" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-cream/70 block">Updated</span>
              <span className="text-2xl font-black text-gold flex items-center gap-1 justify-center">
                {twinImpact.updatedReadiness || twinImpact.previousReadiness || 0}%
                {(twinImpact.updatedReadiness || 0) >= (twinImpact.previousReadiness || 0) ? (
                  <TrendingUp size={16} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={16} className="text-rose-400" />
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-forest rounded-3xl p-6 text-cream flex flex-col justify-center items-center text-center shadow-lg shadow-forest/20">
          <p className="text-gold text-xs font-black uppercase tracking-widest mb-1">Overall Score</p>
          <div className="text-5xl font-black">{scores.overall}%</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm flex flex-col justify-center items-center text-center">
          <Target className="text-forest mb-2" size={26} />
          <p className="text-muted font-bold text-xs uppercase tracking-wider">Technical Rubric</p>
          <div className="text-3xl font-black text-ink mt-1">{scores.technical}%</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm flex flex-col justify-center items-center text-center">
          <MessageSquare className="text-sage mb-2" size={26} />
          <p className="text-muted font-bold text-xs uppercase tracking-wider">Communication</p>
          <div className="text-3xl font-black text-ink mt-1">{scores.communication}%</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm flex flex-col justify-center items-center text-center">
          <CheckCircle className="text-gold mb-2" size={26} />
          <p className="text-muted font-bold text-xs uppercase tracking-wider">Relevance</p>
          <div className="text-3xl font-black text-ink mt-1">{scores.relevance}%</div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-7 border border-sage/20 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-forest flex items-center gap-2">
            <CheckCircle className="text-emerald-600" size={20} /> Validated Strengths
          </h3>
          {result.strengths && result.strengths.length > 0 ? (
            <ul className="space-y-2.5">
              {result.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-forest-dark bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Demonstrated mastery in {s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted font-medium">Continue practicing to establish technical strengths.</p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-7 border border-rose-100 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-rose-800 flex items-center gap-2">
            <AlertTriangle className="text-rose-600" size={20} /> Areas for Targeted Remediation
          </h3>
          {result.weaknesses && result.weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {result.weaknesses.map((w: any, i: number) => (
                <li key={i} className="text-rose-900 bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs font-medium leading-relaxed">
                  <span className="font-bold block text-rose-800 mb-0.5">Skill Focus: {w.skillName}</span>
                  {w.feedback}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-800 font-medium">Excellent execution! No critical weaknesses flagged in this session.</p>
          )}
        </div>
      </div>

      {/* Learning Path Remediation Banner */}
      {result.weaknesses && result.weaknesses.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Adaptive Feedback Loop
            </span>
            <h3 className="text-xl font-black text-amber-950">Learning Roadmap Injected with Targeted Labs</h3>
            <p className="text-xs text-amber-900 max-w-xl font-medium leading-normal">
              Remediation modules for your weak concepts have been placed into your active curriculum in strict prerequisite order.
            </p>
          </div>
          <Link
            to="/learning"
            className="bg-forest text-cream px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-forest-dark transition shadow-md shrink-0 text-sm"
          >
            Open Learning Roadmap <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {/* Detailed Question-by-Question Rubric Breakdown */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-ink tracking-tight">Question Rubric & Evaluation Breakdown</h3>
        <div className="space-y-5">
          {result.questions && result.questions.map((q: any, i: number) => {
            const isAI = q.source === 'AI_GENERATED';
            const breakdown = q.rubricBreakdown;

            return (
              <div key={i} className="bg-white border border-sage/20 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sage/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-forest uppercase tracking-wider">
                      Question {i + 1}
                    </span>
                    {isAI ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Sparkles size={11} className="text-amber-600" /> AI Adaptive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck size={11} className="text-emerald-700" /> Verified Public
                      </span>
                    )}
                    {q.isFollowUp && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                        <Zap size={10} /> Targeted Follow-Up
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <span className="px-2.5 py-0.5 bg-forest text-cream text-[11px] font-bold rounded-lg">
                      Tech: {q.techScore || 0}%
                    </span>
                    <span className="px-2.5 py-0.5 bg-sage/20 text-forest-dark text-[11px] font-bold rounded-lg">
                      Comm: {q.commScore || 0}%
                    </span>
                    <span className="px-2.5 py-0.5 bg-cream text-forest-dark text-[11px] font-bold rounded-lg border border-sage/30">
                      Rel: {q.relScore || 0}%
                    </span>
                  </div>
                </div>

                {/* Question and Selection Reason */}
                <div>
                  <h4 className="text-lg font-bold text-ink leading-snug">{q.questionText}</h4>
                  {q.selectionReason && (
                    <p className="text-xs text-muted mt-1 flex items-start gap-1.5 font-medium">
                      <Info size={14} className="text-forest shrink-0 mt-0.5" />
                      <span><strong>Selection Reason:</strong> {q.selectionReason}</span>
                    </p>
                  )}
                </div>

                {/* Candidate Answer */}
                <div className="bg-cream/40 border border-sage/20 rounded-2xl p-4 text-xs font-sans text-forest-dark leading-relaxed">
                  <span className="text-[10px] font-bold text-muted block uppercase mb-1">Your Submitted Response:</span>
                  <p className="italic">{q.studentAnswer ? `"${q.studentAnswer}"` : '(No response provided)'}</p>
                </div>

                {/* Rubric Breakdown (Keywords & Concepts) */}
                {breakdown && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
                      <span className="font-bold text-emerald-900 block text-[11px]">
                        ✓ Concepts Successfully Covered ({breakdown.matchedKeywords?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.matchedKeywords && breakdown.matchedKeywords.length > 0 ? (
                          breakdown.matchedKeywords.map((kw: string, kidx: number) => (
                            <span key={kidx} className="bg-white text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted text-[11px]">No core keywords detected</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 space-y-2">
                      <span className="font-bold text-rose-900 block text-[11px]">
                        ✗ Missing Key Concepts ({breakdown.missedKeywords?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.missedKeywords && breakdown.missedKeywords.length > 0 ? (
                          breakdown.missedKeywords.map((kw: string, kidx: number) => (
                            <span key={kidx} className="bg-white text-rose-800 font-semibold px-2 py-0.5 rounded-md border border-rose-200 text-[10px]">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">All key concepts addressed</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Coding Test Evaluation if applicable */}
                {q.codeEvaluation && (
                  <div className="bg-cream border border-sage/30 rounded-2xl p-3.5 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <Code size={14} className="text-forest" />
                      <span className="font-bold text-forest">Code Test Case Evaluation:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        q.codeEvaluation.testPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.codeEvaluation.testPassed ? 'Test Passed' : 'Test Failed'}
                      </span>
                    </div>
                    {q.codeEvaluation.output && (
                      <p className="font-mono text-[11px] text-forest-dark">{q.codeEvaluation.output}</p>
                    )}
                    {q.codeEvaluation.codeStyleNotes && (
                      <p className="text-muted text-[11px]">{q.codeEvaluation.codeStyleNotes}</p>
                    )}
                  </div>
                )}

                {/* AI Qualitative Feedback */}
                <div className="bg-sage/10 border border-sage/20 rounded-2xl p-3.5 text-xs text-forest-dark font-medium leading-relaxed">
                  <span className="font-bold text-forest block mb-1">💡 AI Evaluator Feedback:</span>
                  <p>{q.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
