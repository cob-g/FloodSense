import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';
import AdminReportsTable from '../../components/admin/AdminReportsTable';

export const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('UNVERIFIED'); // UNVERIFIED, VALIDATED, REJECTED, all
  const [reportScope, setReportScope] = useState('all-time'); // all-time, weekly
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const scopeFilters = reportScope === 'weekly' ? { scope: 'weekly' } : {};

  const { data: allData } = useReports({ limit: 1000, ...scopeFilters }); // For scoped stats
  const { data, isLoading: reportsLoading } = useReports({
    status: filter === 'all' ? undefined : filter,
    limit: pageSize,
    skip: currentPage * pageSize,
    ...scopeFilters,
  });

  const reports = data?.data?.reports || [];
  const pagination = data?.data?.pagination || {
    total: 0,
    limit: pageSize,
    skip: currentPage * pageSize,
    hasMore: false,
  };
  const scopeLabel = reportScope === 'weekly' ? 'This Week' : 'All Time';

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    setCurrentPage(0);
  };

  const handleScopeChange = (nextScope) => {
    setReportScope(nextScope);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize);
    setCurrentPage(0);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const allReports = allData?.data?.reports || [];
    const pending = allReports.filter(r => r.status === 'UNVERIFIED').length;
    const rejected = allReports.filter(r => r.status === 'REJECTED').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validatedToday = allReports.filter(r =>
      r.status === 'VALIDATED' && new Date(r.updatedAt || r.validatedAt || r.createdAt) >= today
    ).length;

    const total = allReports.length;

    return { pending, rejected, validatedToday, total };
  }, [allData]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate]);

  // If page becomes empty after data updates, recover to first page.
  useEffect(() => {
    if (!reportsLoading && currentPage > 0 && reports.length === 0) {
      setCurrentPage(0);
    }
  }, [reportsLoading, currentPage, reports.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect from useEffect
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2" style={{ fontFamily: 'Goodly, sans-serif' }}>
          Admin Dashboard
        </h1>
        <p className="text-white/60">
          Welcome back, {user.name}! Manage and validate flood reports.
        </p>
      </div>

      {/* Scope Selector */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-wider text-white/50">Reports Scope</div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => handleScopeChange('all-time')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              reportScope === 'all-time'
                ? 'bg-gradient-to-r from-[#c54914] to-[#7a2200] text-white shadow-[0_4px_12px_rgba(197,73,20,0.3)]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handleScopeChange('weekly')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              reportScope === 'weekly'
                ? 'bg-gradient-to-r from-[#c54914] to-[#7a2200] text-white shadow-[0_4px_12px_rgba(197,73,20,0.3)]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">
            Pending Reports
          </h3>
          <p className="text-4xl font-black text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.3)]">{stats.pending}</p>
          <p className="text-[13px] font-semibold text-amber-400/60 mt-2">AWAITING VALIDATION</p>
        </div>

        <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">
            Validated Today
          </h3>
          <p className="text-4xl font-black text-emerald-400 drop-shadow-[0_2px_12px_rgba(52,211,153,0.3)]">{stats.validatedToday}</p>
          <p className="text-[13px] font-semibold text-emerald-400/60 mt-2">CONFIRMED REPORTS</p>
        </div>

        <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">
            Rejected Reports ({scopeLabel})
          </h3>
          <p className="text-4xl font-black text-red-400 drop-shadow-[0_2px_12px_rgba(248,113,113,0.3)]">{stats.rejected}</p>
          <p className="text-[13px] font-semibold text-red-400/60 mt-2">INVALIDATED</p>
        </div>

        <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">
            Total Reports
          </h3>
          <p className="text-4xl font-black text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">{stats.total}</p>
          <p className="text-[13px] font-semibold text-white/40 mt-2">{scopeLabel.toUpperCase()}</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#1c1410]/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Goodly, sans-serif' }}>
              Reports Review
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-white/70 text-sm">Show</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value={10} style={{ color: '#111827', backgroundColor: '#ffffff' }}>10</option>
                <option value={25} style={{ color: '#111827', backgroundColor: '#ffffff' }}>25</option>
              </select>
              <button
                onClick={() => handleFilterChange('UNVERIFIED')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  filter === 'UNVERIFIED'
                    ? 'bg-gradient-to-r from-[#c54914] to-[#7a2200] text-white border-transparent shadow-[0_4px_12px_rgba(197,73,20,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-transparent'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleFilterChange('VALIDATED')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  filter === 'VALIDATED'
                    ? 'bg-gradient-to-r from-[#c54914] to-[#7a2200] text-white border-transparent shadow-[0_4px_12px_rgba(197,73,20,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-transparent'
                }`}
              >
                Validated
              </button>
              <button
                onClick={() => handleFilterChange('REJECTED')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  filter === 'REJECTED'
                    ? 'bg-gradient-to-r from-[#c54914] to-[#7a2200] text-white border-transparent shadow-[0_4px_12px_rgba(197,73,20,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-transparent'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-[#c54914] to-[#7a2200] text-white border-transparent shadow-[0_4px_12px_rgba(197,73,20,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-transparent'
                }`}
              >
                All Reports
              </button>
            </div>
          </div>
        </div>

        <AdminReportsTable reports={reports} loading={reportsLoading} />

        {!reportsLoading && pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-white/60">
              Showing {pagination.skip + 1}-{Math.min(pagination.skip + reports.length, pagination.total)} of {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Page {currentPage + 1}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
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

export default AdminDashboard;
