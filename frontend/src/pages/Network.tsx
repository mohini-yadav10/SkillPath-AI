import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Send, CheckCircle, Clock, XCircle, Briefcase, MessageSquare } from 'lucide-react';

export default function Network() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory');
  const [alumniList, setAlumniList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [message, setMessage] = useState('');

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
      case 'ACCEPTED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> ACCEPTED</span>;
      case 'REJECTED': return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> DECLINED</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-20">Loading network data...</div>;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl shadow-md text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Users size={32} className="text-indigo-400" /> Alumni Network</h1>
        <p className="text-slate-300">Connect with industry professionals and request 1-on-1 mentorship.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'directory' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Alumni Directory
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Requests {requests.length > 0 && <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs">{requests.length}</span>}
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumniList.length === 0 ? (
            <p className="text-slate-500 col-span-3 text-center py-10">No alumni found in the directory right now.</p>
          ) : (
            alumniList.map((alumni: any) => (
              <div key={alumni._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
                    {alumni.firstName.charAt(0)}{alumni.lastName.charAt(0)}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{alumni.firstName} {alumni.lastName}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1 mb-4 font-medium">
                  <Briefcase size={16} className="text-slate-400" />
                  {alumni.currentJobTitle} @ <span className="text-indigo-600">{alumni.currentCompany}</span>
                </div>
                <p className="text-sm text-slate-500 mb-6 line-clamp-3">
                  {alumni.bio || "No bio provided."}
                </p>
                <button 
                  onClick={() => { setSelectedAlumni(alumni); setModalOpen(true); }}
                  className="w-full py-2.5 border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Request Mentorship
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">You haven't sent any mentorship requests yet.</p>
            </div>
          ) : (
            requests.map((req: any) => (
              <div key={req._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-slate-800">
                      Request to {req.alumniId.firstName} {req.alumniId.lastName}
                    </h4>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-slate-500">{req.alumniId.currentJobTitle} @ {req.alumniId.currentCompany}</p>
                  
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 italic border border-slate-100">
                    "{req.message}"
                  </div>

                  {req.responseMessage && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-100">
                      <span className="font-bold">Alumni Response:</span> {req.responseMessage}
                    </div>
                  )}
                  {req.meetingLink && (
                    <div className="mt-2 text-sm">
                      <span className="font-bold text-slate-700">Meeting Link:</span> <a href={req.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{req.meetingLink}</a>
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedAlumni && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Request Mentorship</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24}/></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Send a message to <strong>{selectedAlumni.firstName} {selectedAlumni.lastName}</strong> ({selectedAlumni.currentCompany}). Explain why you'd like to connect.
            </p>
            <form onSubmit={handleRequestSubmit}>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Hi! I am currently studying Full Stack Development and noticed you work at ExampleTech. I'd love to get 15 minutes of your time for career advice..."
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-4"
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                Send Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
