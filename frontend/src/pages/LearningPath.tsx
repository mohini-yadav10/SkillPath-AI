import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Book, CheckCircle, Circle, PlayCircle, ExternalLink } from 'lucide-react';

export default function LearningPath() {
  const { user } = useAuth();
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPath = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/learning/path', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPath(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPath();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/learning/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPath(res.data.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to generate learning path.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (itemId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/learning/progress/${itemId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPath(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading Learning Path...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Personalized Learning Path</h1>
          <p className="text-gray-500">Curated resources based on your skill gaps.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generating ? 'Generating...' : path ? 'Regenerate Path' : 'Generate Path'}
        </button>
      </div>

      {!path || path.items.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center mt-6">
          <Book className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-lg font-bold text-gray-800 mb-2">No Active Learning Path</h2>
          <p className="text-gray-600">Analyze your skill gaps first, then generate your personalized curriculum.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Course Completion</span>
              <span className="text-sm font-bold text-blue-600">{path.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${path.progress}%` }}></div>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Learning Curriculum</h3>
            <div className="space-y-6">
              {path.items.map((item: any) => (
                <div key={item._id} className="flex gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="pt-1">
                    {item.status === 'COMPLETED' ? (
                      <CheckCircle className="text-green-500 cursor-pointer" size={24} onClick={() => handleStatusChange(item._id, 'PENDING')} />
                    ) : item.status === 'IN_PROGRESS' ? (
                      <PlayCircle className="text-blue-500 cursor-pointer" size={24} onClick={() => handleStatusChange(item._id, 'COMPLETED')} />
                    ) : (
                      <Circle className="text-gray-300 cursor-pointer" size={24} onClick={() => handleStatusChange(item._id, 'IN_PROGRESS')} />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-bold text-gray-800">{item.title}</h4>
                        <p className="text-sm text-blue-600 font-medium">{item.skillName}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-gray-600 flex items-center gap-1 hover:text-blue-600">
                        <ExternalLink size={14} /> Open Resource
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
