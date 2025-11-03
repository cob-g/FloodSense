import { Outlet, Link, useNavigate, useLocation, NavLink as RouterLink, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

// Custom NavLink component with active state styling
const NavLink = ({ to, children, className = '' }) => {
  return (
    <RouterLink
      to={to}
      className={({ isActive }) => 
        `px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
          isActive 
            ? 'bg-accent/20 text-accent' 
            : 'text-white/70 hover:text-white hover:bg-white/5'
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
    navigate('/auth/login');
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
    <div className="min-h-screen bg-space-950 bg-dot-pattern text-white overflow-x-hidden">
      {/* Glassmorphism Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[2000] bg-space-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="FloodSense Logo"
                className="w-9 h-9 rounded-lg object-contain shadow-md group-hover:shadow-lg transition-shadow"
              />
              <h1 className="text-xl font-black bg-gradient-to-r from-white to-light-orange bg-clip-text text-transparent">
                FloodSense
              </h1>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Connection Status (unified) */}
              <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    !online
                      ? 'bg-red-500'
                      : connected
                      ? 'bg-green-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-sm font-medium text-white/80">
                  {!online ? 'Offline' : connected ? 'Live' : 'Connecting...'}
                </span>
              </div>

              {user && (
                <div className="flex items-center space-x-2">
                  {/* Navigation - desktop */}
                  <nav className="hidden md:flex items-center space-x-1 bg-transparent">
                    <NavLink to="/">Feed</NavLink>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <>
                        <NavLink to="/admin/reports">Reports</NavLink>
                        <NavLink to="/admin/users">Users</NavLink>
                      </>
                    )}
                    {/* Map link removed */}
                  </nav>

                  {/* Hamburger - mobile */}
                  <button
                    className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 transition-colors"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* User Dropdown (hidden on mobile, visible on md+) */}
                  <div className="relative group hidden md:block">
                    <button className="flex items-center space-x-2 bg-transparent hover:bg-white/10 px-3 py-2 rounded-xl transition-all duration-300 group-hover:border-accent/30 group-hover:shadow-lg group-hover:shadow-accent-500/10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm hidden lg:inline-block text-white/90">
                        {user.name.split(' ')[0]}
                      </span>
                      <svg 
                        className="w-4 h-4 text-white/60 group-hover:text-accent transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-space-900/95 opacity-1 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 overflow-hidden">
                      <div className="p-1.5 ">
                        <div className="px-4 py-3 text-sm text-white/90">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-white/60 truncate">{user.email}</div>
                          {user.barangay && (
                            <div className="text-xs text-accent-400 mt-1 font-medium">
                              {user.barangay}
                            </div>
                          )}
                        </div>
                        {/* <div className="border-t border-white/5 my-1 ba"></div> */}
                        <div className="space-y-1">
                          <NavLink 
                            to="/profile" 
                            className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            My Profile
                          </NavLink>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-down nav */}
      {user && (
        <div className={`md:hidden fixed top-16 left-0 right-0 z-[1900] transition-all duration-300 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
          <div className="mx-4 rounded-2xl bg-space-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden origin-top animate-none" style={{ transformOrigin: 'top center' }}>
            {/* Accent bar for unique touch */}
            <div className="h-1 w-full bg-gradient-to-r from-accent-orange to-transparent"></div>

            {/* User section */}
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold shadow-md">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/95 font-semibold truncate">{user.name}</div>
                <div className="text-white/60 text-xs truncate">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Sign out
              </button>
            </div>

            <div className="border-t border-white/10"></div>

            {/* Nav links */}
            <nav className="py-1">
              <RouterLink to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/5">Feed</RouterLink>
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <>
                  <RouterLink to="/admin/reports" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/5">Reports</RouterLink>
                  <RouterLink to="/admin/users" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/90 hover:bg-white/5">Users</RouterLink>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-radial from-accent-500/5 to-transparent opacity-30"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-gradient-radial from-primary-500/5 to-transparent opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-orange/5 rounded-full blur-3xl animate-float"></div>
      </div>
    </div>
  );
};

export default Layout;
