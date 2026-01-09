import { Outlet, Link, useNavigate, useLocation, NavLink as RouterLink, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import Footer from './Footer';

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
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

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

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
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
      <header className="fixed top-0 left-0 right-0 z-[2000] bg-[#c54914]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-1">
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
                <NavLink to="/">Home</NavLink>
                <NavLink to="/feed">Feed</NavLink>
                <NavLink to="/learn">Learn</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>
              </div>
            </nav>

            <div className="flex items-center gap-4">
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

                  {/* Enhanced User Dropdown */}
                  <div className="relative group hidden md:block">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm hidden lg:inline-block text-white/90">
                        {user.name.split(' ')[0]}
                      </span>
                      <svg 
                        className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-300 group-hover:rotate-180" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-space-900/98 backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden border border-white/10 shadow-2xl">
                      <div className="p-2">
                        <div className="px-4 py-3 text-sm text-white/90 border-b border-white/10">
                          <div className="font-semibold truncate">{user.name}</div>
                          <div className="text-xs text-white/60 truncate mt-1">{user.email}</div>
                          {user.barangay && (
                            <div className="text-xs text-accent-400 mt-2 font-medium bg-accent-500/10 px-2 py-1 rounded-full inline-block">
                              {user.barangay}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 mt-2">
                          <Link 
                            to="/profile" 
                            className="block w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 rounded-xl transition-all duration-200 hover:text-white"
                          >
                            My Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:text-red-300"
                          >
                            Sign out
                          </button>
                        </div>
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
                      Sign Up
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
                Sign out
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 flex justify-center border-b border-white/10">
              <Link
                to="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg transition-all duration-200 active:scale-95 w-full"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Nav links */}
          <nav className="py-2">
            <RouterLink to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">Home</RouterLink>
            <RouterLink to="/feed" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">Feed</RouterLink>
            <RouterLink to="/learn" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">Learn</RouterLink>
            <RouterLink to="/about" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">About</RouterLink>
            <RouterLink to="/contact" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">Contact Us</RouterLink>

            {user && (user.role === 'admin' || user.role === 'superadmin') && (
              <>
                <div className="my-2 border-t border-white/10"></div>
                <RouterLink to="/admin/reports" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">Reports</RouterLink>
                <RouterLink to="/admin/users" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium">Users</RouterLink>
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
