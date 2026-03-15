 import { Routes, Route, Navigate } from 'react-router-dom';
 import { ThemeProvider } from './contexts/ThemeContext';
 import PrivateRoute from './components/auth/PrivateRoute';
 import ProtectedRoute from './components/common/ProtectedRoute';
 import AdminLayout from './components/admin/AdminLayout';
 import AdminDashboard from './pages/admin/AdminDashboard';
 import AdminFeed from './pages/admin/AdminFeed';
 import AdminUsers from './pages/admin/AdminUsers';
 import AdminSensors from './pages/admin/AdminSensors';
 import AdminWeekly from './pages/admin/AdminWeekly';
 import AdminWeeklyPrint from './pages/admin/AdminWeeklyPrint';
 import AdminFallbacks from './pages/admin/AdminFallbacks';
 import Layout from './components/common/Layout';
 import LandingPage from './pages/LandingPage';
 import LearnPage from './pages/LearnPage';
 import AboutPage from './pages/AboutPage';
 import ContactPage from './pages/ContactPage';
 import FeedPage from './pages/FeedPage';
 import LoginPage from './pages/auth/LoginPage';
 import RegisterPage from './pages/auth/RegisterPage';
 import NotFoundPage from './pages/NotFoundPage';
 import ProfilePage from './pages/profile/ProfilePage';

function App() {
  return (
    <ThemeProvider>
          <Routes>
            {/* Public site layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>
          {/* Admin print-friendly route (outside AdminLayout) */}
          <Route
            path="/admin/weekly/print"
            element={
              <ProtectedRoute requireAdmin>
                <AdminWeeklyPrint />
              </ProtectedRoute>
            }
          />
            {/* Admin Route Group */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Default admin landing */}
              <Route index element={<AdminFeed />} />
              {/* Admin sections */}
              <Route path="feed" element={<AdminFeed />} />
              <Route path="reports" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="weekly" element={<AdminWeekly />} />
              <Route path="fallbacks" element={<AdminFallbacks />} />
              {/* Optional: sensors not yet implemented, fallback to dashboard */}
              <Route path="sensors" element={<AdminSensors />} />
            </Route>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
    </ThemeProvider>
  );
}

export default App;