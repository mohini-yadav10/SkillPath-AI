import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.data.token, res.data.data);
      if (res.data.data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to SkillPath</h2>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
          Login
        </button>
        <button 
          type="button" 
          onClick={() => {
            setEmail('aarav@abc.edu');
            setPassword('demo123');
            setTimeout(() => {
              const form = document.getElementById('login-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }, 100);
          }}
          className="w-full bg-slate-100 text-slate-700 border border-slate-300 py-2 rounded hover:bg-slate-200 font-medium flex items-center justify-center gap-2 mt-2"
        >
          <span className="text-emerald-600 font-bold">●</span> Load DEMO MODE (Student)
        </button>
        <button 
          type="button" 
          onClick={() => {
            setEmail('admin@abc.edu');
            setPassword('demo123');
            setTimeout(() => {
              const form = document.getElementById('login-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }, 100);
          }}
          className="w-full bg-slate-800 text-white border border-slate-700 py-2 rounded hover:bg-slate-900 font-medium flex items-center justify-center gap-2 mt-2"
        >
          <span className="text-purple-400 font-bold">★</span> Load ADMIN DEMO (College)
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </div>
  );
};

export default Login;
