import { Outlet, Link, useNavigate, useLocation, NavLink as RouterLink, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../contexts/ToastContext';
import { Droplets } from 'lucide-react';
import Footer from './Footer';
import ChatBubble from '../chatbot/ChatBubble';
import LanguageSwitcher from './LanguageSwitcher';

// Custom NavLink component with active state styling
const NavLink = ({ to, children, className = '' }) => {
  return (
    <RouterLink
      to={to}
      className={({ isActive }) => 
        `relative px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25 scale-105' 
            : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-102'
        } ${className}`.trim()
      }
    >
      {children}
    </RouterLink>
  );
};

export const Layout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { warning, info } = useToast();
  const isFirstOnlineEffect = useRef(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (isFirstOnlineEffect.current) {
      isFirstOnlineEffect.current = false;
      return;
    }
    if (online) {
      info('You are back online');
    } else {
      warning('You are now offline');
    }
  }, [online]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Don't show navbar on auth pages
  if (location.pathname.startsWith('/auth')) {
    return <Outlet />;
  }

  // If admin/superadmin is on non-admin routes, redirect to admin area
  if (user && (user.role === 'admin' || user.role === 'superadmin') && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-white overflow-x-hidden">
      {/* Enhanced Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[2000] border-b border-white/10 shadow-2xl">
        
        {/* Background container with overflow-hidden to clip blobs/watermark */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #c54914 0%, #7a2200 55%, #3a0e00 100%)',
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '-30px',
            width: '130px', height: '130px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />
          {/* Watermark icon */}
          <div style={{
            position: 'absolute', top: '50%', right: '28px', transform: 'translateY(-50%)',
            opacity: 0.08,
          }}>
            <Droplets size={96} strokeWidth={1} color="white" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-1">
          <div className="flex items-center justify-between h-[4.5rem]">
            {/* Logo with animation */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="FloodSense Logo"
                  className="w-16 h-16 "
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h1 className="text-2xl font-semibold [font-family:Goodly] text-gray-100 group-hover:text-white transition-colors duration-300">
                FloodSense
              </h1>
            </Link>

            {/* Centered Navigation Pills */}
            <nav className="hidden lg:flex flex-1 justify-center items-center">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-2 py-2 rounded-full border border-white/10 shadow-inner">
                <NavLink to="/">{t('nav.home')}</NavLink>
                <NavLink to="/feed">{t('nav.feed')}</NavLink>
                <NavLink to="/learn">{t('nav.learn')}</NavLink>
                <NavLink to="/about">{t('nav.about')}</NavLink>
                <NavLink to="/contact">{t('nav.contact')}</NavLink>
              </div>
            </nav>

            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <LanguageSwitcher />
              {/* Refined Connection Status */}
              <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full border border-white/10 shadow-inner">
                <div className="relative">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      !online
                        ? 'bg-red-500'
                        : user
                          ? (connected ? 'bg-green-500' : 'bg-amber-500')
                          : 'bg-green-500'
                    }`}
                  />
                  <div
                    className={`absolute inset-0 rounded-full animate-ping ${
                      !online
                        ? 'bg-red-500'
                        : user
                          ? (connected ? 'bg-green-500' : 'bg-amber-500')
                          : 'bg-green-500'
                    }`}
                    style={{ animationDuration: '2s' }}
                  />
                </div>
                <span className="text-xs font-medium text-white/80">
                  {!online ? 'Offline' : user ? (connected ? 'Live' : 'Connecting') : 'Online'}
                </span>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  {/* Mobile menu button */}
                  <button
                    className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 transition-all duration-300 active:scale-95"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  <div className="relative group hidden md:block">
                    {/* Trigger button */}
                    <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full transition-all duration-200 hover:bg-white/10 active:scale-95 border border-transparent hover:border-white/10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm hidden lg:inline-block text-white/90">
                        {user.name.split(' ')[0]}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-transform duration-300 group-hover:rotate-180"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown panel — split card design */}
                    <div className="absolute right-0 mt-2.5 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 rounded-2xl overflow-hidden"
                      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)' }}
                    >
                      {/* ── TOP: profile card with brand gradient ── */}
                      <div style={{
                        background: 'linear-gradient(135deg, #b84010 0%, #7a2200 100%)',
                        padding: '20px 20px 18px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {/* Decorative circle blobs */}
                        <div style={{
                          position: 'absolute', top: '-24px', right: '-24px',
                          width: '90px', height: '90px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.07)',
                        }} />
                        <div style={{
                          position: 'absolute', bottom: '-16px', left: '-16px',
                          width: '60px', height: '60px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.05)',
                        }} />

                        <div className="relative flex items-center gap-3.5">
                          {/* Big avatar */}
                          <div style={{
                            width: '46px', height: '46px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.18)',
                            border: '2px solid rgba(255,255,255,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: '800', color: '#fff',
                            flexShrink: 0,
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }} className="truncate">
                              {user.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', marginTop: '2px' }} className="truncate">
                              {user.email}
                            </div>
                            {user.barangay && (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                marginTop: '7px', padding: '2px 9px',
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: '99px', fontSize: '11px',
                                color: 'rgba(255,255,255,0.9)', fontWeight: 600,
                              }}>
                                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                                </svg>
                                {user.barangay}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── BOTTOM: clean white menu ── */}
                      <div style={{ background: '#ffffff' }}>
                        {/* My Profile */}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium transition-all duration-150"
                          style={{ color: '#2a2a2a', borderBottom: '1px solid #f0f0f0' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fff5f0'; e.currentTarget.style.color = '#c54914'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2a2a2a'; }}
                        >
                          <svg className="w-4 h-4 shrink-0" style={{ color: '#c54914' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{t('nav.profile')}</span>
                        </Link>

                        {/* Sign out */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium transition-all duration-150"
                          style={{ color: '#cc3333' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Mobile menu button for guests */}
                  <button
                    className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 transition-all duration-300 active:scale-95"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  <div className="hidden lg:flex items-center gap-2">
                    <Link
                      to="/auth/register"
                      className="px-6 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white shadow-lg shadow-accent-500/25 transition-all duration-300 tracking-wide hover:scale-105 active:scale-95"
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed top-[4.5rem] left-0 right-0 z-[1900] transition-all duration-300 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
        <div className="mx-4 rounded-2xl bg-space-900/98 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500"></div>

          {/* User section or Auth buttons */}
          {user ? (
            <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold shadow-md">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/95 font-semibold truncate">{user.name}</div>
                <div className="text-white/60 text-xs truncate">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200 active:scale-95"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 flex justify-center border-b border-white/10">
              <Link
                to="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg transition-all duration-200 active:scale-95 w-full"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Nav links */}
          <nav className="py-2">
            <RouterLink to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">{t('nav.home')}</RouterLink>
            <RouterLink to="/feed" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">{t('nav.feed')}</RouterLink>
            <RouterLink to="/learn" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">{t('nav.learn')}</RouterLink>
            <RouterLink to="/about" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">{t('nav.about')}</RouterLink>
            <RouterLink to="/contact" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">{t('nav.contact')}</RouterLink>

            {user && (user.role === 'admin' || user.role === 'superadmin') && (
              <>
                <div className="my-2 border-t border-white/10"></div>
                <RouterLink to="/admin/reports" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">{t('admin.reports')}</RouterLink>
                <RouterLink to="/admin/users" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">{t('admin.users')}</RouterLink>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-0 lg:pb-0 w-full bg-dot-pattern">
        <Outlet />
      </main>

      <Footer />

      {/* AI Chatbot */}
      <ChatBubble />

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-radial from-accent-500/5 to-transparent opacity-30"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-gradient-radial from-primary-500/5 to-transparent opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-orange/5 rounded-full blur-3xl animate-float"></div>
      </div>
    </div>
  );
};

export default Layout;
