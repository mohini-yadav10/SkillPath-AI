import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareerTarget } from '../context/CareerContext';
import axios from 'axios';
import { Target, Settings, Zap } from 'lucide-react';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { target } = useCareerTarget();
  const [config, setConfig] = useState({
    type: 'TECHNICAL',
    difficulty: 'MEDIUM',
    questionCount: 5
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // removed
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/interview/setup', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/interview/${res.data.data._id}/active`);
    } catch (err) {
      console.error(err);
      alert('Failed to setup interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage/20 text-forest rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target size={32} />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-2">Setup Interview</h1>
          
          <div className="inline-block bg-cream px-4 py-2 rounded-xl border border-sage/30 text-sm font-medium text-forest-dark mb-2 text-left w-full max-w-sm">
            <div className="flex justify-between border-b border-sage/20 pb-1 mb-1">
              <span className="text-muted text-xs uppercase tracking-wide">Target Role:</span>
              <span className="font-bold">{target?.roleName || 'Not Selected'}</span>
            </div>
            <div className="flex justify-between border-b border-sage/20 pb-1 mb-1">
              <span className="text-muted text-xs uppercase tracking-wide">Company:</span>
              <span className="font-bold">{target?.companyName || 'Any Company'}</span>
            </div>
          </div>
          
          <p className="text-forest-dark/70 mt-2 text-sm">Questions will be targeted towards your specific skill gaps for this role.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-forest-dark mb-2 flex items-center gap-2">
              <Settings size={18} className="text-muted" /> Focus Area
            </label>
            <select
              value={config.type}
              onChange={(e) => setConfig({...config, type: e.target.value})}
              className="w-full bg-cream/50 border border-sage/20 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest font-medium"
            >
              <option value="TECHNICAL">Technical Skills Only</option>
              <option value="HR">Behavioral / HR Only</option>
              <option value="MIXED">Mixed (Technical + HR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-forest-dark mb-2 flex items-center gap-2">
              <Zap size={18} className="text-muted" /> Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['EASY', 'MEDIUM', 'HARD'].map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setConfig({...config, difficulty: diff})}
                  className={`py-3 rounded-xl font-bold border transition-colors ${
                    config.difficulty === diff 
                      ? 'bg-forest text-white border-forest shadow-md' 
                      : 'bg-white text-forest-dark/70 border-sage/20 hover:bg-cream/50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-forest-dark mb-2">Number of Questions</label>
            <input 
              type="range" 
              min="3" 
              max="10" 
              value={config.questionCount}
              onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
              className="w-full accent-forest"
            />
            <div className="text-center font-bold text-forest text-lg mt-2">{config.questionCount} Questions</div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-forest text-white py-4 rounded-xl font-bold text-lg hover:bg-forest-dark transition-colors disabled:opacity-50 mt-8"
          >
            {loading ? 'Analyzing Profile & Generating...' : 'Start Virtual Interview'}
          </button>
        </form>
      </div>
    </div>
  );
}
