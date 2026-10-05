import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, BookOpen, Target, Activity } from 'lucide-react';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { 
        firstName, lastName, email, password, role: 'STUDENT' 
      });
      login(res.data.data.token, res.data.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row-reverse font-sans">
      
      {/* Right Branding / Creative Side */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-forest text-cream p-12 lg:p-20 flex-col relative overflow-hidden justify-center shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-10 rounded-l-[3rem] lg:rounded-l-[5rem]">
        {/* Animated organic shapes */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-64 -right-64 w-[800px] h-[800px] bg-forest-dark/30 rounded-full blur-3xl opacity-50 pointer-events-none" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -left-20 w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl opacity-60 pointer-events-none" 
        />
        
        <div className="relative z-10 flex flex-col h-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-end gap-4 mb-auto"
          >
            <h1 className="text-3xl font-black tracking-tight text-cream">SkillPath AI</h1>
            <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center text-forest shadow-lg transform rotate-6">
              <Compass size={28} strokeWidth={2.5} />
            </div>
          </motion.div>
          
          <div className="max-w-xl self-end text-right mt-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight"
            >
              Start building.<br />
              <span className="text-gold">Stop guessing.</span><br />
              Get hired.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-cream/70 font-medium ml-auto max-w-md"
            >
              Join the intelligent career platform that predicts your skill gaps and builds a roadmap specifically for you.
            </motion.p>
          </div>
          
          <div className="mt-auto pt-12 flex justify-end gap-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-2 bg-forest-dark/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-forest-dark">
              <Target size={16} className="text-coral" /> <span className="text-sm font-bold tracking-wide">Target Roles</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }} className="flex items-center gap-2 bg-forest-dark/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-forest-dark">
              <Activity size={16} className="text-sage" /> <span className="text-sm font-bold tracking-wide">Analytics</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Left Register Form Side */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex items-center justify-center p-8 lg:p-20 relative bg-cream">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-cream shadow-md">
              <Compass size={22} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-forest">SkillPath AI</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-ink mb-2">Create account</h2>
            <p className="text-muted font-medium">Join the intelligent career command center.</p>
          </div>
          
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-coral/10 text-coral p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 border border-coral/20">
              <span className="w-2 h-2 rounded-full bg-coral animate-pulse"></span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">First Name</label>
                <input 
                  type="text" 
                  required 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border-2 border-sage/20 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-forest/10 focus:border-forest outline-none transition-all font-medium text-ink placeholder:text-muted/50 shadow-sm"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Last Name</label>
                <input 
                  type="text" 
                  required 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border-2 border-sage/20 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-forest/10 focus:border-forest outline-none transition-all font-medium text-ink placeholder:text-muted/50 shadow-sm"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-sage/20 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-forest/10 focus:border-forest outline-none transition-all font-medium text-ink placeholder:text-muted/50 shadow-sm"
                placeholder="you@university.edu"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-sage/20 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-forest/10 focus:border-forest outline-none transition-all font-medium text-ink placeholder:text-muted/50 shadow-sm"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            
            <button type="submit" className="w-full bg-forest text-cream py-4 rounded-2xl font-bold text-lg hover:bg-forest-dark transition-all shadow-xl shadow-forest/20 flex items-center justify-center gap-2 group mt-2">
              Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="mt-10 text-center text-sm font-medium text-muted">
            Already have an account? <Link to="/login" className="text-forest font-bold hover:underline">Log in here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
