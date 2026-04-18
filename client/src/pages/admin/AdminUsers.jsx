import { useMemo, useState } from 'react';
import { useAdminUsers, useUpdateUserRole, useUpdateUserStatus } from '../../hooks/useAdminUsers';
import { USER_ROLES } from '../../utils/constants';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';

const RoleBadge = ({ role }) => {
  const c = role === 'superadmin' ? 'text-purple-300 border-purple-400/40 bg-purple-400/10' : role === 'admin' ? 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10' : 'text-white/70 border-white/20 bg-white/5';
  return <span className={`text-xs px-2 py-1 rounded-lg border ${c}`}>{role}</span>;
};

const StatusBadge = ({ active }) => (
  <span className={`text-xs px-2 py-1 rounded-lg border ${active ? 'text-green-300 border-green-400/40 bg-green-400/10' : 'text-red-300 border-red-400/40 bg-red-400/10'}`}>{active ? 'Active' : 'Deactivated'}</span>
);

function TinyRoleChart({ counts = { user: 0, admin: 0, superadmin: 0 }, height = 120 }) {
  const data = [
    { label: 'Account', value: counts.user || 0, color: '#60a5fa' },
    { label: 'Admin', value: counts.admin || 0, color: '#22c55e' },
    { label: 'Super', value: counts.superadmin || 0, color: '#a78bfa' },
  ];
  const w = 340, h = height, pad = { l: 90, r: 12, t: 8, b: 24 };
  const innerW = w - pad.l - pad.r;     const innerH = h - pad.t - pad.b;
  const maxV = Math.max(1, ...data.map(d => d.value));
  const barH = innerH / data.length;
  return (
    <div className="w-full overflow-x-auto">
      <svg width={w} height={h} className="max-w-full">
        <g>
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#ffffff22" />
          <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="#ffffff22" />
          {data.map((d, i) => {
            const y = pad.t + i * barH + barH * 0.15; const bh = barH * 0.7; const bw = innerW * (d.value / maxV);
            return (
              <g key={i}>
                <text x={pad.l - 10} y={y + bh / 2} fill="#94a3b8" fontSize="10" textAnchor="end" dominantBaseline="middle">{d.label}</text>
                <rect x={pad.l} y={y} width={bw} height={bh} fill={d.color} opacity="0.9" />
                <text x={pad.l + bw + 6} y={y + bh / 2} fill="#cbd5e1" fontSize="10" dominantBaseline="middle">{d.value}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export const AdminUsers = () => {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [q, setQ] = useState('');
  const { data, isLoading, error } = useAdminUsers({ q });
  const updRole = useUpdateUserRole();
  const updStatus = useUpdateUserStatus();

  const payload = data?.data || data || {};
  const users = useMemo(() => payload.users || [], [payload]);
  const counts = payload.counts || {};

  const changeRole = async (id, role) => {
    try {
      await updRole.mutateAsync({ id, role });
      toast.success('Role updated');
    } catch (e) { toast.error(e?.message || 'Failed to update role'); }
  };
  const toggleActive = async (id, isActive) => {
    try {
      await updStatus.mutateAsync({ id, isActive });
      toast.success(isActive ? 'Account activated' : 'Account deactivated');
    } catch (e) { toast.error(e?.message || 'Failed to update status'); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Accounts</h1>
          <p className="text-white/60">Manage access with a simple, focused overview</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name/email" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/50"/>
        </div>
      </div>

      {!isLoading && !error && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">Total Accounts</div><div className="text-3xl font-black text-white">{counts.total ?? '—'}</div></div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">Active</div><div className="text-3xl font-black text-white">{counts.active ?? '—'}</div></div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">Admins</div><div className="text-3xl font-black text-white">{counts.admins ?? '—'}</div></div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80">Role Distribution</div>
          </div>
          <TinyRoleChart counts={counts?.byRole || {}} height={130} />
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/10">
          {isLoading && <div className="px-4 py-6 text-white/70">Loading…</div>}
          {error && <div className="px-4 py-6 text-red-400">Failed to load accounts</div>}
          {!isLoading && !error && users.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                  {u.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">{u.name}</div>
                  <div className="text-white/60 text-sm truncate">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={u.role} />
                <StatusBadge active={u.isActive} />
              </div>
              <div className="flex items-center gap-2">
                {currentUser?.role === 'superadmin' && (
                  <select value={u.role} onChange={(e)=>changeRole(u.id, e.target.value)} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
                    <option value={USER_ROLES.USER}>{USER_ROLES.USER}</option>
                    <option value={USER_ROLES.ADMIN}>{USER_ROLES.ADMIN}</option>
                    <option value={USER_ROLES.SUPERADMIN}>{USER_ROLES.SUPERADMIN}</option>
                  </select>
                )}
                <button
                  title={u.isActive ? 'Deactivate' : 'Activate'}
                  onClick={()=>toggleActive(u.id, !u.isActive)}
                  disabled={!(currentUser?.role === 'superadmin' || (currentUser?.role === 'admin' && u.role === 'user'))}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${u.isActive ? 'hover:bg-red-500/10' : 'hover:bg-green-500/10'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {u.isActive ? (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6"/></svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6"/></svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
