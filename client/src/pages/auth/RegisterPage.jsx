import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AlertTriangle, Droplets } from 'lucide-react';

const BARANGAYS = [
  'Barangay 165',
  'Barangay 166',
  'Barangay 167',
  'Barangay 168',
  'Barangay 170',
  'Barangay 171',
  'Barangay 172',
  'Barangay 173',
  'Barangay 174',
  'Barangay 175',
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
    <div
      className="min-h-screen bg-dot-pattern flex items-center justify-center px-4 sm:px-6 py-10 relative"
      style={{ backgroundColor: '#fdf8f4' }}
    >
      {/* Soft radial gradient overlay to add warmth over the dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 15% 20%, rgba(197,73,20,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 90% 85%, rgba(255,94,26,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-5xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-5 items-stretch">

        {/* ── Left: Brand Panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between rounded-[2.5rem] p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #c54914 0%, #7a2200 55%, #3a0e00 100%)',
            boxShadow: '0 24px 60px rgba(197,73,20,0.30)',
          }}
        >
          {/* Dot pattern overlay — white dots on the dark panel */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1.8px)',
              backgroundSize: '18px 18px',
            }}
          />
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          {/* Large watermark Droplets */}
          <div style={{ position: 'absolute', bottom: '30px', right: '-30px', opacity: 0.07, pointerEvents: 'none' }}>
            <Droplets size={240} strokeWidth={0.7} color="white" />
          </div>

          {/* Top: Logo + Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <img src="/logo.png" alt="FloodSense" className="w-14 h-14 drop-shadow-lg" />
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Goodly, sans-serif' }}>FloodSense</h1>
            </div>
            <h2 className="text-[38px] font-black text-white leading-tight mb-4">
              Stay safe,<br />stay informed.
            </h2>
            <p className="text-white/55 text-[15px] leading-relaxed max-w-xs">
              Real-time flood monitoring for your community. Join thousands of residents who rely on FloodSense.
            </p>
          </div>

          {/* Bottom: Feature Pills */}
          <div className="relative z-10 space-y-2.5 mt-10">
            {[
              { emoji: '🛰️', text: 'Live sensor data' },
              { emoji: '🗺️', text: 'Interactive flood maps' },
              { emoji: '🔔', text: 'Early warning alerts' },
            ].map(({ emoji, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/15"
                style={{ background: 'rgba(255,255,255,0.09)' }}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className="text-white/80 text-sm font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Form Panel ── */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col shadow-[0_4px_40px_rgba(0,0,0,0.07)] border border-gray-100/80">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-7">
            <img src="/logo.png" alt="FloodSense" className="w-10 h-10" />
            <span className="text-xl font-black text-gray-900" style={{ fontFamily: 'Goodly, sans-serif' }}>FloodSense</span>
          </div>

          {/* Orange accent bar */}
          <div className="w-10 h-1.5 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #c54914, #ff5e1a)' }} />
          <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-1">Create account</h2>
          <p className="text-gray-400 text-sm font-medium mb-7">Join our flood safety community</p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c54914]/30 focus:border-[#c54914] transition-all text-gray-900 font-medium placeholder-gray-400 text-[15px]"
                placeholder="Juan Dela Cruz"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c54914]/30 focus:border-[#c54914] transition-all text-gray-900 font-medium placeholder-gray-400 text-[15px]"
                placeholder="your@email.com"
              />
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5">Barangay</label>
              <div className="relative" ref={brgyRef}>
                <button
                  type="button"
                  onClick={() => setBrgyOpen((v) => !v)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-[#c54914]/30 focus:border-[#c54914] transition-all flex items-center justify-between text-[15px]"
                  aria-haspopup="listbox"
                  aria-expanded={brgyOpen}
                >
                  <span className={formData.barangay ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {formData.barangay || 'Select Barangay'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {brgyOpen && (
                  <ul
                    role="listbox"
                    className="absolute z-[2200] mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto py-1.5"
                  >
                    {BARANGAYS.map((barangay) => (
                      <li key={barangay}>
                        <button
                          type="button"
                          onClick={() => { setFormData({ ...formData, barangay }); setBrgyOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            formData.barangay === barangay ? 'text-[#c54914] bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
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

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5">
                Phone <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c54914]/30 focus:border-[#c54914] transition-all text-gray-900 font-medium placeholder-gray-400 text-[15px]"
                placeholder="09123456789"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c54914]/30 focus:border-[#c54914] transition-all text-gray-900 font-medium placeholder-gray-400 text-[15px]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5">Confirm</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c54914]/30 focus:border-[#c54914] transition-all text-gray-900 font-medium placeholder-gray-400 text-[15px]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-[15px] hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #c54914 0%, #ff5e1a 100%)',
                boxShadow: '0 8px 24px rgba(197,73,20,0.30)',
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400 font-medium">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[#c54914] hover:text-[#ff5e1a] font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;