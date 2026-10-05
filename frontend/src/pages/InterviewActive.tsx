import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Send, ChevronRight, ChevronLeft } from 'lucide-react';

export default function InterviewActive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per question
  const [submitting, setSubmitting] = useState(false);

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
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const saveAnswerToBackend = async (index: number, ans: string) => {
    const token = localStorage.getItem('token');
    const timeSpent = 180 - timeLeft;
    await axios.post(`http://localhost:5000/api/interview/${id}/answer`, {
      questionIndex: index,
      studentAnswer: ans,
      timeSpentSeconds: timeSpent
    }, { headers: { Authorization: `Bearer ${token}` }});
  };

  const handlePrevious = async () => {
    setSubmitting(true);
    try {
      // Save current progress before going back
      await saveAnswerToBackend(currentIndex, localAnswers[currentIndex]);
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
      let finalAnswer = localAnswers[currentIndex];
      
      // If skip is pressed, save an empty string
      if (isSkip) {
        finalAnswer = '';
        const newAnswers = [...localAnswers];
        newAnswers[currentIndex] = '';
        setLocalAnswers(newAnswers);
      }

      // Save answer
      await saveAnswerToBackend(currentIndex, finalAnswer);

      if (currentIndex < attempt.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(180);
      } else {
        // Complete interview
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/interview/${id}/complete`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  if (!attempt) return <div className="text-center py-20 text-xl font-bold text-muted animate-pulse">Initializing Interview Environment...</div>;

  if (!attempt.questions || attempt.questions.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-ink">No Questions Found</h2>
        <p className="text-muted mt-2">The question database is currently empty. Please add interview questions to the database.</p>
        <button onClick={() => navigate('/interview')} className="mt-6 bg-forest text-white px-6 py-2 rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex];
  const isLast = currentIndex === attempt.questions.length - 1;
  const currentAnswer = localAnswers[currentIndex] || '';

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-sm font-bold text-muted tracking-wider uppercase">Question {currentIndex + 1} of {attempt.questions.length}</span>
          <div className="flex gap-2 mt-2">
            {attempt.questions.map((_: any, idx: number) => (
              <div key={idx} className={`h-2 w-12 rounded-full ${idx < currentIndex ? 'bg-sage' : idx === currentIndex ? 'bg-forest' : 'bg-sage/20'}`} />
            ))}
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono ${timeLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-sage/10 text-forest-dark'}`}>
          <Clock size={18} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage/10 mb-6">
        <h2 className="text-2xl font-bold text-ink leading-relaxed">
          {currentQ.questionText}
        </h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sage/10">
        <label className="block text-sm font-bold text-forest-dark mb-3">Your Answer (Speak naturally, explain your thought process)</label>
        <textarea
          value={currentAnswer}
          onChange={handleAnswerChange}
          placeholder="Start typing your answer here..."
          className="w-full h-64 bg-cream/50 border border-sage/20 rounded-2xl p-4 text-forest-dark font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest resize-none"
        />
        
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || submitting}
            className="bg-sage/10 text-forest-dark/70 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-sage/20 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => handleNextOrSkip(true)}
              disabled={submitting}
              className="bg-sage/10 text-forest-dark/70 px-6 py-3 rounded-xl font-bold hover:bg-sage/20 disabled:opacity-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => handleNextOrSkip(false)}
              disabled={!currentAnswer.trim() || submitting}
              className="bg-forest text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-forest-dark disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Processing...' : isLast ? 'Submit & Finish' : 'Submit & Next'}
              {!submitting && (isLast ? <Send size={18} /> : <ChevronRight size={18} />)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
