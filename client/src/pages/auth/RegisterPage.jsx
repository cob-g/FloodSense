import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const BARANGAYS = [
  'Barangay 165',
  'Barangay 166',
  'Barangay 167',
  'Barangay 168',
  'Barangay 170',
  'Barangay 171',
  'Barangay 172',
  'Barangay 173',
  'Barangay 176-A',
  'Barangay 176-B',
  'Barangay 176-C',
  'Barangay 176-D',
  'Barangay 176-E',
  'Barangay 176-F',
  'Barangay 178',
  'Barangay 179',
  'Barangay 180',
  'Barangay 181',
  'Barangay 182',
  'Barangay 183',
  'Barangay 184',
  'Barangay 185',
  'Barangay 186',
  'Barangay 187',
  'Barangay 188',
];

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    barangay: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [brgyOpen, setBrgyOpen] = useState(false);
  const brgyRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (brgyRef.current && !brgyRef.current.contains(e.target)) {
        setBrgyOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      if (response.success) {
        navigate('/');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-black bg-dot-pattern text-white flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Column - Branding & Features (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="text-center lg:text-left">
            <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-white to-accent-orange bg-clip-text text-transparent">
              FloodSense
            </h1>
            {/* <p className="text-2xl text-medium-gray mb-8">Your Flood Safety Companion</p> */}
            
            {/* Simplified Features List */}
            <div className="space-y-6">
              {/* Feature 1: Before a Flood */}
              <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center group-hover:bg-green-400/30 transition-colors duration-300">
                    <i className="fas fa-clipboard-check text-green-400 text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">Before a Flood</h3>
                    <p className="text-medium-gray text-sm leading-relaxed">
                      Early warnings, evacuation plans, and preparation guides to keep you ready
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <span className="text-green-400">• Early Alerts</span>
                      <span className="text-green-400">• Preparation Guides</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: During a Flood */}
              <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-400/20 rounded-xl flex items-center justify-center group-hover:bg-orange-400/30 transition-colors duration-300">
                    <i className="fas fa-exclamation-triangle text-orange-400 text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">During a Flood</h3>
                    <p className="text-medium-gray text-sm leading-relaxed">
                      Real-time updates, emergency contacts, and live community support
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <span className="text-orange-400">• Live Updates</span>
                      <span className="text-orange-400">• Emergency Contacts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: After a Flood */}
              <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center group-hover:bg-blue-400/30 transition-colors duration-300">
                    <i className="fas fa-home text-blue-400 text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">After a Flood</h3>
                    <p className="text-medium-gray text-sm leading-relaxed">
                      Damage assessment, recovery resources, and community rebuilding support
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <span className="text-blue-400">• Damage Assessment</span>
                      <span className="text-blue-400">• Recovery Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-medium-gray">
                <div className="flex items-center gap-2">
                  <i className="fas fa-shield-alt text-green-400"></i>
                  <span>Verified Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-users text-accent-orange"></i>
                  <span>Community Trusted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form (Always visible) */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          {/* Mobile-only header */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-accent-orange bg-clip-text text-transparent">
              FloodSense
            </h1>
            {/* <p className="text-medium-gray mb-4">Your Flood Safety Companion</p> */}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white mb-2">Create Account</h2>
            <p className="text-medium-gray">Join our flood safety community</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-red/20 border border-danger-red/30 rounded-xl text-red-200 text-sm">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray"
                  placeholder="Juan Dela Cruz"
                />
              </div>

              {/* Email - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray"
                  placeholder="your@email.com"
                />
              </div>

              {/* Barangay - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Barangay
                </label>
                <div className="relative" ref={brgyRef}>
                  <button
                    type="button"
                    onClick={() => setBrgyOpen((v) => !v)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray flex items-center justify-between"
                    aria-haspopup="listbox"
                    aria-expanded={brgyOpen}
                  >
                    <span className={formData.barangay ? 'text-white' : 'text-medium-gray'}>
                      {formData.barangay || 'Select Barangay'}
                    </span>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {brgyOpen && (
                    <ul
                      role="listbox"
                      className="absolute z-[2200] mt-2 w-full bg-space-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto py-1"
                    >
                      {BARANGAYS.map((barangay) => (
                        <li key={barangay}>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, barangay });
                              setBrgyOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              formData.barangay === barangay
                                ? 'bg-accent-orange/20 text-white'
                                : 'text-white/90 hover:bg-white/10'
                            }`}
                            role="option"
                            aria-selected={formData.barangay === barangay}
                          >
                            {barangay}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Phone - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray"
                  placeholder="09123456789"
                />
              </div>

              {/* Password - Half Width */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password - Half Width */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all text-white placeholder-medium-gray"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-orange hover:bg-bright-orange text-space-black font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1 mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-medium-gray">
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                className="text-accent-orange hover:text-bright-orange font-semibold transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;