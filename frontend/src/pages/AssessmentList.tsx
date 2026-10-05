import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, ShieldAlert, CheckCircle, BarChart3, Fingerprint, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCareerTarget } from '../context/CareerContext';

export default function AssessmentList() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasTarget } = useCareerTarget();
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

  const handleStart = async (skillId: string, isProctored: boolean = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/assessments/start', { skillId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (isProctored) {
        navigate(`/assessment/${res.data.data.attemptId}/proctored`, { state: res.data.data });
      } else {
        navigate(`/assessment/${res.data.data.attemptId}`, { state: res.data.data });
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start assessment');
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-sage/100 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl shadow-sm border border-sage/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BarChart3 size={120} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage/10 text-forest rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Zap size={14} className="text-sage/100" /> Adaptive Testing
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Skill Assessments</h1>
          <p className="text-cream/500 mt-2 font-medium max-w-xl flex items-center gap-2">
            {hasTarget && <span className="bg-sage/20 text-forest px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider whitespace-nowrap">Personalized for Target</span>}
            Prove your proficiency through our AI-adaptive testing engine. Assessments dynamically adjust to your skill level.
          </p>
        </div>
        <div className="relative z-10">
          <button onClick={() => navigate('/assessment/history')} className="text-forest font-bold hover:text-forest-dark transition-colors flex items-center gap-2 bg-sage/10 px-5 py-2.5 rounded-xl">
            <Clock size={18} /> View History
          </button>
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-sage/20 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-cream/50 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="text-muted" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            {hasTarget ? "Your personalized question set is being prepared." : "No Assessments Available"}
          </h2>
          <p className="text-cream/500 font-medium max-w-md">
            {hasTarget 
              ? "We are currently preparing questions matching your target role's required skills. Please check back later." 
              : "Please check back later when questions are added to the bank for your skills."}
          </p>
          {!hasTarget && (
             <button onClick={() => navigate('/career')} className="mt-6 bg-forest text-white px-6 py-2 rounded-lg font-bold hover:bg-forest-dark transition">
               Set Target Role
             </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, i) => (
            <motion.div 
              key={skill._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-sage/20 hover:shadow-xl hover:border-sage/30 transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-ink mb-1.5">{skill.name}</h3>
                  <span className="text-xs font-bold text-cream/500 bg-sage/10 px-3 py-1 rounded-full uppercase tracking-wider">{skill.category}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-cream/50 flex items-center justify-center text-muted group-hover:bg-sage/10 group-hover:text-sage/100 transition-colors">
                  <BarChart3 size={20} />
                </div>
              </div>
              
              <div className="space-y-2 mb-8 flex-grow">
                <div className="flex items-center gap-2 text-sm font-medium text-cream/500">
                  <CheckCircle size={16} className="text-sage/100"/> Adaptive difficulty (5 Qs)
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-cream/500">
                  <Clock size={16} className="text-sage/100"/> ~10 minutes
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={() => handleStart(skill._id, false)}
                  className="w-full bg-sage/10 text-forest-dark py-3 rounded-xl hover:bg-sage/20 transition-colors flex items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle size={18} /> Standard Exam
                </button>
                <button 
                  onClick={() => handleStart(skill._id, true)}
                  className="w-full bg-forest text-white py-3 rounded-xl shadow-lg hover:bg-forest-dark hover:shadow-sage/100/25 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Fingerprint size={18} /> AI Proctored
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
