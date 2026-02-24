import { useAuth } from '../../hooks/useAuth';
import { User, Mail, MapPin, Shield, Droplets, Clock, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_META = {
  superadmin: { label: 'Super Admin', color: '#ff5e1a', bg: 'rgba(255,94,26,0.15)'  },
  admin:       { label: 'Admin',       color: '#ff8c42', bg: 'rgba(255,140,66,0.15)' },
  user:        { label: 'Resident',    color: '#4ade80', bg: 'rgba(74,222,128,0.13)' },
};

const InfoRow = ({ icon: Icon, label, value, accent = false }) => (
  <div className="flex items-center gap-4 py-4 border-b border-white/[0.06] last:border-0">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: accent ? 'rgba(255,94,26,0.15)' : 'rgba(255,255,255,0.06)' }}
    >
      <Icon size={17} strokeWidth={1.75} style={{ color: accent ? '#ff7a3a' : 'rgba(255,255,255,0.45)' }} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </p>
      <p className="text-white font-medium text-sm truncate">{value || '—'}</p>
    </div>
  </div>
);

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleMeta = ROLE_META[user?.role] || ROLE_META.user;

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const lastLogin = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* ── Hero Card ── */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #c54914 0%, #7a2200 55%, #3a0e00 100%)',
            boxShadow: '0 20px 60px rgba(197,73,20,0.35)',
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '-30px',
            width: '130px', height: '130px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />
          {/* Watermark icon */}
          <div style={{
            position: 'absolute', top: '50%', right: '28px', transform: 'translateY(-50%)',
            opacity: 0.08, pointerEvents: 'none',
          }}>
            <Droplets size={96} strokeWidth={1} color="white" />
          </div>

          <div className="relative p-8 flex items-center gap-6">
            {/* Avatar */}
            <div
              className="shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl select-none"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            {/* Identity */}
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-white leading-tight">{user?.name || 'User'}</h1>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0"
                  style={{ background: roleMeta.bg, color: roleMeta.color, border: `1px solid ${roleMeta.color}50` }}
                >
                  {roleMeta.label}
                </span>
              </div>
              <p className="text-white/55 text-sm mt-1 truncate">{user?.email}</p>
              {user?.barangay && (
                <div className="flex items-center gap-1.5 mt-2.5">
                  <MapPin size={11} className="text-orange-200 shrink-0" strokeWidth={2.5} />
                  <span className="text-orange-200 text-xs font-semibold">{user.barangay}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Info Card ── */}
        <div
          className="rounded-3xl px-6 pt-5 pb-2"
          style={{
            background: 'rgba(14, 7, 2, 0.80)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          }}
        >
          <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'rgba(255,94,26,0.65)' }}>
            Account Details
          </p>
          <InfoRow icon={User}   label="Full Name"      value={user?.name}      accent />
          <InfoRow icon={Mail}   label="Email Address"  value={user?.email} />
          <InfoRow icon={MapPin} label="Barangay"       value={user?.barangay}  accent />
          <InfoRow icon={Shield} label="Account Role"   value={roleMeta.label} />
          <InfoRow icon={Clock}  label="Member Since"   value={joinedDate} />
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Last Login',     value: lastLogin,                                icon: Clock,  green: false },
            { label: 'Status',         value: user?.isActive ? 'Active' : 'Inactive',   icon: Shield, green: !!user?.isActive },
          ].map(({ label, value, icon: Icon, green }) => (
            <div
              key={label}
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{
                background: 'rgba(14,7,2,0.78)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: green ? 'rgba(74,222,128,0.12)' : 'rgba(255,94,26,0.12)' }}
              >
                <Icon size={17} strokeWidth={1.75} style={{ color: green ? '#4ade80' : '#ff7a3a' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {label}
                </p>
                <p className="text-sm font-semibold truncate" style={{ color: green ? '#4ade80' : 'rgba(255,255,255,0.82)' }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.98]"
          style={{
            background: 'rgba(200,35,35,0.10)',
            border: '1px solid rgba(200,35,35,0.20)',
            color: 'rgba(255,110,110,0.88)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,35,35,0.18)'; e.currentTarget.style.color = '#ff8080'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,35,35,0.10)'; e.currentTarget.style.color = 'rgba(255,110,110,0.88)'; }}
        >
          <LogOut size={16} strokeWidth={2} />
          Sign out of FloodSense
        </button>

      </div>
    </div>
  );
};

export default ProfilePage;