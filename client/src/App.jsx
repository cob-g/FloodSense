import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/common/Layout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeed from './pages/admin/AdminFeed';
import AdminFallbacks from './pages/admin/AdminFallbacks';
import AdminWeekly from './pages/admin/AdminWeekly';
import SensorPage from './pages/SensorPage';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 overflow-hidden relative">
        {/* Enhanced Background with Gradient Mesh */}
        <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-400/5"></div>

  
        <div className="max-w-md w-full text-center relative z-10">
          {/* Premium Loading Card */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/15 shadow-2xl transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl relative overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-orange-400/20 rounded-3xl blur-sm opacity-30 animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
              {/* Brand Logo & Title */}
              <div className="text-center space-y-3">
                <p className="text-gray-400 text-sm font-medium tracking-wide">INTELLIGENT FLOOD MONITORING</p>
              </div>
              
              {/* Advanced Spinner */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-white/10 rounded-full shadow-inner"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full animate-spin-slow"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-r-orange-400 rounded-full animate-spin-slow animation-delay-100"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-lg animate-ping-slow"></div>
              </div>
              
              {/* Enhanced Loading Content */}
              <div className="space-y-6 w-full">
                <div className="space-y-3">
                  <p className="text-gray-300 text-lg font-semibold tracking-wide">System Initialization</p>
                  
                  {/* Multi-stage Progress */}
                  {/* <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                        <div className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 rounded-full animate-progress-wave"></div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
  
      </div>
    );
  }
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/auth/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

      {/* Protected Routes - Main App */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sensor" element={<SensorPage />} />
      </Route>

      {/* Protected Routes - Admin with Sidebar Layout */}
      <Route
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminFeed />} />
        <Route path="/admin/reports" element={<AdminDashboard />} />
        <Route path="/admin/fallbacks" element={<AdminFallbacks />} />
        <Route path="/admin/weekly" element={<AdminWeekly />} />
        {/* Future: <Route path="/admin/users" element={<AdminUsers />} /> */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;