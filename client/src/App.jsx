import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/LoadingSpinner';

// Eagerly loaded components (critical path)
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazily loaded pages (code splitting)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin pages (separate chunk)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminFeed = lazy(() => import('./pages/admin/AdminFeed'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSensors = lazy(() => import('./pages/admin/AdminSensors'));
const AdminWeekly = lazy(() => import('./pages/admin/AdminWeekly'));
const AdminWeeklyPrint = lazy(() => import('./pages/admin/AdminWeeklyPrint'));
const AdminFallbacks = lazy(() => import('./pages/admin/AdminFallbacks'));

/**
 * Suspense wrapper with page loader
 */
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Routes>
          {/* Public site layout */}
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <SuspenseWrapper>
                  <LandingPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/feed"
              element={
                <SuspenseWrapper>
                  <FeedPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <SuspenseWrapper>
                    <ProfilePage />
                  </SuspenseWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/learn"
              element={
                <SuspenseWrapper>
                  <LearnPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/about"
              element={
                <SuspenseWrapper>
                  <AboutPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/contact"
              element={
                <SuspenseWrapper>
                  <ContactPage />
                </SuspenseWrapper>
              }
            />
          </Route>

          {/* Admin print-friendly route (outside AdminLayout) */}
          <Route
            path="/admin/weekly/print"
            element={
              <ProtectedRoute requireAdmin>
                <SuspenseWrapper>
                  <AdminWeeklyPrint />
                </SuspenseWrapper>
              </ProtectedRoute>
            }
          />

          {/* Admin Route Group */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <SuspenseWrapper>
                  <AdminLayout />
                </SuspenseWrapper>
              </ProtectedRoute>
            }
          >
            {/* Default admin landing */}
            <Route
              index
              element={
                <SuspenseWrapper>
                  <AdminFeed />
                </SuspenseWrapper>
              }
            />
            {/* Admin sections */}
            <Route
              path="feed"
              element={
                <SuspenseWrapper>
                  <AdminFeed />
                </SuspenseWrapper>
              }
            />
            <Route
              path="reports"
              element={
                <SuspenseWrapper>
                  <AdminDashboard />
                </SuspenseWrapper>
              }
            />
            <Route
              path="users"
              element={
                <SuspenseWrapper>
                  <AdminUsers />
                </SuspenseWrapper>
              }
            />
            <Route
              path="weekly"
              element={
                <SuspenseWrapper>
                  <AdminWeekly />
                </SuspenseWrapper>
              }
            />
            <Route
              path="fallbacks"
              element={
                <SuspenseWrapper>
                  <AdminFallbacks />
                </SuspenseWrapper>
              }
            />
            <Route
              path="sensors"
              element={
                <SuspenseWrapper>
                  <AdminSensors />
                </SuspenseWrapper>
              }
            />
          </Route>

          {/* Auth routes */}
          <Route
            path="/auth/login"
            element={
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/auth/register"
            element={
              <SuspenseWrapper>
                <RegisterPage />
              </SuspenseWrapper>
            }
          />

          {/* 404 */}
          <Route
            path="/404"
            element={
              <SuspenseWrapper>
                <NotFoundPage />
              </SuspenseWrapper>
            }
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
