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
    <div className="min-h-screen relative overflow-hidden flex flex-col">

      {/* ── Top hero band: orange gradient ── */}
      <div
        className="relative flex-none overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #c54914 0%, #7a2200 55%, #3a0e00 100%)',
          minHeight: '52vh',
        }}
      >
        {/* Dot overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1.8px)', backgroundSize: '18px 18px' }}
        />
        {/* Blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        {/* Large Droplets watermark */}
        <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', opacity: 0.07, pointerEvents: 'none' }}>
          <Droplets size={280} strokeWidth={0.6} color="white" />
        </div>

        {/* Top-left logo lockup */}
        <div className="relative z-10 flex items-center gap-2 px-7 pt-7">
          <img src="/logo.png" alt="FloodSense" className="w-14 h-14 drop-shadow-md" />
          <span className="text-[1.5rem] font-black text-white tracking-tight" style={{ fontFamily: 'Goodly, sans-serif' }}>
            FloodSense
          </span>
        </div>

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 pt-16 pb-16">

          {/* Decorative label above headline */}
          <div className="flex items-center gap-3 mb-6">
            <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Caloocan City · Flood Early Warning
            </span>
            <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.3)' }} />
          </div>

          <h2
            className="text-white font-black leading-[1.1] mb-4"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 4rem)', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
          >
            Welcome back.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '320px', lineHeight: 1.7 }}>
            Your real-time flood monitoring dashboard is ready.
          </p>
        </div>

        {/* Curved cut at the bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ lineHeight: 0 }}
        >
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '72px' }}>
            <path d="M0,72 C360,0 1080,0 1440,72 L1440,72 L0,72 Z" fill="#fdf8f4" />
          </svg>
        </div>
      </div>

      {/* ── Bottom: cream + dot pattern ── */}
      <div
        className="flex-1 bg-dot-pattern relative flex flex-col items-center px-4 pb-12"
        style={{ backgroundColor: '#fdf8f4' }}
      >
        {/* Warm radial overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 10% 30%, rgba(197,73,20,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 90% 80%, rgba(255,94,26,0.05) 0%, transparent 60%)',
          }}
        />

        {/* ── Floating liquid-glass form card ── */}
        <div
          className="relative z-10 w-full max-w-[420px] rounded-[2rem] px-8 py-9 overflow-hidden"
          style={{
            marginTop: '-44px',
            background: 'rgba(255, 255, 255, 0.62)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.82)',
            boxShadow:
              '0 24px 56px rgba(197,73,20,0.13), 0 4px 16px rgba(197,73,20,0.07), inset 0 1.5px 0 rgba(255,255,255,0.95)',
          }}
        >
          {/* Glass inner top-highlight shimmer */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 30%, rgba(255,200,160,0.6) 60%, transparent 100%)',
              borderRadius: '2rem 2rem 0 0',
            }}
          />
          {/* Subtle warm glass tint blob */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-60px', right: '-60px',
              width: '160px', height: '160px',
              borderRadius: '50%',
              background: 'rgba(197,73,20,0.06)',
              filter: 'blur(30px)',
            }}
          />

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2" style={{ background: 'rgba(254,242,242,0.85)', border: '1px solid #fecaca' }}>
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[13px] font-bold text-[#3d2010] mb-1.5 ml-0.5 tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-[#e2d5cc] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all text-[#1a0a00] font-medium placeholder-[#a08070] text-[15px]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-bold text-[#3d2010] ml-0.5 tracking-wide">Password</label>
                <span
                  className="text-[12px] font-semibold cursor-pointer transition-colors"
                  style={{ color: '#c54914' }}
                  onMouseEnter={e => e.target.style.color = '#7a2200'}
                  onMouseLeave={e => e.target.style.color = '#c54914'}
                >
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-[#e2d5cc] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all text-[#1a0a00] font-medium placeholder-[#a08070] text-[15px]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-[15px] hover:-translate-y-0.5 active:translate-y-0 mt-1"
              style={{
                background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)',
                boxShadow: '0 8px 28px rgba(197,73,20,0.32)',
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-orange-200 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Below-card link */}
        <p className="relative z-10 mt-7 text-center text-[14px] font-medium" style={{ color: '#6b5c52' }}>
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-bold transition-colors"
            style={{ color: '#c54914' }}
            onMouseEnter={(e) => (e.target.style.color = '#7a2200')}
            onMouseLeave={(e) => (e.target.style.color = '#c54914')}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;