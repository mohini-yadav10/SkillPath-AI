import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profRes, skillsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/profile', { headers }),
          axios.get('http://localhost:5000/api/profile/skills', { headers }),
        ]);
        
        setProfile(profRes.data.data);
        setAllSkills(skillsRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/profile/skills', {
        skillId: selectedSkill,
        proficiency,
        source: 'SELF_DECLARED'
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.data);
      setSelectedSkill('');
      setProficiency(50);
    } catch (error) {
      console.error(error);
      alert('Failed to add skill');
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h1>
          <p className="text-gray-500">{user?.email} • {user?.role}</p>
        </div>
        <button onClick={() => window.location.href='/profile/resume'} className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-medium border border-blue-200 hover:bg-blue-100">
          Analyze Resume PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Skills</h2>
            {profile?.skills?.length === 0 ? (
              <p className="text-gray-500 italic">No skills added yet. Add some to get started.</p>
            ) : (
              <div className="space-y-4">
                {profile?.skills?.map((s: any) => (
                  <div key={s.skillId._id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium text-gray-800">{s.skillId.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{s.source.replace('_', ' ').toLowerCase()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.proficiency}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-8">{s.proficiency}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star size={18} /> Add New Skill
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Skill</label>
                <select 
                  value={selectedSkill} 
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                >
                  <option value="">-- Choose --</option>
                  {allSkills.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Self-assessed Proficiency: {proficiency}%</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={proficiency} 
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <button 
                onClick={handleAddSkill}
                disabled={!selectedSkill}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
