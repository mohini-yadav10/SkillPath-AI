import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Send, CheckCircle, Clock, XCircle, Briefcase, MessageSquare, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Network() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory');
  const [alumniList, setAlumniList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [alumniRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/mentorship/alumni', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/mentorship/requests', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAlumniList(alumniRes.data.data);
      setRequests(requestsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/mentorship/request', 
        { alumniId: selectedAlumni._id, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalOpen(false);
      setMessage('');
      fetchData(); // Refresh to show new request
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> PENDING</span>;
      case 'ACCEPTED': return <span className="bg-sage/20 text-forest px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> ACCEPTED</span>;
      case 'REJECTED': return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> DECLINED</span>;
      default: return null;
    }
  };

  const filteredAlumni = alumniList.filter((a: any) => 
    `${a.firstName} ${a.lastName} ${a.currentCompany} ${a.currentJobTitle}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-sage/100 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-sage/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Users size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Professional Network</h1>
          <p className="text-cream/500 mt-2 font-medium max-w-xl">
            Connect with alumni, industry professionals, and peers. Request 1-on-1 mentorship to accelerate your career growth.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex bg-sage/10 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('directory')}
              className={`flex-1 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'directory' ? 'bg-white text-forest shadow-sm' : 'text-cream/500 hover:text-forest-dark'}`}
            >
              Directory
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-white text-forest shadow-sm' : 'text-cream/500 hover:text-forest-dark'}`}
            >
              Requests {requests.length > 0 && <span className="bg-sage/20 text-forest px-2 py-0.5 rounded-full text-[10px]">{requests.length}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, company, or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage/100 outline-none font-medium text-sm transition-shadow shadow-sm"
              />
            </div>
            <button className="bg-white border border-sage/20 text-forest-dark/70 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-cream/50 transition-colors shadow-sm w-full md:w-auto justify-center">
              <Filter size={18} /> Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAlumni.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full bg-white p-12 text-center rounded-3xl border border-sage/20 shadow-sm">
                  <p className="text-cream/500 font-medium">No professionals match your search criteria.</p>
                </motion.div>
              ) : (
                filteredAlumni.map((alumni: any, i) => (
                  <motion.div 
                    key={alumni._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-sage/20 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-sage/30 transition-all flex flex-col h-full group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-sage/20 to-sage/10 rounded-2xl flex items-center justify-center text-forest font-black text-xl shadow-inner border border-sage/20">
                        {alumni.firstName.charAt(0)}{alumni.lastName.charAt(0)}
                      </div>
                      <span className="bg-sage/10 text-cream/500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Alumni</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-ink leading-tight">{alumni.firstName} {alumni.lastName}</h3>
                    <div className="flex items-center gap-2 text-sm text-cream/500 mt-2 mb-4 font-bold">
                      <Briefcase size={16} className="text-muted" />
                      {alumni.currentJobTitle} <span className="text-forest">@</span> {alumni.currentCompany}
                    </div>
                    
                    <p className="text-sm text-cream/500 mb-6 line-clamp-3 font-medium flex-grow">
                      {alumni.bio || "Passionate professional willing to share industry insights and career advice with current students."}
                    </p>
                    
                    <button 
                      onClick={() => { setSelectedAlumni(alumni); setModalOpen(true); }}
                      className="w-full py-3 bg-cream/50 hover:bg-forest text-forest-dark hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-auto border border-sage/20 hover:border-forest"
                    >
                      <Send size={18} /> Request Mentorship
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-3xl border border-sage/20 shadow-sm">
              <div className="w-20 h-20 bg-cream/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-sage/30" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">No Requests Yet</h3>
              <p className="text-cream/500 font-medium">Reach out to an alumni from the directory to start building your network.</p>
            </div>
          ) : (
            requests.map((req: any, i) => (
              <motion.div 
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 md:p-8 rounded-3xl border border-sage/20 shadow-sm flex flex-col md:flex-row justify-between items-start gap-6 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-ink">
                      Request to {req.alumniId.firstName} {req.alumniId.lastName}
                    </h4>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-sm font-bold text-muted mb-4 flex items-center gap-1">
                    <Briefcase size={14}/> {req.alumniId.currentJobTitle} @ {req.alumniId.currentCompany}
                  </p>
                  
                  <div className="p-4 bg-cream/50 rounded-2xl text-sm text-forest-dark/70 italic border border-sage/10 font-medium">
                    "{req.message}"
                  </div>

                  {req.responseMessage && (
                    <div className="mt-4 p-4 bg-sage/10/50 rounded-2xl text-sm text-forest-dark border border-sage/20">
                      <span className="font-bold text-forest-dark block mb-1">Alumni Response:</span> 
                      {req.responseMessage}
                    </div>
                  )}
                  {req.meetingLink && (
                    <div className="mt-4 flex items-center gap-2 bg-sage/10 p-3 rounded-xl border border-sage/20">
                      <span className="font-bold text-forest-dark text-sm">Meeting Link:</span> 
                      <a href={req.meetingLink} target="_blank" rel="noreferrer" className="text-forest hover:text-forest hover:underline font-bold text-sm truncate">{req.meetingLink}</a>
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap bg-cream/50 px-3 py-1 rounded-lg">
                  {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && selectedAlumni && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-ink">Request Mentorship</h3>
                <button onClick={() => setModalOpen(false)} className="text-muted hover:text-forest-dark/70 bg-sage/10 p-2 rounded-full transition-colors"><XCircle size={20}/></button>
              </div>
              <div className="flex items-center gap-4 mb-6 p-4 bg-cream/50 rounded-2xl">
                <div className="w-12 h-12 bg-sage/20 rounded-xl flex items-center justify-center text-forest font-bold">
                  {selectedAlumni.firstName.charAt(0)}{selectedAlumni.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-ink">{selectedAlumni.firstName} {selectedAlumni.lastName}</p>
                  <p className="text-xs font-bold text-cream/500 uppercase tracking-wider">{selectedAlumni.currentCompany}</p>
                </div>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <label className="block text-sm font-bold text-forest-dark mb-2">Personalized Message</label>
                <textarea 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Hi! I am currently studying Full Stack Development and noticed you work at ExampleTech. I'd love to get 15 minutes of your time for career advice..."
                  className="w-full border-2 border-sage/20 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-sage/100/10 focus:border-sage/100 outline-none mb-6 transition-all font-medium resize-none"
                />
                <button type="submit" className="w-full bg-forest text-white py-3.5 rounded-xl font-bold hover:bg-forest-dark transition-colors shadow-lg shadow-forest/20">
                  Send Mentorship Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
