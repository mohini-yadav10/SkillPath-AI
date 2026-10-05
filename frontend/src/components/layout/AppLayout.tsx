import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  Map, 
  Video, 
  FileCheck, 
  Users, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Compass,
  Sun,
  Moon,
  FileText,
  BarChart3,
  Bot,
  FolderKanban,
  Activity
} from 'lucide-react';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Initialize dark mode state from document root
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Target Role', path: '/career', icon: Target },
    { name: 'Learning Path', path: '/learning', icon: Map },
    { name: 'Interviews', path: '/interview', icon: Video },
    { name: 'Assessments', path: '/assessment', icon: FileCheck },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Simulator', path: '/career-simulator', icon: Activity },
    { name: 'AI Mentor', path: '/ai-mentor', icon: Bot },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Network', path: '/network', icon: Users },
    { name: 'Resume', path: '/resume', icon: FileText },
  ];

  const secondaryItems = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const activeItem = [...navItems, ...secondaryItems].find(item => location.pathname.startsWith(item.path));
    return activeItem ? activeItem.name : 'SkillPath AI';
  };

  return (
    <div className="flex h-screen bg-cream overflow-hidden font-sans text-ink">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-forest-dark/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Modern Navigation Rail / Sidebar */}
      <motion.aside
        className={`fixed lg:static top-0 left-0 h-full w-72 lg:w-[280px] bg-white text-muted z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:my-4 lg:ml-4 lg:rounded-3xl shadow-2xl lg:shadow-xl lg:h-[calc(100vh-32px)] border border-sage/30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage/20 flex items-center justify-center text-forest shadow-sm transform -rotate-6">
              <Compass size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-forest">SkillPath AI</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-forest">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar px-6 space-y-8">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${isActive ? 'text-forest font-bold' : 'text-muted hover:text-forest hover:bg-sage/10'}`}
                >
                  {isActive && (
                    <motion.div layoutId="activeNavBg" className="absolute inset-0 bg-sage/10 rounded-2xl shadow-sm border border-sage/20" />
                  )}
                  {isActive && (
                    <motion.div layoutId="activeNavDot" className="absolute left-2 w-1.5 h-1.5 rounded-full bg-forest z-20" />
                  )}
                  <motion.div
                    whileHover={{ scale: isActive ? 1 : 1.05, x: isActive ? 0 : 4 }}
                    className="relative z-10 flex items-center gap-4 w-full"
                  >
                    <item.icon size={20} className={isActive ? 'text-forest' : 'text-muted group-hover:text-forest transition-colors'} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.name}</span>
                  </motion.div>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-sage/20">
            <nav className="space-y-2">
              {secondaryItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${isActive ? 'text-forest font-bold' : 'text-muted hover:text-forest hover:bg-sage/10'}`}
                  >
                    {isActive && (
                      <motion.div layoutId="activeNavBg" className="absolute inset-0 bg-sage/10 rounded-2xl shadow-sm border border-sage/20" />
                    )}
                    <motion.div
                      whileHover={{ scale: isActive ? 1 : 1.05, x: isActive ? 0 : 4 }}
                      className="relative z-10 flex items-center gap-4 w-full"
                    >
                      <item.icon size={20} className={isActive ? 'text-forest' : 'text-muted group-hover:text-forest transition-colors'} strokeWidth={isActive ? 2.5 : 2} />
                      <span>{item.name}</span>
                    </motion.div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Minimal Top Header */}
        <header className="h-24 flex items-center justify-between px-8 lg:px-12 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-forest hover:text-gold bg-white/50 p-2.5 rounded-xl shadow-sm border border-sage">
              <Menu size={20} />
            </button>
            <h2 className="text-2xl font-bold text-forest tracking-tight">{getPageTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div 
              animate={{ width: searchFocused ? 320 : 200 }}
              className="hidden md:flex items-center bg-white border border-sage/50 rounded-full px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-forest/10 focus-within:border-forest transition-all"
            >
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search skills, roles, courses..." 
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder:text-muted/70 text-ink"
              />
            </motion.div>

            <button onClick={toggleDark} className="p-2.5 bg-white border border-sage/50 rounded-full text-forest hover:text-gold shadow-sm transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button className="relative p-2.5 bg-white border border-sage/50 rounded-full text-forest hover:text-gold shadow-sm transition-colors group">
              <Bell size={18} className="group-hover:animate-swing" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-sage/50 rounded-full shadow-sm hover:border-forest transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-ink leading-tight">{user?.name || user?.firstName || 'Student'}</p>
                </div>
                <div className="text-muted"><User size={16} /></div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-sage/30 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 bg-cream/50 border-b border-sage/20">
                      <p className="font-bold text-ink truncate">{user?.name || `${user?.firstName} ${user?.lastName}` || 'Student'}</p>
                      <p className="text-xs text-muted truncate">{user?.email || 'student@skillpath.ai'}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-forest hover:bg-sage/10 rounded-xl transition-colors flex items-center gap-2">
                        <User size={16} /> My Profile
                      </button>
                      <button onClick={() => { setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-forest hover:bg-sage/10 rounded-xl transition-colors flex items-center gap-2">
                        <Settings size={16} /> Settings
                      </button>
                    </div>
                    <div className="p-2 border-t border-sage/20">
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-bold text-coral hover:bg-coral/10 rounded-xl transition-colors flex items-center gap-2">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-12 pb-12 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
