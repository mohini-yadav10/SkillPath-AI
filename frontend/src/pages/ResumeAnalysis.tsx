import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertTriangle, Shield, Zap, ArrowRight, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5 MB.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error parsing resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <FileText size={160} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/10 border border-forest/20 text-forest font-bold text-xs mb-4">
            <Zap size={13} className="text-gold" /> NLP SKILL EXTRACTION
          </div>
          <h1 className="text-3xl font-black text-forest tracking-tight">Resume Analysis</h1>
          <p className="text-muted mt-2 font-medium">
            Upload your PDF resume and our NLP engine automatically extracts skills and populates your profile — ready for gap analysis.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      {!result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={`bg-white rounded-3xl border-2 border-dashed transition-all cursor-pointer shadow-sm relative
            ${dragging ? 'border-forest bg-sage/5 scale-[1.01]' : 'border-sage/40 hover:border-forest/60 hover:bg-cream/30'}
            ${file ? 'cursor-default' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="p-10 text-center">
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-colors ${dragging ? 'bg-forest text-cream' : 'bg-sage/20 text-forest'}`}>
                    <Upload size={36} />
                  </div>
                  <h3 className="text-lg font-black text-forest mb-1">
                    {dragging ? 'Drop to upload' : 'Drag & drop your resume'}
                  </h3>
                  <p className="text-sm text-muted font-medium mb-4">or click to browse — PDF only, max 5 MB</p>
                  <span className="inline-flex items-center gap-2 bg-forest text-cream font-bold px-5 py-2.5 rounded-xl text-sm shadow-md hover:bg-forest-dark transition">
                    <FileText size={15} /> Select PDF
                  </span>
                </motion.div>
              ) : (
                <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <p className="font-black text-forest text-lg mb-1 truncate max-w-xs mx-auto">{file.name}</p>
                  <p className="text-sm text-muted font-medium mb-6">{(file.size / 1024).toFixed(0)} KB • PDF Document</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                      disabled={loading}
                      className="flex items-center gap-2 bg-forest disabled:opacity-70 hover:bg-forest-dark text-cream font-bold px-6 py-3 rounded-xl transition shadow-md text-sm"
                    >
                      {loading ? <><RefreshCw size={15} className="animate-spin" /> Analyzing...</> : <><Zap size={15} /> Extract Skills</>}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(null); }}
                      className="flex items-center gap-2 bg-cream border border-sage/40 text-muted hover:text-forest font-bold px-4 py-3 rounded-xl transition text-sm"
                    >
                      <X size={14} /> Change File
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700"
          >
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Extraction Error</p>
              <p className="text-sm font-medium mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Success Banner */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-black text-emerald-900 text-sm">Analysis Complete</p>
                <p className="text-sm text-emerald-800 font-medium mt-0.5">{result.message || 'Skills extracted and added to your profile.'}</p>
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-forest">Extracted Skills</h3>
                <span className="text-xs font-bold text-muted bg-cream px-3 py-1 rounded-full border border-sage/30">
                  {result.extractedSkills?.length || 0} Skills Found
                </span>
              </div>

              {!result.extractedSkills?.length ? (
                <div className="text-center py-8 bg-cream/60 rounded-2xl border border-dashed border-sage/30">
                  <p className="text-muted font-medium text-sm">No exact skill matches found in our database.</p>
                  <p className="text-xs text-muted mt-1">Try adding skills manually via your Profile page.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {result.extractedSkills.map((skill: any, idx: number) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="inline-flex items-center gap-2 bg-cream border border-sage/30 text-forest font-bold px-3.5 py-2 rounded-xl text-sm"
                    >
                      {skill.name}
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Unverified
                      </span>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Trust Note */}
            <div className="bg-white p-6 rounded-2xl border border-sage/30 flex items-start gap-3">
              <div className="w-10 h-10 bg-forest/10 text-forest rounded-xl flex items-center justify-center shrink-0">
                <Shield size={18} />
              </div>
              <div>
                <p className="font-black text-forest text-sm mb-1">Verification Required</p>
                <p className="text-sm text-muted font-medium leading-relaxed">
                  Resume-extracted skills are tagged as <strong>Unverified</strong> and added with 50% confidence. 
                  Complete AI-proctored assessments to earn <strong>Verified</strong> badges and improve your Career Readiness Score.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 flex items-center justify-center gap-2 bg-forest text-cream font-bold py-3.5 rounded-2xl hover:bg-forest-dark transition shadow-md"
              >
                View Skill Profile <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/assessment')}
                className="flex-1 flex items-center justify-center gap-2 bg-cream border border-sage/40 text-forest font-bold py-3.5 rounded-2xl hover:bg-sage/10 transition"
              >
                Verify via Assessment <Zap size={16} className="text-gold" />
              </button>
              <button
                onClick={() => { setFile(null); setResult(null); setError(null); }}
                className="sm:w-auto flex items-center justify-center gap-2 text-muted hover:text-forest font-bold py-3.5 px-5 rounded-2xl bg-cream border border-sage/30 transition text-sm"
              >
                <RefreshCw size={15} /> Scan Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
