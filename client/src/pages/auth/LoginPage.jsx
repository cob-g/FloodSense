import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { AlertTriangle, Droplets } from 'lucide-react';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      if (response.success) {
        navigate(from, { replace: true });
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
    <div
      className="min-h-screen bg-dot-pattern flex items-center justify-center px-4 sm:px-6 py-10 relative"
      style={{ backgroundColor: '#fdf8f4' }}
    >
      {/* Soft radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 15% 20%, rgba(197,73,20,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 90% 85%, rgba(255,94,26,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-4xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 items-stretch">

        {/* ── Left: Brand Panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between rounded-[2.5rem] p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #c54914 0%, #7a2200 55%, #3a0e00 100%)',
            boxShadow: '0 24px 60px rgba(197,73,20,0.30)',
          }}
        >
          {/* White dot pattern overlay */}
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
          {/* Watermark */}
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
              Welcome<br />back.
            </h2>
            <p className="text-white/55 text-[15px] leading-relaxed max-w-xs">
              Sign in to access real-time flood data, live sensor readings, and your community's safety network.
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

        {/* ── Right: Login Form ── */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col shadow-[0_4px_40px_rgba(0,0,0,0.07)] border border-gray-100/80">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-7">
            <img src="/logo.png" alt="FloodSense" className="w-10 h-10" />
            <span className="text-xl font-black text-gray-900" style={{ fontFamily: 'Goodly, sans-serif' }}>FloodSense</span>
          </div>

          {/* Orange accent bar */}
          <div className="w-10 h-1.5 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #c54914, #ff5e1a)' }} />
          <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-1">Sign in</h2>
          <p className="text-gray-400 text-sm font-medium mb-8">Access your flood monitoring dashboard</p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c54914]/30 focus:border-[#c54914] transition-all text-gray-900 font-medium placeholder-gray-400 text-[15px]"
                placeholder="your@email.com"
              />
            </div>

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
                  Signing In...
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-[#c54914] hover:text-[#ff5e1a] font-bold transition-colors">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;