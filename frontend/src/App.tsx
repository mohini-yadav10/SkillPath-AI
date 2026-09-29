import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import Profile from './pages/Profile';
import CareerDiscovery from './pages/CareerDiscovery';
import LearningPath from './pages/LearningPath';
import AssessmentList from './pages/AssessmentList';
import AssessmentActive from './pages/AssessmentActive';
import AssessmentResult from './pages/AssessmentResult';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Network from './pages/Network';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/career" element={<ProtectedRoute><CareerDiscovery /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
              <Route path="/assessment" element={<ProtectedRoute><AssessmentList /></ProtectedRoute>} />
              <Route path="/assessment/:id" element={<ProtectedRoute><AssessmentActive /></ProtectedRoute>} />
              <Route path="/assessment/:id/result" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
              <Route path="/profile/resume" element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
              <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
