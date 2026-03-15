import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FileText, 
  Activity, 
  MapPin, 
  Radio, 
  BarChart2, 
  Users,
  LogOut,
  X,
  Menu
} from 'lucide-react';

const SidebarLink = ({ to, children, icon: Icon, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-[#c54914]/20 to-transparent text-[#e87a4d] border-l-[3px] border-[#c54914] shadow-[inset_4px_0_0_0_#c54914]'
          : 'text-white/60 hover:text-white hover:bg-white/5 hover:translate-x-1 border-l-[3px] border-transparent'
      }`
    }
  >
    <Icon className="w-[1.125rem] h-[1.125rem]" />
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
    <div className="min-h-screen bg-[#110d0a] text-white selection:bg-[#c54914]/30 selection:text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#1a1410]/95 backdrop-blur-xl border-r border-white/5 z-[1300] hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div 
          className="px-5 py-6 border-b border-white/10 relative overflow-hidden" 
          style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}
        >
          {/* Subtle blobs for identity */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          
          <div className="flex items-center gap-3 relative z-10">
            <img src="/logo.png" alt="FloodSense" className="w-10 h-10 drop-shadow-md" />
            <div>
              <div className="text-[1.35rem] font-black tracking-tight leading-none" style={{ fontFamily: 'Goodly, sans-serif' }}>FloodSense</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/80 mt-1">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <SidebarLink to="/admin/reports" icon={FileText}>Reports</SidebarLink>
          <SidebarLink to="/admin" end icon={Activity}>Feed</SidebarLink>
          <SidebarLink to="/admin/fallbacks" icon={MapPin}>Fallbacks</SidebarLink>
          <SidebarLink to="/admin/sensors" icon={Radio}>Sensors</SidebarLink>
          <SidebarLink to="/admin/weekly" icon={BarChart2}>Weekly</SidebarLink>
          <SidebarLink to="/admin/users" icon={Users}>Users</SidebarLink>
        </nav>

        <div className="p-5 border-t border-white/5 bg-[#140e0b]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-3 ml-1">Account</div>
          <div className="flex items-center gap-3 mb-4 bg-white/5 p-2 5 rounded-xl border border-white/5 shadow-inner">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md border border-white/10" style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-white/90 leading-tight">{user?.name}</div>
              <div className="text-[11px] text-[#c54914] font-medium truncate capitalize mt-0.5">{user?.role || 'Admin'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 group shadow-sm">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign out
          </button>
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
        <aside className={`absolute inset-y-0 left-0 w-72 bg-[#1a1410] flex flex-col shadow-[24px_0_48px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div 
            className="px-5 py-6 border-b border-white/10 flex items-center justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}
          >
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex items-center gap-3 relative z-10">
              <img src="/logo.png" alt="FloodSense" className="w-10 h-10 drop-shadow-md" />
              <div>
                <div className="text-[1.35rem] font-black tracking-tight leading-none" style={{ fontFamily: 'Goodly, sans-serif' }}>FloodSense</div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/80 mt-1">Admin Panel</div>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="w-9 h-9 relative z-10 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1.5 flex-1">
            <SidebarLink to="/admin/reports" icon={FileText}>Reports</SidebarLink>
            <SidebarLink to="/admin" end icon={Activity}>Feed</SidebarLink>
            <SidebarLink to="/admin/fallbacks" icon={MapPin}>Fallbacks</SidebarLink>
            <SidebarLink to="/admin/sensors" icon={Radio}>Sensors</SidebarLink>
            <SidebarLink to="/admin/weekly" icon={BarChart2}>Weekly</SidebarLink>
            <SidebarLink to="/admin/users" icon={Users}>Users</SidebarLink>
          </nav>
          <div className="p-5 border-t border-white/5 bg-[#140e0b] mt-auto">
            <div className="flex items-center gap-3 mb-4 bg-white/5 p-2.5 rounded-xl border border-white/5 shadow-inner">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md border border-white/10" style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-white/90 leading-tight">{user?.name}</div>
                <div className="text-[11px] text-[#c54914] font-medium truncate capitalize mt-0.5">{user?.role || 'Admin'}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 group shadow-sm">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Sign out
            </button>
          </div>
        </aside>
      </div>

      {/* Top bar (mobile) */}
      <header 
        className="md:hidden fixed top-0 left-0 right-0 z-[1200] border-b border-white/10 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}
      >
        <div className="h-16 px-4 flex items-center justify-between relative overflow-hidden">
          <div style={{ position: 'absolute', top: '-20px', left: '50%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div className="flex items-center gap-3 relative z-10">
            <img src="/logo.png" className="w-9 h-9 drop-shadow-md" />
            <div className="font-black text-lg tracking-tight" style={{ fontFamily: 'Goodly, sans-serif' }}>Admin</div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
              <Menu className="w-5 h-5" />
            </button>
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
