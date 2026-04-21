import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Droplets, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token')?.trim() || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('auth.resetPassword.missingToken'));
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(t('auth.resetPassword.passwordMin'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, formData.newPassword);
      if (response?.success) {
        navigate('/auth/login', {
          replace: true,
          state: { message: t('auth.resetPassword.success') },
        });
      } else {
        setError(response?.message || t('auth.resetPassword.invalidToken'));
      }
    } catch (err) {
      setError(err.message || t('auth.resetPassword.invalidToken'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div
        className="relative flex-none overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #c54914 0%, #7a2200 55%, #3a0e00 100%)',
          minHeight: '48vh',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1.8px)', backgroundSize: '18px 18px' }}
        />
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', opacity: 0.07, pointerEvents: 'none' }}>
          <Droplets size={260} strokeWidth={0.6} color="white" />
        </div>

        <div className="relative z-10 flex items-center gap-2 px-7 pt-7">
          <img src="/logo.png" alt="FloodSense" width={56} height={56} className="w-14 h-14 drop-shadow-md" />
          <span className="text-[1.5rem] font-black text-white tracking-tight" style={{ fontFamily: 'Goodly, sans-serif' }}>
            FloodSense
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 pt-12 pb-16">
          <h2
            className="text-white font-black leading-[1.1] mb-4"
            style={{ fontSize: 'clamp(2.1rem, 5vw, 3.2rem)', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
          >
            {t('auth.resetPassword.title')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '390px', lineHeight: 1.7 }}>
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ lineHeight: 0 }}
        >
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '72px' }}>
            <path d="M0,72 C360,0 1080,0 1440,72 L1440,72 L0,72 Z" fill="#fdf8f4" />
          </svg>
        </div>
      </div>

      <div
        className="flex-1 bg-dot-pattern relative flex flex-col items-center px-4 pb-12"
        style={{ backgroundColor: '#fdf8f4' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 10% 30%, rgba(197,73,20,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 90% 80%, rgba(255,94,26,0.05) 0%, transparent 60%)',
          }}
        />

        <div
          className="relative z-10 w-full max-w-[420px] rounded-[2rem] px-8 py-9 overflow-hidden"
          style={{
            marginTop: '-40px',
            background: 'rgba(255, 255, 255, 0.62)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.82)',
            boxShadow:
              '0 24px 56px rgba(197,73,20,0.13), 0 4px 16px rgba(197,73,20,0.07), inset 0 1.5px 0 rgba(255,255,255,0.95)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 30%, rgba(255,200,160,0.6) 60%, transparent 100%)',
              borderRadius: '2rem 2rem 0 0',
            }}
          />

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2" style={{ background: 'rgba(254,242,242,0.85)', border: '1px solid #fecaca' }}>
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          {!token ? (
            <div className="space-y-4">
              <p className="text-sm text-[#6b5c52] leading-relaxed">{t('auth.resetPassword.missingToken')}</p>
              <Link
                to="/auth/forgot-password"
                className="w-full inline-flex items-center justify-center text-white font-bold py-3.5 rounded-2xl transition-all duration-300 text-[15px] hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)',
                  boxShadow: '0 8px 24px rgba(197,73,20,0.25)',
                }}
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[#3d2010] mb-1.5 ml-0.5 tracking-wide">
                  {t('auth.resetPassword.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3.5 pr-12 bg-white border border-[#e2d5cc] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all text-[#1a0a00] font-medium placeholder-[#a08070] text-[15px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((visible) => !visible)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showNewPassword}
                    className="absolute inset-y-0 right-0 px-4 flex items-center justify-center text-[#a08070] hover:text-[#7a2200] focus:outline-none focus-visible:text-[#7a2200]"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#3d2010] mb-1.5 ml-0.5 tracking-wide">
                  {t('auth.resetPassword.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3.5 pr-12 bg-white border border-[#e2d5cc] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all text-[#1a0a00] font-medium placeholder-[#a08070] text-[15px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    aria-pressed={showConfirmPassword}
                    className="absolute inset-y-0 right-0 px-4 flex items-center justify-center text-[#a08070] hover:text-[#7a2200] focus:outline-none focus-visible:text-[#7a2200]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-[15px] hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)',
                  boxShadow: '0 8px 24px rgba(197,73,20,0.25)',
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-orange-200 border-t-white rounded-full animate-spin" />
                    {t('auth.resetPassword.resetting')}
                  </div>
                ) : t('auth.resetPassword.submitButton')}
              </button>
            </form>
          )}
        </div>

        <p className="relative z-10 mt-7 text-center text-[14px] font-medium" style={{ color: '#6b5c52' }}>
          <Link
            to="/auth/login"
            className="font-bold transition-colors"
            style={{ color: '#c54914' }}
            onMouseEnter={(e) => (e.target.style.color = '#7a2200')}
            onMouseLeave={(e) => (e.target.style.color = '#c54914')}
          >
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
