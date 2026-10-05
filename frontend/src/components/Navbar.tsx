import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-sage/20 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-forest flex items-center gap-2">
          <span>SkillPath AI</span>
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <div className="hidden md:flex gap-4">
                  <Link to="/admin" className="text-forest-dark hover:text-forest font-medium text-sm">Admin Dashboard</Link>
                </div>
              ) : (
                <div className="hidden md:flex gap-4">
                  <Link to="/dashboard" className="text-forest-dark hover:text-forest font-medium text-sm">Dashboard</Link>
                  <Link to="/career" className="text-forest-dark hover:text-forest font-medium text-sm">Target Role</Link>
                  <Link to="/learning" className="text-forest-dark hover:text-forest font-medium text-sm">Learning Path</Link>
                  <Link to="/interview" className="text-forest-dark hover:text-forest font-medium text-sm">Interviews</Link>
                  <Link to="/assessment" className="text-forest-dark hover:text-forest font-medium text-sm">Assessments</Link>
                  <Link to="/network" className="text-forest-dark hover:text-forest font-medium text-sm">Network</Link>
                  <Link to="/profile" className="text-forest-dark hover:text-forest font-medium text-sm">Profile</Link>
                </div>
              )}
              <span className="text-sm text-forest-dark/70 flex items-center gap-2 border-l pl-4 border-sage/30">
                <UserIcon size={16} /> {user.firstName}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-forest-dark hover:text-forest">Login</Link>
              <Link to="/register" className="text-sm font-medium bg-forest text-white px-4 py-2 rounded-md hover:bg-forest-dark">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
