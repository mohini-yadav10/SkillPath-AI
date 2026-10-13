import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Tag,
  Building2,
  Briefcase,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

interface QuestionBankProps {
  onSelectQuestionForPractice?: (question: any) => void;
  isOpenAsModal?: boolean;
  onClose?: () => void;
}

export default function QuestionBankLibrary({
  onSelectQuestionForPractice,
  isOpenAsModal = false,
  onClose
}: QuestionBankProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ companies: any[]; roles: any[] }>({ companies: [], roles: [] });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters state
  const [company, setCompany] = useState<string>('ALL');
  const [role, setRole] = useState<string>('ALL');
  const [difficulty, setDifficulty] = useState<string>('ALL');
  const [interviewRound, setInterviewRound] = useState<string>('ALL');
  const [sourceType, setSourceType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/interview/meta/companies-roles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setMeta(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load interview meta:', err);
      }
    };
    fetchMeta();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params: any = { limit: 30 };
      if (company !== 'ALL') params.company = company;
      if (role !== 'ALL') params.role = role;
      if (difficulty !== 'ALL') params.difficulty = difficulty;
      if (interviewRound !== 'ALL') params.interviewRound = interviewRound;
      if (sourceType !== 'ALL') params.sourceType = sourceType;
      if (searchQuery.trim()) params.searchQuery = searchQuery.trim();

      const res = await axios.get('http://localhost:5000/api/interview/library/search', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (res.data.success) {
        setQuestions(res.data.data.questions || []);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [company, role, difficulty, interviewRound, sourceType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const content = (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Description */}
      <div className="bg-gradient-to-r from-forest to-forest-dark p-6 sm:p-8 rounded-3xl text-cream shadow-md border border-forest/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-wider mb-1">
            <BookOpen size={15} /> Company Interview Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Source-Attributed Question Bank</h2>
          <p className="text-xs sm:text-sm text-cream/80 max-w-xl font-medium mt-1">
            Explore verified candidate-reported interview questions, official company standards, and original AI practice material with strict provenance attribution.
          </p>
        </div>
        {isOpenAsModal && onClose && (
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-cream px-5 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Close Library
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, concept, or technical query (e.g. MongoDB, CORS, Reconciliation)..."
              className="w-full pl-10 pr-4 py-2.5 bg-cream/40 border border-sage/30 rounded-xl text-ink font-medium text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>
          <button
            type="submit"
            className="bg-forest text-cream px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-forest-dark transition shrink-0"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2 border-t border-sage/10 text-xs font-medium">
          {/* Company Filter */}
          <div>
            <label className="text-muted block text-[10px] uppercase font-bold mb-1">Company</label>
            <select
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full bg-cream/40 border border-sage/30 rounded-lg p-2 font-bold text-forest-dark focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="ALL">All Companies</option>
              {meta.companies.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.totalQuestions})
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="text-muted block text-[10px] uppercase font-bold mb-1">Job Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-cream/40 border border-sage/30 rounded-lg p-2 font-bold text-forest-dark focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="ALL">All Roles</option>
              {meta.roles.map(r => (
                <option key={r.title} value={r.title}>
                  {r.title} ({r.totalQuestions})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-muted block text-[10px] uppercase font-bold mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full bg-cream/40 border border-sage/30 rounded-lg p-2 font-bold text-forest-dark focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="ALL">All Levels</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Interview Round */}
          <div>
            <label className="text-muted block text-[10px] uppercase font-bold mb-1">Round</label>
            <select
              value={interviewRound}
              onChange={e => setInterviewRound(e.target.value)}
              className="w-full bg-cream/40 border border-sage/30 rounded-lg p-2 font-bold text-forest-dark focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="ALL">All Rounds</option>
              <option value="TECHNICAL_ROUND_1">Technical Round 1</option>
              <option value="TECHNICAL_ROUND_2">Technical Round 2</option>
              <option value="HR_ROUND">HR / Behavioral</option>
              <option value="MANAGERIAL_ROUND">Managerial Round</option>
            </select>
          </div>

          {/* Source Provenance Type */}
          <div>
            <label className="text-muted block text-[10px] uppercase font-bold mb-1">Source Provenance</label>
            <select
              value={sourceType}
              onChange={e => setSourceType(e.target.value)}
              className="w-full bg-cream/40 border border-sage/30 rounded-lg p-2 font-bold text-forest-dark focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="ALL">All Sources</option>
              <option value="CANDIDATE_REPORTED">Candidate-Reported</option>
              <option value="OFFICIAL_COMPANY">Official Company</option>
              <option value="AI_GENERATED">Original AI Practice</option>
              <option value="ADMIN_AUTHORED">Admin-Authored</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-20 text-center text-forest font-bold text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <span>Loading Question Bank...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-sage/20 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="mx-auto text-muted" size={36} />
          <h3 className="text-lg font-black text-ink">No Matching Questions</h3>
          <p className="text-xs text-muted">
            Try resetting your filters or adjusting your search term to see more questions.
          </p>
          <button
            onClick={() => {
              setCompany('ALL');
              setRole('ALL');
              setDifficulty('ALL');
              setInterviewRound('ALL');
              setSourceType('ALL');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-forest hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 text-xs text-muted font-bold">
            <span>Showing {questions.length} question(s)</span>
            <span className="text-[11px] font-normal italic">
              Provenances verified by editorial policy
            </span>
          </div>

          {questions.map(q => {
            const isExpanded = expandedId === q._id;
            const isAI = q.sourceType === 'AI_GENERATED' || q.source === 'AI_GENERATED';
            const isCandidate = q.sourceType === 'CANDIDATE_REPORTED';

            return (
              <div
                key={q._id}
                className="bg-white rounded-2xl border border-sage/20 p-5 shadow-xs hover:border-forest/40 transition-all space-y-3"
              >
                {/* Badges Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Source Pill */}
                    {isAI ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Sparkles size={11} className="text-amber-600" /> AI Practice Question
                      </span>
                    ) : isCandidate ? (
                      <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                        <ShieldCheck size={11} className="text-teal-700" /> Candidate-Reported
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck size={11} className="text-emerald-700" /> Official Resource
                      </span>
                    )}

                    {/* Verification Status */}
                    <span className="text-[10px] font-semibold text-muted bg-cream px-2 py-0.5 rounded-md border border-sage/30">
                      {q.verificationStatus || 'SOURCE_REVIEWED'}
                    </span>

                    {/* Company & Role */}
                    {q.company && (
                      <span className="text-[11px] font-bold text-forest-dark bg-sage/15 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Building2 size={12} className="text-forest" /> {q.company}
                      </span>
                    )}
                    {q.jobRole && (
                      <span className="text-[11px] font-bold text-forest-dark bg-sage/15 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Briefcase size={12} className="text-forest" /> {q.jobRole}
                      </span>
                    )}
                  </div>

                  {/* Difficulty & Round */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-cream px-2 py-0.5 rounded-md">
                      {q.interviewRound?.replace(/_/g, ' ') || 'Round 1'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        q.difficulty === 'HARD'
                          ? 'bg-rose-100 text-rose-800'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <h4 className="text-base font-bold text-ink leading-snug">{q.questionText}</h4>

                {/* Skill Tags */}
                {q.skillTags && q.skillTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                      <Tag size={10} /> Skills:
                    </span>
                    {q.skillTags.map((s: any) => (
                      <span
                        key={s._id || s}
                        className="bg-cream text-forest-dark font-semibold text-[10px] px-2 py-0.5 rounded-md border border-sage/20"
                      >
                        {s.name || s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Provenance Attribution Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-sage/10 text-xs text-muted">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>Source: {q.sourceAttribution || 'SkillPath AI Curated'}</span>
                    {q.sourceUrl && (
                      <a
                        href={q.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-forest hover:text-gold font-bold transition ml-1"
                        title="View original candidate report source"
                      >
                        <ExternalLink size={12} /> Source Link
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q._id)}
                    className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        Hide Evaluation Rubric <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        View Evaluation Rubric <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                </div>

                {/* Expandable Rubric Details */}
                {isExpanded && (
                  <div className="mt-3 bg-cream/40 border border-sage/20 rounded-xl p-4 text-xs space-y-2.5 animate-fade-in">
                    {q.sampleAnswer && (
                      <div>
                        <strong className="text-forest font-bold block mb-0.5">Sample Answer Outline:</strong>
                        <p className="text-forest-dark font-medium leading-relaxed italic">{q.sampleAnswer}</p>
                      </div>
                    )}
                    {q.expectedKeywords && q.expectedKeywords.length > 0 && (
                      <div>
                        <strong className="text-forest font-bold block mb-1">Key Evaluation Terminology:</strong>
                        <div className="flex flex-wrap gap-1">
                          {q.expectedKeywords.map((kw: string, kidx: number) => (
                            <span
                              key={kidx}
                              className="bg-white text-forest-dark font-semibold px-2 py-0.5 rounded border border-sage/30 text-[10px]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-muted italic pt-1 border-t border-sage/20">
                      Disclaimer: Sourced questions represent verified candidate submissions and standard benchmarks. They do not guarantee appearance in any future interview.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isOpenAsModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-cream max-w-5xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-sage/30">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
