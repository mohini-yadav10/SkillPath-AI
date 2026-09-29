import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase } from 'lucide-react';

export default function CareerDiscovery() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [compRes, roleRes, targetRes] = await Promise.all([
          axios.get('http://localhost:5000/api/career/companies', { headers }),
          axios.get('http://localhost:5000/api/career/roles', { headers }),
          axios.get('http://localhost:5000/api/career/target', { headers }),
        ]);
        setCompanies(compRes.data.data);
        setRoles(roleRes.data.data);
        
        if (targetRes.data.data) {
          if (targetRes.data.data.targetCompany) setSelectedCompany(targetRes.data.data.targetCompany._id);
          if (targetRes.data.data.targetRole) setSelectedRole(targetRes.data.data.targetRole._id);
        }
      } catch (error) {
        console.error("Failed to load career data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/career/target', {
        companyId: selectedCompany || null,
        roleId: selectedRole || null
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Target career updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to update target career');
    }
  };

  if (loading) return <div className="text-center py-10">Loading career data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Target Career Selection</h1>
        <p className="text-gray-600 mt-2">Select your dream company and role to personalize your skill path.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Building2 size={18} /> Target Company (Optional)
          </label>
          <select 
            value={selectedCompany} 
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3"
          >
            <option value="">Any Company</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Briefcase size={18} /> Target Role
          </label>
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3"
          >
            <option value="">Select a Role</option>
            {roles.map(r => (
              <option key={r._id} value={r._id}>{r.title} {r.companyId ? `(${r.companyId.name})` : ''}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSave}
          disabled={!selectedRole}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          Save Target Career
        </button>
      </div>
    </div>
  );
}
