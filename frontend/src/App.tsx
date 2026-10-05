import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CareerProvider } from './context/CareerContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import Profile from './pages/Profile';
import CareerDiscovery from './pages/CareerDiscovery';
import LearningPath from './pages/LearningPath';
import AssessmentList from './pages/AssessmentList';
import AssessmentActive from './pages/AssessmentActive';
import ProctoredAssessment from './pages/ProctoredAssessment';
import AssessmentResult from './pages/AssessmentResult';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Network from './pages/Network';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import InterviewDashboard from './pages/InterviewDashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewActive from './pages/InterviewActive';
import InterviewResult from './pages/InterviewResult';
import AdminProctoringDashboard from './pages/AdminProctoringDashboard';
import CareerAnalytics from './pages/CareerAnalytics';
import CareerSimulator from './pages/CareerSimulator';
import AIMentor from './pages/AIMentor';
import Projects from './pages/Projects';

import AppLayout from './components/layout/AppLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#F4F7FB]"><div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <AuthProvider>
      <CareerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes wrapped in AppLayout automatically */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/career" element={<ProtectedRoute><CareerDiscovery /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentList /></ProtectedRoute>} />
            <Route path="/assessment/:id" element={<ProtectedRoute><AssessmentActive /></ProtectedRoute>} />
            <Route path="/assessment/:id/proctored" element={<ProtectedRoute><ProctoredAssessment /></ProtectedRoute>} />
            <Route path="/assessment/:id/result" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><CareerAnalytics /></ProtectedRoute>} />
            <Route path="/career-simulator" element={<ProtectedRoute><CareerSimulator /></ProtectedRoute>} />
            <Route path="/ai-mentor" element={<ProtectedRoute><AIMentor /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/proctoring" element={<ProtectedRoute><AdminProctoringDashboard /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewDashboard /></ProtectedRoute>} />
            <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
            <Route path="/interview/:id/active" element={<ProtectedRoute><InterviewActive /></ProtectedRoute>} />
            <Route path="/interview/:id/result" element={<ProtectedRoute><InterviewResult /></ProtectedRoute>} />
          </Routes>
        </Router>
      </CareerProvider>
    </AuthProvider>
  );
}

export default App;
