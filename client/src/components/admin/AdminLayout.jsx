import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const SidebarLink = ({ to, children, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? 'bg-accent-orange/20 text-white border border-accent-orange/30'
          : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent'
      }`
    }
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-space-950 text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-space-900/90 backdrop-blur-xl border-r border-white/10 z-[1300] hidden md:flex flex-col">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FloodSense" className="w-8 h-8 rounded-lg" />
            <div>
              <div className="text-lg font-black">FloodSense</div>
              <div className="text-xs text-white/60">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <SidebarLink to="/admin" icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 12h18M3 19h18"/></svg>
          }>Feed</SidebarLink>
          <SidebarLink to="/admin/reports" icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h13M9 7h13M4 6h.01M4 12h.01M4 18h.01"/></svg>
          }>Reports</SidebarLink>
          <SidebarLink to="/admin/fallbacks" icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v6h6v-6c0-1.657-1.343-3-3-3z"/></svg>
          }>Fallbacks</SidebarLink>
          <SidebarLink to="/admin/weekly" icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M7 10v6m5-10v10m5-6v6"/></svg>
          }>Weekly</SidebarLink>
          <SidebarLink to="/admin/users" icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V9h-5M2 20h5V4H2m7 16h6V12H9"/></svg>
          }>Users</SidebarLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-2">Signed in as</div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="text-sm truncate">{user?.name}</div>
          </div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Sign out</button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-[1300] ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer panel */}
        <aside className={`absolute inset-y-0 left-0 w-64 bg-space-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="FloodSense" className="w-8 h-8 rounded-lg" />
              <div>
                <div className="text-lg font-black">FloodSense</div>
                <div className="text-xs text-white/60">Admin Panel</div>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <SidebarLink to="/admin">Feed</SidebarLink>
            <SidebarLink to="/admin/reports">Reports</SidebarLink>
            <SidebarLink to="/admin/fallbacks">Fallbacks</SidebarLink>
            <SidebarLink to="/admin/weekly">Weekly</SidebarLink>
            <SidebarLink to="/admin/users">Users</SidebarLink>
          </nav>
          <div className="p-4 border-t border-white/10">
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Sign out</button>
          </div>
        </aside>
      </div>

      {/* Top bar (mobile) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[1200] bg-space-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-8 h-8 rounded-lg" />
            <div className="font-black">Admin</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <button onClick={handleLogout} className="text-sm text-red-400">Sign out</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="md:pl-64 pt-16 md:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
