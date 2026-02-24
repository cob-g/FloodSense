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
      className="min-h-screen bg-dot-pattern flex items-center justify-center px-4 py-10 relative"
      style={{ backgroundColor: '#fdf8f4' }}
    >
      {/* Soft radial gradient overlay to add warmth over the dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 15% 20%, rgba(197,73,20,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 90% 85%, rgba(255,94,26,0.07) 0%, transparent 60%)',
        }}
      />

      {/* ── Unified Card ── */}
      <div
        className="relative z-10 w-full max-w-[520px] rounded-[2.5rem] overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(197,73,20,0.18), 0 0 0 1px rgba(197,73,20,0.12)' }}
      >

        {/* ── Top: Orange Brand Cap ── */}
        <div
          className="relative px-10 pt-12 pb-10 overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #c54914 0%, #7a2200 50%, #3a0e00 100%)' }}
        >
          {/* Dot overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.11) 1px, transparent 1.8px)', backgroundSize: '18px 18px' }} />
          {/* Blobs */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          {/* Watermark */}
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.07, pointerEvents: 'none' }}>
            <Droplets size={160} strokeWidth={0.7} color="white" />
          </div>

          {/* Logo + Brand — frosted pill badge */}
          <div className="relative z-10 flex flex-col items-center text-center pt-2 pb-2">

            {/* Frosted glass badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.20)',
              borderRadius: '100px',
              padding: '8px 20px 8px 8px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
              marginBottom: '22px',
            }}>
              {/* Logo with warm glow circle */}
              <div style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px 4px rgba(255,120,40,0.30)',
                flexShrink: 0,
              }}>
                <img
                  src="/logo.png"
                  alt="FloodSense"
                  style={{ width: '26px', height: '26px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.40))' }}
                />
              </div>

              {/* Brand wordmark — split colour */}
              <span style={{ fontFamily: 'Goodly, sans-serif', fontSize: '20px', fontWeight: 900, lineHeight: 1, letterSpacing: '0.01em' }}>
                <span style={{ color: '#ffffff', textShadow: '0 1px 6px rgba(0,0,0,0.30)' }}>Flood</span>
                <span style={{ color: '#ffd0a0', textShadow: '0 1px 6px rgba(0,0,0,0.20)' }}>Sense</span>
              </span>
            </div>

            {/* Thin divider */}
            <div style={{ width: '36px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.22)', marginBottom: '16px' }} />

            {/* Headline */}
            <h1 className="text-white font-black leading-tight" style={{ fontSize: '28px', marginBottom: '8px', textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>Welcome back.</h1>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '13px', lineHeight: '1.6' }}>Sign in to your flood monitoring dashboard.</p>
          </div>
        </div>

        {/* ── Bottom: Form ── */}
        <div className="px-10 pt-8 pb-10" style={{ backgroundColor: '#fafaf9' }}>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-[#3d2010] mb-1.5 tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl text-[#1a0a00] text-[15px] font-medium focus:outline-none transition-all"
                style={{ background: '#fff', border: '1.5px solid #e2d5cc', caretColor: '#c54914' }}
                onFocus={e => { e.target.style.borderColor = '#c54914'; e.target.style.boxShadow = '0 0 0 3px rgba(197,73,20,0.10)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2d5cc'; e.target.style.boxShadow = 'none'; }}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-bold text-[#3d2010] tracking-wide">Password</label>
                <span className="text-[12px] text-[#c54914] hover:text-[#7a2200] cursor-pointer font-semibold transition-colors">Forgot Password?</span>
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl text-[#1a0a00] text-[15px] font-medium focus:outline-none transition-all"
                style={{ background: '#fff', border: '1.5px solid #e2d5cc', caretColor: '#c54914' }}
                onFocus={e => { e.target.style.borderColor = '#c54914'; e.target.style.boxShadow = '0 0 0 3px rgba(197,73,20,0.10)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2d5cc'; e.target.style.boxShadow = 'none'; }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-[15px] text-white hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)',
                boxShadow: '0 6px 20px rgba(197,73,20,0.35)',
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: '#e2d5cc' }} />
            <span className="text-[#a08070] text-xs font-semibold">or</span>
            <div className="flex-1 h-px" style={{ background: '#e2d5cc' }} />
          </div>

          <p className="text-center text-[14px] font-medium" style={{ color: '#6b5c52' }}>
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-bold transition-colors" style={{ color: '#c54914' }}
              onMouseEnter={e => e.target.style.color = '#7a2200'}
              onMouseLeave={e => e.target.style.color = '#c54914'}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;