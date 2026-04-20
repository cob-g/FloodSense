import { useEffect, useMemo, useState } from 'react';
import { useAdminUsers, useUpdateUserRole, useUpdateUserStatus } from '../../hooks/useAdminUsers';
import { USER_ROLES } from '../../utils/constants';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/helpers';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Joined (Newest First)' },
  { value: 'createdAt:asc', label: 'Joined (Oldest First)' },
  { value: 'lastLogin:desc', label: 'Last Login (Newest First)' },
  { value: 'lastLogin:asc', label: 'Last Login (Oldest First)' },
  { value: 'name:asc', label: 'Name (A-Z)' },
  { value: 'name:desc', label: 'Name (Z-A)' },
  { value: 'email:asc', label: 'Email (A-Z)' },
  { value: 'email:desc', label: 'Email (Z-A)' },
  { value: 'role:asc', label: 'Role (A-Z)' },
  { value: 'role:desc', label: 'Role (Z-A)' },
];

const formatDateTime = (value) => {
  if (!value) return 'Never';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return 'Never';
  return dt.toLocaleString();
};

const formatJoinedDate = (value) => {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString();
};

const formatLastLogin = (value) => {
  if (!value) return 'Never';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return 'Never';
  return formatRelativeTime(dt);
};

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
  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const query = useMemo(() => {
    const skip = currentPage * pageSize;
    return {
      q: q || undefined,
      limit: pageSize,
      skip,
      sortBy,
      sortOrder,
    };
  }, [q, pageSize, currentPage, sortBy, sortOrder]);

  const { data, isLoading, error, isFetching } = useAdminUsers(query);
  const updRole = useUpdateUserRole();
  const updStatus = useUpdateUserStatus();

  const payload = data?.data || data || {};
  const users = useMemo(() => payload.users || [], [payload]);
  const pagination = payload.pagination || {
    total: 0,
    limit: pageSize,
    skip: currentPage * pageSize,
    hasMore: false,
  };
  const counts = payload.counts || {};
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || pageSize)));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setQ(searchInput.trim());
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(0);
  }, [q, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    if (!isLoading && currentPage > 0 && users.length === 0) {
      setCurrentPage(0);
    }
  }, [isLoading, currentPage, users.length]);

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

  const selectedSort = `${sortBy}:${sortOrder}`;

  const resetFilters = () => {
    setSearchInput('');
    setQ('');
    setPageSize(25);
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(0);
  };

  const showingFrom = pagination.total > 0 ? pagination.skip + 1 : 0;
  const showingTo = pagination.total > 0 ? Math.min(pagination.skip + users.length, pagination.total) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Accounts</h1>
          <p className="text-white/60">Manage access with scalable paging, sorting, and role controls.</p>
        </div>
        {isFetching && !isLoading && <div className="text-xs text-white/60">Refreshing...</div>}
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/50"
          />

          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                {size} rows per page
              </option>
            ))}
          </select>

          <select
            value={selectedSort}
            onChange={(e) => {
              const [field, order] = e.target.value.split(':');
              setSortBy(field || 'createdAt');
              setSortOrder(order === 'asc' ? 'asc' : 'desc');
            }}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 text-sm font-semibold hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      </div>

      {!isLoading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">Total Accounts</div><div className="text-3xl font-black text-white">{counts.total ?? '—'}</div></div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">Active</div><div className="text-3xl font-black text-white">{counts.active ?? '—'}</div></div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">Deactivated</div><div className="text-3xl font-black text-white">{counts.deactivated ?? '—'}</div></div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">Admins</div><div className="text-3xl font-black text-white">{counts.admins ?? '—'}</div></div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10"><div className="text-xs text-white/60 mb-1">New Last 7 Days</div><div className="text-3xl font-black text-white">{counts.newLast7Days ?? '—'}</div></div>
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
          {isLoading && <div className="px-4 py-6 text-white/70">Loading...</div>}
          {error && <div className="px-4 py-6 text-red-400">Failed to load accounts</div>}
          {!isLoading && !error && users.length === 0 && (
            <div className="px-4 py-6 text-white/70">No accounts found for the current filters.</div>
          )}
          {!isLoading && !error && users.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                  {u.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">{u.name}</div>
                  <div className="text-white/60 text-sm truncate">{u.email}</div>
                  <div className="text-xs text-white/50">Joined: {formatJoinedDate(u.createdAt)}</div>
                  <div className="text-xs text-white/50" title={formatDateTime(u.lastLogin)}>
                    Last login: {formatLastLogin(u.lastLogin)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={u.role} />
                <StatusBadge active={u.isActive} />
              </div>
              <div className="flex items-center gap-2">
                {currentUser?.role === 'superadmin' && (
                  <select value={u.role} onChange={(e)=>changeRole(u.id, e.target.value)} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
                    <option value={USER_ROLES.USER} style={{ color: '#111827', backgroundColor: '#ffffff' }}>{USER_ROLES.USER}</option>
                    <option value={USER_ROLES.ADMIN} style={{ color: '#111827', backgroundColor: '#ffffff' }}>{USER_ROLES.ADMIN}</option>
                    <option value={USER_ROLES.SUPERADMIN} style={{ color: '#111827', backgroundColor: '#ffffff' }}>{USER_ROLES.SUPERADMIN}</option>
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

        {!isLoading && !error && users.length > 0 && (
          <div className="px-4 py-4 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-white/60">
              Showing {showingFrom}-{showingTo} of {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Page {currentPage + 1} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasMore}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
