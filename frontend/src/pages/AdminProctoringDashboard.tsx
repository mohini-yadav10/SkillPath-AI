import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

export default function AdminProctoringDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/proctoring/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/proctoring/admin/${id}/review`, {
        reviewStatus: status,
        reviewerNotes: `Reviewed by Admin on ${new Date().toLocaleDateString()}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSessions(); // Refresh
    } catch (error) {
      console.error('Failed to review', error);
      alert('Failed to update review status');
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-muted animate-pulse">Loading Proctoring Data...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
            <ShieldAlert className="text-forest" size={32} />
            Proctoring Review Dashboard
          </h1>
          <p className="text-muted mt-2">Monitor AI-flagged events and review assessment integrity.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage/20 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-cream/50 text-forest-dark/70 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Student</th>
              <th className="px-6 py-4 font-bold">Skill / Assessment</th>
              <th className="px-6 py-4 font-bold">Score</th>
              <th className="px-6 py-4 font-bold">AI Flags</th>
              <th className="px-6 py-4 font-bold">Review Status</th>
              <th className="px-6 py-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/10 text-forest-dark">
            {sessions.map(session => (
              <tr key={session._id} className="hover:bg-cream/50">
                <td className="px-6 py-4">
                  <div className="font-bold">{session.studentId?.name || 'Unknown Student'}</div>
                  <div className="text-xs text-muted">{new Date(session.createdAt).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 font-medium">{session.skillId?.name || 'Unknown Skill'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${session.score >= 70 ? 'bg-sage/20 text-forest' : 'bg-sage/10 text-forest-dark'}`}>
                    {session.score}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  {session.proctoring?.events?.length > 0 ? (
                    <span className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full w-max">
                      <AlertTriangle size={14} /> {session.proctoring.events.length} Flags
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-forest font-bold text-sm bg-sage/10 px-3 py-1 rounded-full w-max">
                      <CheckCircle size={14} /> Clean
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted">
                    {session.proctoring?.reviewStatus || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(session._id, 'APPROVED')} className="p-2 bg-sage/10 text-forest hover:bg-sage/20 rounded-lg" title="Clear / Approve">
                      <CheckCircle size={18} />
                    </button>
                    <button onClick={() => handleReview(session._id, 'REJECTED')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg" title="Reject / Fail">
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted font-medium">
                  No proctored sessions found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
