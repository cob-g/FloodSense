import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Show a loading spinner or placeholder while checking auth state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with return URL
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the child components
  return children;
};

export default PrivateRoute;
