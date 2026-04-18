import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Droplets } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('auth.forgotPassword.required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email.trim())) {
      setError(t('auth.forgotPassword.invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email.trim());
      if (response?.success) {
        setSubmitted(true);
      } else {
        setError(response?.message || t('auth.forgotPassword.error'));
      }
    } catch (err) {
      setError(err.message || t('auth.forgotPassword.error'));
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
            {t('auth.forgotPassword.title')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '390px', lineHeight: 1.7 }}>
            {t('auth.forgotPassword.subtitle')}
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

          {submitted ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border flex gap-2.5" style={{ background: 'rgba(236,253,245,0.8)', borderColor: '#bbf7d0' }}>
                <CheckCircle2 size={17} className="mt-0.5 text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-700 mb-1">{t('auth.forgotPassword.successTitle')}</p>
                  <p className="text-sm text-green-700">{t('auth.forgotPassword.successMessage')}</p>
                </div>
              </div>

              <Link
                to="/auth/login"
                className="w-full inline-flex items-center justify-center text-white font-bold py-3.5 rounded-2xl transition-all duration-300 text-[15px] hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)',
                  boxShadow: '0 8px 24px rgba(197,73,20,0.25)',
                }}
              >
                {t('auth.forgotPassword.backToLogin')}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError('');
                }}
                className="w-full text-[14px] font-semibold py-3 rounded-2xl transition-colors"
                style={{ color: '#7a2200', background: '#fff7f2', border: '1px solid #f3d2c3' }}
              >
                {t('auth.forgotPassword.tryAgain')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[#3d2010] mb-1.5 ml-0.5 tracking-wide">
                  {t('auth.forgotPassword.emailLabel')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-[#e2d5cc] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all text-[#1a0a00] font-medium placeholder-[#a08070] text-[15px]"
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                />
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
                    {t('auth.forgotPassword.sending')}
                  </div>
                ) : t('auth.forgotPassword.submitButton')}
              </button>
            </form>
          )}
        </div>

        {!submitted && (
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
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
