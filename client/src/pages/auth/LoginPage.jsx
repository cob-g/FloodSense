import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      if (response.success) {
        const role = response?.data?.user?.role;
        if (role === 'admin' || role === 'superadmin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-black bg-dot-pattern text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="relative z-10">
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-orange rounded-2xl mb-6 shadow-lg">
              <span className="text-space-black font-bold text-4xl">F</span>
            </div> */}
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white to-light-orange bg-clip-text text-transparent">
              FloodSense
            </h1>
            <p className="text-medium-gray text-xl">Community Flood Monitoring</p>
          </div>
          
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
            <div className="absolute top-20 left-20 w-40 h-40 bg-accent-orange/10 rounded-full blur-3xl"></div>
            <div className="absolute top-10 right-20 w-32 h-32 bg-accent-orange/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 text-center border-l-4 border-accent-orange border border-white/10 hover:border-accent-orange transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="text-3xl font-black text-white mb-1">12</div>
            <div className="text-sm text-medium-gray uppercase tracking-wide">ACTIVE ALERTS</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 text-center border-l-4 border-bright-orange border border-white/10 hover:border-bright-orange transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="text-3xl font-black text-white mb-1">47mm</div>
            <div className="text-sm text-medium-gray uppercase tracking-wide">PRECIPITATION</div>
          </div>
        </div> */}

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-3">Sign In</h2>
            <p className="text-medium-gray">Access your flood monitoring dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-red/20 border border-danger-red/30 rounded-xl text-red-200 text-sm">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-orange hover:bg-bright-orange text-space-black font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-medium-gray">
              Don't have an account?{' '}
              <Link 
                to="/auth/register" 
                className="text-accent-orange hover:text-bright-orange font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {/* <div className="text-center mt-8">
          <p className="text-medium-gray text-sm">
            Essential Flood Intelligence • Clear, concise flood data when you need it most
          </p>
        </div> */}
      </div>

    </div>
  );
};

export default LoginPage;