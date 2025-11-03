import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-950 p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-accent/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full animate-ping"></div>
          </div>
          <p className="mt-4 text-white/70 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin && user.role !== 'admin' && user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-space-800/80 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-white/70 mb-6">You don't have permission to access this page. Please contact an administrator if you believe this is an error.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent font-medium rounded-lg transition-colors border border-accent/30"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check for super admin access if required
  if (requireSuperAdmin && user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-space-800/80 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-xl">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Elevated Privileges Required</h3>
          <p className="text-white/70 mb-6">This section requires super administrator access. Please contact your system administrator for assistance.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium rounded-lg transition-colors border border-purple-500/30"
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
