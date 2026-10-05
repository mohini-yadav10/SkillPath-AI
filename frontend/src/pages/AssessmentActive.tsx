import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function AssessmentActive({ isWrapped, isPaused, onEndAssessment }: { isWrapped?: boolean, isPaused?: boolean, onEndAssessment?: () => void }) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<any>(location.state?.question || null);
  const [progress, setProgress] = useState(location.state?.progress || { current: 1, total: 5 });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(!question);
  const [timeLeft, setTimeLeft] = useState(question?.timeLimitSeconds || 60);

  // Timer effect
  useEffect(() => {
    if (isPaused) return; // Do not tick timer if paused
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isPaused]);

  const handleSubmit = async (isTimeOut = false) => {
    if (selectedOption === null && !isTimeOut) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const timeTaken = (question.timeLimitSeconds || 60) - timeLeft;
      
      const res = await axios.post(`http://localhost:5000/api/assessments/${id}/submit`, {
        questionId: question._id,
        selectedOptionIndex: selectedOption !== null ? selectedOption : -1,
        timeTakenSeconds: timeTaken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.data.completed) {
        navigate(`/assessment/${id}/result`);
      } else {
        setQuestion(res.data.data.question);
        setProgress(res.data.data.progress);
        setSelectedOption(null);
        setTimeLeft(res.data.data.question.timeLimitSeconds || 60);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error submitting answer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-medium">Evaluating Adaptive Engine...</div>;
  if (!question) return <div>Question not found.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-bold text-muted uppercase tracking-wider">
          Question {progress.current} of {progress.total}
        </div>
        <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-sage/10 text-forest-dark'}`}>
          <Clock size={16} /> 00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="w-full bg-sage/20 rounded-full h-1.5 mb-8">
        <div className="bg-forest h-1.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-sage/20">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-medium text-ink">{question.questionText}</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded ${question.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : question.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
            {question.difficulty}
          </span>
        </div>

        <div className="space-y-3 mb-8">
          {question.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${selectedOption === idx ? 'border-forest bg-sage/10 ring-2 ring-blue-200' : 'border-sage/20 hover:border-blue-300 hover:bg-cream'}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => handleSubmit()}
            disabled={selectedOption === null}
            className="bg-forest text-white px-8 py-3 rounded-lg font-medium hover:bg-forest-dark disabled:bg-sage/30 transition-colors"
          >
            Submit & Next
          </button>
        </div>
      </div>
    </div>
  );
}
