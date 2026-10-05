import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, CheckCircle2, Search, ArrowRight, Target, Sparkles, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCareerTarget } from '../context/CareerContext';

export default function CareerDiscovery() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { refetchTarget } = useCareerTarget();

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
          if (targetRes.data.data.companyId) setSelectedCompany(targetRes.data.data.companyId);
          else if (targetRes.data.data.targetCompany) setSelectedCompany(targetRes.data.data.targetCompany._id);

          if (targetRes.data.data.roleId) setSelectedRole(targetRes.data.data.roleId);
          else if (targetRes.data.data.targetRole) setSelectedRole(targetRes.data.data.targetRole._id);
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
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 1. Save Target Career
      await axios.post('http://localhost:5000/api/career/target', {
        companyId: selectedCompany || null,
        roleId: selectedRole || null
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // 2. Recalculate Skill Gap and Readiness for the new role
      await axios.post('http://localhost:5000/api/analysis/recalculate', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      }).catch(err => console.warn('Recalculation failed:', err));
      
      await refetchTarget();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to update target career');
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = selectedCompany ? (r.companyId && r.companyId._id === selectedCompany) || !r.companyId : true;
    return matchesSearch && matchesCompany;
  });

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-sage/100 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="bg-forest text-white p-8 md:p-12 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Target size={180} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wide uppercase mb-4 text-sage/30">
            <Sparkles size={14} /> Career Navigator
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">Design your dream career path.</h1>
          <p className="text-muted font-medium text-lg">Select your target company and role. Our AI will analyze your current skills and build a personalized curriculum to get you hired.</p>
        </div>
        
        <div className="relative z-10 w-full md:w-auto shrink-0 bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
          <div className="text-center mb-4">
            <p className="text-sm font-bold text-sage/30 uppercase tracking-widest mb-1">Status</p>
            {selectedRole ? (
              <span className="inline-flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full"><CheckCircle2 size={16}/> Target Locked</span>
            ) : (
              <span className="text-amber-400 font-bold">Needs Selection</span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={!selectedRole}
            className="w-full bg-white text-forest font-bold py-3.5 px-8 rounded-xl shadow-lg hover:bg-sage/10 disabled:bg-white/20 disabled:text-white/50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Save Targets <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Company Selection Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2"><Building2 className="text-sage/100"/> Target Company</h2>
            <span className="text-sm font-bold text-muted">Optional</span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCompany('')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4
                ${selectedCompany === '' ? 'border-sage/100 bg-sage/10 shadow-md shadow-sage/100/10' : 'border-sage/20 bg-white hover:border-indigo-300'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedCompany === '' ? 'bg-forest text-white' : 'bg-sage/10 text-muted'}`}>
                <Building size={24} />
              </div>
              <div>
                <h3 className={`font-bold ${selectedCompany === '' ? 'text-forest-dark' : 'text-forest-dark'}`}>Any Company</h3>
                <p className="text-sm font-medium text-cream/500">General industry standards</p>
              </div>
              {selectedCompany === '' && <CheckCircle2 className="ml-auto text-forest" size={20} />}
            </motion.div>

            {companies.map((c, i) => (
              <motion.div 
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCompany(c._id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4
                  ${selectedCompany === c._id ? 'border-sage/100 bg-sage/10 shadow-md shadow-sage/100/10' : 'border-sage/20 bg-white hover:border-indigo-300'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0
                  ${selectedCompany === c._id ? 'bg-forest text-white' : 'bg-sage/10 text-forest-dark/70'}`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${selectedCompany === c._id ? 'text-forest-dark' : 'text-forest-dark'}`}>{c.name}</h3>
                  <p className="text-sm font-medium text-cream/500 truncate">{c.industry || 'Technology'}</p>
                </div>
                {selectedCompany === c._id && <CheckCircle2 className="ml-auto text-forest shrink-0" size={20} />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Role Selection Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2"><Briefcase className="text-sage/100"/> Select Target Role</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search roles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-sage/20 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-sage/100 focus:border-sage/100 outline-none transition-shadow font-medium text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-4">
            {filteredRoles.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white border border-sage/20 rounded-3xl">
                <p className="text-cream/500 font-medium">No roles match your search or selected company.</p>
              </div>
            ) : (
              filteredRoles.map((r, i) => (
                <motion.div 
                  key={r._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedRole(r._id)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group
                    ${selectedRole === r._id ? 'border-sage/100 bg-white shadow-xl shadow-sage/100/10' : 'border-sage/20 bg-white hover:border-indigo-300 hover:shadow-md'}`}
                >
                  {selectedRole === r._id && (
                    <div className="absolute top-0 right-0 bg-sage/100 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                      Selected
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold mb-1 ${selectedRole === r._id ? 'text-forest-dark' : 'text-ink'}`}>{r.title}</h3>
                    {r.companyId ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cream/500 bg-sage/10 px-2.5 py-1 rounded-lg">
                        <Building size={12} /> {r.companyId.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cream/500 bg-sage/10 px-2.5 py-1 rounded-lg">
                        <Briefcase size={12} /> General Standard
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-sage/10">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Required Core Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.requiredSkills?.slice(0, 4).map((req: any, idx: number) => (
                        <span key={idx} className={`text-[10px] font-bold px-2 py-1 rounded-md
                          ${selectedRole === r._id ? 'bg-sage/10 text-forest' : 'bg-sage/10 text-cream/500'}`}>
                          {req.skillId?.name || 'Skill'}
                        </span>
                      ))}
                      {r.requiredSkills?.length > 4 && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-cream/50 text-muted">
                          +{r.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
