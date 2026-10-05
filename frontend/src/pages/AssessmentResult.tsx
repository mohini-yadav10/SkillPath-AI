import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Target, CheckCircle, XCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface IQuestionDetail {
  _id?: string;
  questionText: string;
  explanation: string;
}

interface IAttemptQuestion {
  questionId?: IQuestionDetail;
  difficulty: string;
  timeTakenSeconds?: number;
  isCorrect?: boolean;
  selectedOptionIndex?: number;
}

interface IAssessmentResult {
  _id: string;
  score: number;
  accuracy: number;
  skillId?: { name: string; category: string };
  questions?: IAttemptQuestion[];
}

export default function AssessmentResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const terminationReason = location.state?.terminationReason;
  const [result, setResult] = useState<IAssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/assessments/${id}/result`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResult(res.data.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load assessment result.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div className="text-center py-20">Computing final performance...</div>;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <h2 className="text-lg font-bold">Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/assessment')} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Return to Assessments
        </button>
      </div>
    );
  }
  if (!result) return <div className="text-center py-20 text-muted">Result not found</div>;

  const finalQuestion = result.questions && result.questions.length > 0 
    ? result.questions[result.questions.length - 1] 
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        {terminationReason ? (
          <>
            <h1 className="text-3xl font-bold text-red-600">Assessment Terminated</h1>
            <p className="text-red-700 font-medium mt-2">Security Violation: {terminationReason}</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-ink">Assessment Complete!</h1>
            <p className="text-muted mt-2">Here is a detailed breakdown of your skill proficiency.</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-sage/20 text-center">
          <Target className="mx-auto text-forest mb-2" size={32} />
          <h3 className="text-sm font-medium text-muted">Calculated Proficiency</h3>
          <p className="text-4xl font-bold text-ink mt-2">{result.score}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-sage/20 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
          <h3 className="text-sm font-medium text-muted">Raw Accuracy</h3>
          <p className="text-4xl font-bold text-ink mt-2">{result.accuracy}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-sage/20 text-center flex flex-col justify-center">
          <h3 className="text-sm font-medium text-muted mb-4">Actions</h3>
          <button onClick={() => navigate('/learning')} className="w-full bg-forest text-white py-2 rounded shadow hover:bg-forest-dark flex items-center justify-center gap-2 mb-2">
            Continue Learning <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/assessment')} className="w-full bg-sage/10 text-forest-dark py-2 rounded hover:bg-sage/20">
            Retake Assessment
          </button>
        </div>
      </div>

      <div className="bg-sage/10 border border-blue-200 p-6 rounded-lg mb-8">
        <h3 className="font-bold text-blue-800 mb-2">AI Summary</h3>
        <p className="text-blue-900">
          Your adaptive assessment indicates that your verified proficiency in <strong>{result.skillId?.name || 'this skill'}</strong> is approximately <strong>{result.score}%</strong>. 
          {finalQuestion ? (
            <span> The system dynamically adjusted the difficulty based on your answers, ending on a {finalQuestion.difficulty} tier question.</span>
          ) : (
            <span> No adaptive question tier data was recorded for this attempt.</span>
          )}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-sage/20">
        <h3 className="text-lg font-bold text-ink mb-6">Question Breakdown</h3>
        
        {!result.questions || result.questions.length === 0 ? (
          <div className="text-center py-8 bg-cream rounded border border-sage/20 text-muted italic">
            No question breakdown is available for this assessment.
          </div>
        ) : (
          <div className="space-y-4">
            {result.questions.map((q: IAttemptQuestion, i: number) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-ink">Q{i + 1}. {q.questionId?.questionText || 'Unknown Question'}</h4>
                  {q.isCorrect ? (
                    <span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle size={16} /> Correct</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1 font-medium"><XCircle size={16} /> Incorrect</span>
                  )}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded font-bold ${q.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {q.difficulty} Tier
                  </span>
                  <span className="px-2 py-1 bg-sage/10 text-forest-dark/70 rounded">
                    Time: {q.timeTakenSeconds || 0}s
                  </span>
                </div>
                {!q.isCorrect && q.questionId?.explanation && (
                  <div className="mt-3 p-3 bg-red-50 text-red-800 text-sm rounded border border-red-100">
                    <strong>Explanation:</strong> {q.questionId.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
