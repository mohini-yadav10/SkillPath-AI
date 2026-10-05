import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, FileText, Settings, ShieldCheck, Mail, Shield, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-sage/100 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-sage/20 relative overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-forest via-forest-dark to-ink"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative -mt-16 mb-4">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-sage/20 to-sage/10 border-4 border-white shadow-xl flex items-center justify-center text-forest-dark font-black text-4xl">
                {user?.name?.charAt(0) || user?.firstName?.charAt(0) || 'S'}
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-extrabold text-ink tracking-tight">{user?.name || `${user?.firstName} ${user?.lastName}`}</h1>
                <p className="text-cream/500 font-medium flex items-center gap-2 mt-1">
                  <Mail size={16}/> {user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => window.location.href='/profile/resume'} className="flex-1 md:flex-none bg-sage/10 text-forest-dark px-6 py-3 rounded-xl font-bold border border-sage/20 hover:bg-sage/20 hover:border-sage/30 transition-colors flex items-center justify-center gap-2">
                <FileText size={18} /> Resume Scanner
              </button>
              <button className="bg-sage/10 text-forest-dark/70 px-4 py-3 rounded-xl font-bold hover:bg-sage/20 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage/10 text-forest rounded-lg text-xs font-bold uppercase tracking-wider border border-sage/20">
              <ShieldCheck size={14} /> Active Account
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage/10 text-forest-dark/70 rounded-lg text-xs font-bold uppercase tracking-wider border border-sage/20">
              <GraduationCap size={14} /> {user?.role || 'Student'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Stats & Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage/20">
            <h2 className="text-lg font-bold text-ink mb-6">Career Profile</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center shrink-0 text-forest">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted uppercase tracking-wider mb-0.5">Education</p>
                  <p className="font-bold text-ink">{profile?.education || 'B.Tech Computer Science'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center shrink-0 text-forest">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted uppercase tracking-wider mb-0.5">Current Status</p>
                  <p className="font-bold text-ink">{profile?.currentStatus || 'Actively Looking'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-forest p-8 rounded-3xl shadow-sm text-white relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-10">
              <Star size={100} />
            </div>
            <h2 className="text-lg font-bold text-sage/10 mb-2">Self-Assessment</h2>
            <p className="text-sm text-muted mb-6 relative z-10">
              Manually add skills you have learned. We highly recommend taking AI Assessments to get "Verified" badges on your profile.
            </p>
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Select Skill</label>
                <select 
                  value={selectedSkill} 
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full bg-ink border border-forest-dark text-white rounded-xl p-3 outline-none focus:border-sage/100 font-medium text-sm"
                >
                  <option value="">-- Choose Skill --</option>
                  {allSkills.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex justify-between text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  <span>Proficiency</span>
                  <span className="text-forest">{proficiency}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={proficiency} 
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full accent-sage/100 h-2 bg-ink rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <button 
                onClick={handleAddSkill}
                disabled={!selectedSkill}
                className="w-full bg-forest text-white py-3.5 rounded-xl font-bold hover:bg-sage/100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-forest-dark/20 mt-2"
              >
                Add to Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Skills Ledger */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage/20 h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-ink">Skill Ledger</h2>
              <span className="bg-sage/10 text-forest-dark/70 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                {profile?.skills?.length || 0} Total Skills
              </span>
            </div>
            
            {profile?.skills?.length === 0 ? (
              <div className="text-center py-20 bg-cream/50 rounded-2xl border border-dashed border-sage/30">
                <BookOpen size={40} className="mx-auto text-sage/30 mb-4" />
                <p className="text-cream/500 font-medium">Your skill ledger is empty.</p>
                <p className="text-sm text-muted mt-1">Add skills manually or take assessments to populate it.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile?.skills?.sort((a:any, b:any) => b.proficiency - a.proficiency).map((s: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={s.skillId._id} 
                    className="p-5 rounded-2xl border border-sage/10 bg-cream/50/50 hover:bg-white hover:shadow-md hover:border-sage/20 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-bold text-ink text-lg">{s.skillId.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {s.source === 'VERIFIED' || s.source === 'ASSESSMENT' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-sage/20 text-forest px-2 py-0.5 rounded-md">
                              <Shield size={12} /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-sage/20 text-forest-dark/70 px-2 py-0.5 rounded-md">
                              Self-Declared
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-ink">{s.proficiency}</span>
                        <span className="text-sm font-bold text-muted">%</span>
                      </div>
                    </div>
                    <div className="w-full bg-sage/20/60 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${s.proficiency}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${s.source === 'VERIFIED' || s.source === 'ASSESSMENT' ? 'bg-sage/100' : 'bg-sage/100'}`} 
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
