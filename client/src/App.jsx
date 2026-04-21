import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/LoadingSpinner';

// Eagerly loaded components (critical path)
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import ProtectedRoute from './components/common/ProtectedRoute';
import RealtimeNotifications from './components/common/RealtimeNotifications';

// Lazily loaded pages (code splitting)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
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
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'));

/**
 * Suspense wrapper with page loader
 */
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

/**
 * Handles unknown auth-style links from older emails and redirects safely.
 */
const LegacyAuthRouteResolver = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const params = new URLSearchParams(location.search);
  const token = params.get('token')?.trim();

  if (token) {
    return <Navigate to={`/auth/reset-password?token=${encodeURIComponent(token)}`} replace />;
  }

  if (path.includes('forgot') || path.includes('recover')) {
    return <Navigate to="/auth/forgot-password" replace />;
  }

  if (path.includes('reset') || path.includes('password')) {
    return <Navigate to="/auth/reset-password" replace />;
  }

  return <Navigate to="/404" replace />;
};

/**
 * If a token query is present anywhere in the URL, route to reset page.
 * This handles malformed or legacy emailed paths that still include token.
 */
const TokenQueryRedirect = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token')?.trim();
  const path = location.pathname.toLowerCase();

  if (!token) {
    return null;
  }

  if (path === '/auth/reset-password') {
    return null;
  }

  return <Navigate to={`/auth/reset-password?token=${encodeURIComponent(token)}`} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RealtimeNotifications />
        <TokenQueryRedirect />
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
            <Route
              path="logs"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <SuspenseWrapper>
                    <AdminLogs />
                  </SuspenseWrapper>
                </ProtectedRoute>
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
          <Route
            path="/auth/forgot-password"
            element={
              <SuspenseWrapper>
                <ForgotPasswordPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/auth/reset-password"
            element={
              <SuspenseWrapper>
                <ResetPasswordPage />
              </SuspenseWrapper>
            }
          />

          {/* Legacy password routes kept for older emailed links */}
          <Route
            path="/forgot-password"
            element={
              <SuspenseWrapper>
                <ForgotPasswordPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/reset-password"
            element={
              <SuspenseWrapper>
                <ResetPasswordPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/password-reset"
            element={
              <SuspenseWrapper>
                <ResetPasswordPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/reset"
            element={
              <SuspenseWrapper>
                <ResetPasswordPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/auth/password-reset"
            element={
              <SuspenseWrapper>
                <ResetPasswordPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/auth/reset"
            element={
              <SuspenseWrapper>
                <ResetPasswordPage />
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
          <Route path="*" element={<LegacyAuthRouteResolver />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
