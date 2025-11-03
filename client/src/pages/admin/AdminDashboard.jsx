import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';
import AdminReportsTable from '../../components/admin/AdminReportsTable';

export const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('UNVERIFIED'); // UNVERIFIED, all
  
  const { data, isLoading: reportsLoading } = useReports({
    status: filter === 'all' ? undefined : filter,
    limit: 50,
  });

  const reports = data?.data?.reports || [];

  // Calculate stats
  const stats = useMemo(() => {
    const allReports = data?.data?.reports || [];
    const pending = allReports.filter(r => r.status === 'UNVERIFIED').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validatedToday = allReports.filter(r => 
      r.status === 'VALIDATED' && new Date(r.updatedAt) >= today
    ).length;
    
    const total = allReports.length;

    return { pending, validatedToday, total };
  }, [data]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate]);

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600">
          Welcome back, {user.name}! Manage and validate flood reports.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-material p-6">
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Pending Reports
          </h3>
          <p className="text-3xl font-bold text-warning-600">{stats.pending}</p>
          <p className="text-xs text-neutral-500 mt-1">Awaiting validation</p>
        </div>

        <div className="bg-white rounded-2xl shadow-material p-6">
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Validated Today
          </h3>
          <p className="text-3xl font-bold text-primary-600">{stats.validatedToday}</p>
          <p className="text-xs text-neutral-500 mt-1">Confirmed reports</p>
        </div>

        <div className="bg-white rounded-2xl shadow-material p-6">
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Total Reports
          </h3>
          <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
          <p className="text-xs text-neutral-500 mt-1">All time</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-material overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              Reports Review
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('UNVERIFIED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'UNVERIFIED'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                All Reports
              </button>
            </div>
          </div>
        </div>

        <AdminReportsTable reports={reports} loading={reportsLoading} />
      </div>
    </div>
  );
};

export default AdminDashboard;
