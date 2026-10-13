import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareerTarget } from '../context/CareerContext';
import axios from 'axios';
import {
  Target,
  Settings,
  Zap,
  Building2,
  Briefcase,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import QuestionBankLibrary from '../components/interview/QuestionBankLibrary';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { target } = useCareerTarget();
  const [meta, setMeta] = useState<{ companies: any[]; roles: any[] }>({ companies: [], roles: [] });
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  const [config, setConfig] = useState({
    company: target?.companyName || 'TCS',
    role: target?.roleName || 'MERN Full Stack Developer',
    sessionMode: 'ADAPTIVE_MOCK',
    type: 'TECHNICAL',
    difficulty: 'MEDIUM',
    questionCount: 5,
    skillFocus: ''
  });

  useEffect(() => {
    const fetchMetaAndProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const [metaRes, profileRes] = await Promise.all([
          axios.get('http://localhost:5000/api/interview/meta/companies-roles', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (metaRes.data.success) {
          setMeta(metaRes.data.data);
          // Set default company/role from meta if available
          const companies = metaRes.data.data.companies;
          const roles = metaRes.data.data.roles;
          if (companies.length > 0 && !target?.companyName) {
            setConfig(prev => ({ ...prev, company: companies[0].name }));
          }
          if (roles.length > 0 && !target?.roleName) {
            setConfig(prev => ({ ...prev, role: roles[0].title }));
          }
        }
      } catch (err) {
        console.error('Failed to load profile or meta:', err);
      }
    };
    fetchMetaAndProfile();
  }, [target]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/interview/setup', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/interview/${res.data.data._id}/active`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to initialize interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 animate-fade-in">
      {/* Question Bank Modal */}
      {showQuestionBank && (
        <QuestionBankLibrary
          isOpenAsModal={true}
          onClose={() => setShowQuestionBank(false)}
        />
      )}

      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage/20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sage/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-forest text-gold rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Target size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Virtual Interview Setup</h1>
              <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
                Practice with real company question banks, adaptive difficulty, and AI feedback.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowQuestionBank(true)}
            className="inline-flex items-center gap-2 bg-cream hover:bg-sage/20 text-forest font-bold px-4 py-2.5 rounded-xl border border-sage/30 text-xs transition shadow-xs"
          >
            <BookOpen size={15} /> Browse Question Bank
          </button>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          {/* Company and Role Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-forest mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} /> Target Company
              </label>
              <select
                value={config.company}
                onChange={e => setConfig({ ...config, company: e.target.value })}
                className="w-full bg-cream/40 border border-sage/30 text-ink rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="">Any Company</option>
                {meta.companies.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.totalQuestions} questions)
                  </option>
                ))}
                {!meta.companies.some(c => c.name === 'TCS') && (
                  <option value="TCS">TCS (Tata Consultancy Services)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest mb-1.5 flex items-center gap-1.5">
                <Briefcase size={14} /> Target Role
              </label>
              <select
                value={config.role}
                onChange={e => setConfig({ ...config, role: e.target.value })}
                className="w-full bg-cream/40 border border-sage/30 text-ink rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="">Any Technical Role</option>
                {meta.roles.map(r => (
                  <option key={r.title} value={r.title}>
                    {r.title}
                  </option>
                ))}
                {!meta.roles.some(r => r.title === 'MERN Full Stack Developer') && (
                  <option value="MERN Full Stack Developer">MERN Full Stack Developer</option>
                )}
              </select>
            </div>
          </div>

          {/* Session Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-forest mb-2 flex items-center gap-1.5">
              <Layers size={14} /> Interview Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                {
                  id: 'ADAPTIVE_MOCK',
                  title: 'Adaptive Mock Session',
                  desc: 'Dynamically adapts question difficulty and follow-ups based on real-time answer evidence.'
                },
                {
                  id: 'COMPANY_PRACTICE',
                  title: 'Company Practice',
                  desc: 'Focuses on candidate-reported questions asked at the selected target company.'
                },
                {
                  id: 'SKILL_GAP_PRACTICE',
                  title: 'Skill-Gap Targeted',
                  desc: 'Prioritizes skills where your Career Twin detected critical gaps.'
                },
                {
                  id: 'TOPIC_PRACTICE',
                  title: 'Topic Deep Dive',
                  desc: 'Focuses strictly on a chosen technology stack or competency.'
                }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setConfig({ ...config, sessionMode: m.id })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    config.sessionMode === m.id
                      ? 'bg-forest text-cream border-forest shadow-md ring-2 ring-forest/20'
                      : 'bg-white text-forest-dark border-sage/20 hover:bg-cream/40'
                  }`}
                >
                  <span className="font-bold text-sm block mb-1">{m.title}</span>
                  <span
                    className={`text-xs block leading-normal ${
                      config.sessionMode === m.id ? 'text-cream/80' : 'text-muted'
                    }`}
                  >
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Area (Type) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-forest mb-1.5 flex items-center gap-1.5">
                <Settings size={14} /> Question Focus
              </label>
              <select
                value={config.type}
                onChange={e => setConfig({ ...config, type: e.target.value })}
                className="w-full bg-cream/40 border border-sage/30 text-ink rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="TECHNICAL">Technical Skills Only</option>
                <option value="HR">Behavioral / HR Only</option>
                <option value="MIXED">Mixed (Technical + HR)</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-bold text-forest mb-1.5 flex items-center gap-1.5">
                <Zap size={14} /> Difficulty Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['EASY', 'MEDIUM', 'HARD'].map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setConfig({ ...config, difficulty: diff })}
                    className={`py-3 rounded-xl font-bold text-xs border transition-colors ${
                      config.difficulty === diff
                        ? 'bg-forest text-cream border-forest shadow-sm'
                        : 'bg-white text-forest-dark border-sage/20 hover:bg-cream/50'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Number of Questions Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-forest">Session Length</label>
              <span className="text-sm font-black text-forest">{config.questionCount} Questions</span>
            </div>
            <input
              type="range"
              min="3"
              max="8"
              value={config.questionCount}
              onChange={e => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
              className="w-full accent-forest cursor-pointer"
            />
            <p className="text-[11px] text-muted mt-1">
              Estimated duration: ~{config.questionCount * 3} minutes (3 minutes per question).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-4 rounded-2xl font-bold text-base hover:bg-forest-dark transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                <span>Sequencing Adaptive Questions...</span>
              </>
            ) : (
              <>
                <span>Start Virtual Interview</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
