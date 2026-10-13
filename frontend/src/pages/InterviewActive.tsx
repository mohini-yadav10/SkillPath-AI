import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Clock,
  Send,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Info,
  Code,
  Zap,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function InterviewActive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per question
  const [submitting, setSubmitting] = useState(false);
  const [followUpAlert, setFollowUpAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/interview/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedAttempt = res.data.data;
        setAttempt(fetchedAttempt);

        // Populate local answers from database
        const answers = fetchedAttempt.questions.map((q: any) => q.studentAnswer || '');
        setLocalAnswers(answers);

        // Find first unanswered question
        const firstUnanswered = fetchedAttempt.questions.findIndex((q: any) => !q.studentAnswer);
        if (firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered);
        } else if (fetchedAttempt.status === 'COMPLETED') {
          navigate(`/interview/${id}/result`);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttempt();
  }, [id, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const saveAnswerToBackend = async (index: number, ans: string) => {
    const token = localStorage.getItem('token');
    const timeSpent = 180 - timeLeft;
    const res = await axios.post(
      `http://localhost:5000/api/interview/${id}/answer`,
      {
        questionIndex: index,
        studentAnswer: ans,
        timeSpentSeconds: timeSpent
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success && res.data.data) {
      const updatedAttempt = res.data.data;
      setAttempt(updatedAttempt);

      // Keep local answers array in sync with updated questions (including any dynamic follow-ups)
      const syncedAnswers = updatedAttempt.questions.map((q: any, i: number) => {
        return i === index ? ans : (localAnswers[i] !== undefined ? localAnswers[i] : (q.studentAnswer || ''));
      });
      setLocalAnswers(syncedAnswers);

      if (res.data.followUpGenerated) {
        setFollowUpAlert(
          '⚡ Adaptive AI follow-up generated! An additional probing question has been added to test identified weak concepts.'
        );
      }
    }

    return res.data;
  };

  const handlePrevious = async () => {
    setSubmitting(true);
    try {
      await saveAnswerToBackend(currentIndex, localAnswers[currentIndex] || '');
      setCurrentIndex(prev => prev - 1);
      setTimeLeft(180);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextOrSkip = async (isSkip: boolean = false) => {
    setSubmitting(true);
    try {
      let finalAnswer = localAnswers[currentIndex] || '';

      if (isSkip) {
        finalAnswer = '';
        const newAnswers = [...localAnswers];
        newAnswers[currentIndex] = '';
        setLocalAnswers(newAnswers);
      }

      const saveRes = await saveAnswerToBackend(currentIndex, finalAnswer);
      const activeQuestions = saveRes?.data?.questions || attempt.questions;

      if (currentIndex < activeQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(180);
      } else {
        // Complete interview
        const token = localStorage.getItem('token');
        await axios.post(
          `http://localhost:5000/api/interview/${id}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/interview/${id}/result`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...localAnswers];
    newAnswers[currentIndex] = e.target.value;
    setLocalAnswers(newAnswers);
  };

  if (!attempt) {
    return (
      <div className="text-center py-20 text-xl font-bold text-forest animate-pulse flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
        <span>Initializing Virtual Interview Environment...</span>
      </div>
    );
  }

  if (!attempt.questions || attempt.questions.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-ink">No Questions Found</h2>
        <p className="text-muted mt-2">The question pool is currently empty for this configuration.</p>
        <button
          onClick={() => navigate('/interview')}
          className="mt-6 bg-forest text-cream px-6 py-2.5 rounded-xl font-bold hover:bg-forest-dark transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex];
  const isLast = currentIndex === attempt.questions.length - 1;
  const currentAnswer = localAnswers[currentIndex] || '';
  const isAI = currentQ.source === 'AI_GENERATED';
  const isFollowUp = currentQ.isFollowUp;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 animate-fade-in">
      {/* Dynamic Follow-Up Alert Notification */}
      {followUpAlert && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-slide-down">
          <div className="flex items-center gap-3 text-amber-900 font-medium text-sm">
            <Zap className="text-amber-600 shrink-0" size={20} />
            <span>{followUpAlert}</span>
          </div>
          <button
            onClick={() => setFollowUpAlert(null)}
            className="text-xs font-bold text-amber-700 hover:text-amber-950 underline ml-4 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header bar with question progress and timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-sage/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-forest uppercase tracking-widest">
              Question {currentIndex + 1} of {attempt.questions.length}
            </span>
            {isFollowUp && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                <Zap size={10} /> Targeted Follow-Up
              </span>
            )}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {attempt.questions.map((q: any, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  saveAnswerToBackend(currentIndex, localAnswers[currentIndex] || '');
                  setCurrentIndex(idx);
                  setTimeLeft(180);
                }}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-10 bg-forest ring-2 ring-forest/30'
                    : localAnswers[idx]?.trim()
                    ? 'w-6 bg-emerald-600'
                    : q.isFollowUp
                    ? 'w-6 bg-amber-400'
                    : 'w-6 bg-sage/30'
                }`}
                title={`Question ${idx + 1}${q.isFollowUp ? ' (Follow-Up)' : ''}`}
              />
            ))}
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono text-sm border shadow-sm ${
            timeLeft < 30
              ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
              : 'bg-cream text-forest-dark border-sage/30'
          }`}
        >
          <Clock size={16} className={timeLeft < 30 ? 'text-red-500' : 'text-forest'} />
          <span>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div
        className={`bg-white p-8 rounded-3xl shadow-sm border transition-all ${
          isFollowUp ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20' : 'border-sage/20'
        }`}
      >
        {/* Source Badge & Category */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {isAI ? (
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-xs">
                <Sparkles size={13} className="text-amber-600" /> AI Adaptive Question
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
                <ShieldCheck size={13} className="text-emerald-700" /> Verified Interview Benchmark
              </span>
            )}
            <span className="text-xs font-semibold text-muted bg-cream px-2.5 py-1 rounded-full border border-sage/20">
              {currentQ.category || attempt.type}
            </span>
          </div>

          <span className="text-xs font-bold text-forest bg-sage/20 px-2.5 py-1 rounded-full">
            {attempt.difficulty} Level
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl font-black text-ink leading-relaxed tracking-tight">
          {currentQ.questionText}
        </h2>

        {/* Clear Explanation of Why This Question Was Selected (Requirement 8) */}
        {currentQ.selectionReason && (
          <div className="mt-5 bg-cream/70 border border-sage/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-forest-dark">
            <Info size={16} className="text-forest shrink-0 mt-0.5" />
            <div>
              <strong className="text-forest font-bold block mb-0.5">Why This Question Was Selected:</strong>
              <p className="font-medium text-forest-dark/80 leading-normal">{currentQ.selectionReason}</p>
            </div>
          </div>
        )}

        {/* Coding Test Case Sandbox Hint (Requirement 2) */}
        {currentQ.codeTestCase && (
          <div className="mt-5 bg-forest-dark/5 border border-forest/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
              <Code size={14} /> Coding Test Evaluation Criteria
            </div>
            {currentQ.codeTestCase.description && (
              <p className="text-xs text-forest-dark font-medium">{currentQ.codeTestCase.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-sage/30">
                <span className="text-muted block text-[10px] font-sans font-bold uppercase">Test Input</span>
                <span className="text-forest font-semibold">{currentQ.codeTestCase.input}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-sage/30">
                <span className="text-muted block text-[10px] font-sans font-bold uppercase">Expected Return</span>
                <span className="text-emerald-700 font-semibold">{currentQ.codeTestCase.expectedOutput}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Workspace */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-sage/20 space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-bold text-forest flex items-center gap-2">
            <span>Your Response</span>
            <span className="text-xs font-normal text-muted">(Articulate clearly with technical terminology)</span>
          </label>
          <span className="text-xs font-mono text-muted">
            {currentAnswer.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <textarea
          value={currentAnswer}
          onChange={handleAnswerChange}
          placeholder={
            currentQ.codeTestCase
              ? 'Write your function or code implementation here, followed by an explanation of time & space complexity...'
              : 'Structure your explanation using architectural concepts, trade-offs, and concrete examples...'
          }
          className="w-full h-64 bg-cream/30 border border-sage/30 rounded-2xl p-4 text-forest-dark font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white resize-none font-sans"
        />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-sage/10">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || submitting}
            className="w-full sm:w-auto bg-cream text-forest-dark hover:bg-sage/20 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors border border-sage/30"
          >
            <ChevronLeft size={18} /> Previous Question
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleNextOrSkip(true)}
              disabled={submitting}
              className="text-xs font-bold text-muted hover:text-ink px-4 py-3 rounded-xl hover:bg-cream transition-colors"
            >
              Skip Question
            </button>
            <button
              onClick={() => handleNextOrSkip(false)}
              disabled={!currentAnswer.trim() || submitting}
              className="bg-forest text-cream px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-forest-dark disabled:opacity-50 transition shadow-md"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : isLast ? (
                <>
                  <span>Complete Interview</span>
                  <Send size={18} />
                </>
              ) : (
                <>
                  <span>Submit & Next</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
