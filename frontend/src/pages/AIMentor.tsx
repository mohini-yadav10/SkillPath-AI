import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Send, 
  Upload, 
  FileText, 
  Trash2, 
  Sparkles, 
  Target, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCareerTarget } from '../context/CareerContext';

interface Message {
  id?: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  contextSources?: string[];
  createdAt?: string;
}

interface IndexedDocument {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  summary: string;
  createdAt: string;
}

export default function AIMentor() {
  const { target } = useCareerTarget();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'DOCUMENTS'>('CHAT');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/mentor/history', { headers });
      if (res.data.data && res.data.data.length > 0) {
        setMessages(res.data.data);
      } else {
        // Default welcoming message
        setMessages([
          {
            role: 'ASSISTANT',
            content: `Hello! I'm your **AI Career & Subject Mentor**. I'm connected directly to your **Career Twin** and uploaded syllabus notes.\n\n` +
              `I can help you bridge skill gaps for **${target?.roleName || 'your target role'}**, explain difficult architectural concepts, or extract exam topics from your documents.\n\n` +
              `How can I assist your career prep today?`,
            contextSources: ['Career Twin Data Layer']
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/mentor/documents', { headers });
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    fetchDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'USER', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        'http://localhost:5000/api/mentor/chat',
        { message: text },
        { headers }
      );

      const aiReply: Message = res.data.data;
      setMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      console.error('Chat error', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'ASSISTANT',
          content: 'Sorry, I encountered an error retrieving answers. Please make sure the backend is active.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      await axios.post('http://localhost:5000/api/mentor/documents', formData, { headers });
      await fetchDocuments();

      // Notify in chat
      setMessages(prev => [
        ...prev,
        {
          role: 'ASSISTANT',
          content: `✅ Successfully indexed **${file.name}**. I can now reference and cite this material when answering your questions!`,
          contextSources: [file.name]
        }
      ]);
    } catch (err: any) {
      console.error('Upload failed', err);
      alert(err.response?.data?.message || 'Failed to parse and upload document.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/mentor/documents/${id}`, { headers });
      setDocuments(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error('Delete doc failed', err);
    }
  };

  const handleClearChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete('http://localhost:5000/api/mentor/history', { headers });
      setMessages([
        {
          role: 'ASSISTANT',
          content: `Chat session reset. What topic would you like to explore next?`,
          contextSources: ['Career Twin Data Layer']
        }
      ]);
    } catch (err) {
      console.error('Clear chat error', err);
    }
  };

  const suggestedPrompts = [
    `How do I close my largest skill gap for ${target?.roleName || 'Full Stack Developer'}?`,
    'What portfolio project should I build next to get hired?',
    'Explain the key topics from my uploaded syllabus notes.',
    'Quiz me on asynchronous programming concepts.'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Header Banner with Career Twin Context */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-sage/30 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-forest text-cream flex items-center justify-center shadow-lg">
            <Bot size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-forest">AI Career & Subject Mentor</h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                RAG Grounded
              </span>
            </div>
            <p className="text-xs text-muted font-medium mt-1">
              Context-aware personal coach synthesizing your Career Twin profile and uploaded course notes.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-cream hover:bg-sage/20 text-forest text-xs font-bold px-4 py-2.5 rounded-xl border border-sage/40 transition flex items-center gap-2 shadow-sm"
          >
            {uploading ? (
              <><RefreshCw size={14} className="animate-spin" /> Indexing Document...</>
            ) : (
              <><Upload size={14} /> Upload Syllabus (PDF)</>
            )}
          </button>

          <button
            onClick={handleClearChat}
            className="text-xs font-bold text-muted hover:text-rose-600 bg-cream px-3 py-2.5 rounded-xl border border-sage/30 transition"
            title="Reset conversation"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar (Documents & Twin) + Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Knowledge Documents & Twin Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Target Role & Twin Snapshot */}
          <div className="bg-white p-6 rounded-3xl border border-sage/30 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-forest uppercase tracking-wider flex items-center gap-2">
              <Target size={16} /> Twin Grounding
            </h3>
            
            <div className="bg-cream/70 p-4 rounded-2xl border border-sage/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted">Target Career</span>
                <span className="font-black text-forest">{target?.roleName || 'Full Stack Developer'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted">Company</span>
                <span className="font-black text-forest">{target?.companyName || 'Top Tech'}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted font-medium">
              Responses are dynamically grounded in your assessed proficiencies and prioritized roadmap.
            </p>
          </div>

          {/* Indexed Knowledge Documents */}
          <div className="bg-white p-6 rounded-3xl border border-sage/30 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-forest uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} /> Indexed Notes ({documents.length})
              </h3>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-6 text-muted text-xs font-medium space-y-2 bg-cream/50 rounded-2xl p-4 border border-sage/20">
                <p>No syllabus notes uploaded yet.</p>
                <p className="text-[11px] text-muted/80">Upload course PDFs to query specific homework, exam formulas, or slide topics.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {documents.map((doc) => (
                  <div 
                    key={doc._id}
                    className="p-3 bg-cream/50 hover:bg-cream rounded-xl border border-sage/30 flex justify-between items-center text-xs transition"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-forest truncate">{doc.fileName}</p>
                      <span className="text-[10px] text-muted font-semibold">
                        {doc.totalChunks} semantic chunks &bull; {doc.fileType}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="text-muted hover:text-rose-500 p-1 transition"
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Chat Area (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-sage/30 shadow-sm flex flex-col h-[650px] overflow-hidden">
          
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'ASSISTANT';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 shadow-sm">
                      <Bot size={18} />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-cream/70 text-forest-dark border border-sage/30 shadow-sm'
                      : 'bg-forest text-cream shadow-md'
                  }`}>
                    <div className="whitespace-pre-line font-medium">
                      {msg.content}
                    </div>

                    {/* Context Citations */}
                    {isAssistant && msg.contextSources && msg.contextSources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-sage/20 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-muted">
                        <span className="text-forest">Sources:</span>
                        {msg.contextSources.map((src, i) => (
                          <span key={i} className="bg-white text-forest px-2 py-0.5 rounded-md border border-sage/30">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
                <div className="bg-cream/70 p-4 rounded-2xl border border-sage/30 flex items-center gap-2 text-xs font-bold text-forest">
                  <RefreshCw size={14} className="animate-spin text-gold" />
                  Synthesizing Career Twin context & syllabus retrieval...
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts Pills */}
          <div className="p-3 bg-cream/40 border-t border-sage/20 overflow-x-auto flex gap-2 custom-scrollbar">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap text-[11px] font-bold bg-white text-forest hover:bg-forest hover:text-cream px-3 py-1.5 rounded-xl border border-sage/30 transition shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Box */}
          <div className="p-4 bg-white border-t border-sage/30">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="flex items-center gap-2 bg-cream/70 rounded-2xl p-2 border border-sage/40 focus-within:border-forest transition"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about your skill gaps, syllabus topics, code examples..."
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none px-3 text-xs md:text-sm text-forest font-medium placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="bg-forest hover:bg-forest-dark disabled:opacity-50 text-cream p-2.5 rounded-xl shadow-md transition"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
