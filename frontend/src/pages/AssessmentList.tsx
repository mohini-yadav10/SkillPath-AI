import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';

export default function AssessmentList() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/assessments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSkills(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const handleStart = async (skillId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/assessments/start', { skillId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/assessment/${res.data.data.attemptId}`, { state: res.data.data });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start assessment');
    }
  };

  if (loading) return <div className="text-center py-10">Loading Assessments...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Adaptive Skill Assessments</h1>
          <p className="text-gray-500">Prove your skills to update your career readiness profile.</p>
        </div>
        <button onClick={() => navigate('/assessment/history')} className="text-blue-600 hover:underline">
          View History
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-lg font-bold text-gray-800 mb-2">No Assessments Available</h2>
          <p className="text-gray-600">Please check back later when questions are added to the bank.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map(skill => (
            <div key={skill._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{skill.name}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{skill.category}</span>
                </div>
                <Clock className="text-gray-400" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-6">Take a 5-question adaptive assessment to verify your proficiency.</p>
              <button 
                onClick={() => handleStart(skill._id)}
                className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <PlayCircle size={18} /> Start Assessment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
