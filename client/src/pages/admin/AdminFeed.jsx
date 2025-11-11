import { useMemo, useState } from 'react';
import { useReports, useDeleteReport } from '../../hooks/useReports';
import ReportDetailModal from '../../components/reports/ReportDetailModal';

export const AdminFeed = () => {
  const [limit, setLimit] = useState(10);
  const { data, isLoading, error } = useReports({ limit, status: 'VALIDATED' });
  const reports = useMemo(() => data?.data?.reports || [], [data]);
  const delMut = useDeleteReport();
  const [selected, setSelected] = useState(null);

  const confirmDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await delMut.mutateAsync(id);
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const getStatusColor = (passability) => {
    switch (passability) {
      case 'NotPassable': return 'bg-red-500/20 text-red-400';
      case 'HeavyOnly': return 'bg-amber-500/20 text-amber-400';
      case 'Passable': return 'bg-green-500/20 text-green-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Report Management</h1>
            <p className="text-white/60">Validated community flood reports</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-white/70 text-sm">Show</label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-4 bg-white/10 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="text-red-400">Failed to load reports</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && reports.length === 0 && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg text-white mb-1">No Reports</h3>
            <p className="text-white/60">No validated reports to display</p>
          </div>
        )}

        {/* Reports List */}
        {!isLoading && !error && reports.length > 0 && (
          <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/10">
            {reports.map((report) => (
              <div key={report._id} className="p-6 hover:bg-white/5">
                <div className="flex items-center justify-between">
                  {/* Report Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.passability)}`}>
                        {report.passability}
                      </span>
                      <span className="text-white/40 text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-white font-medium mb-1">
                      {report?.location?.address || report.barangay || 'Unknown Location'}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <span>Depth: {report.depth}</span>
                      {report.barangay && <span>Brgy. {report.barangay}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(report)}
                      className="w-10 h-10 bg-white/5 hover:bg-accent-500/20 rounded-lg border border-white/10 flex items-center justify-center"
                      title="View Details"
                    >
                      <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => confirmDelete(report._id)}
                      className="w-10 h-10 bg-white/5 hover:bg-red-500/20 rounded-lg border border-white/10 flex items-center justify-center"
                      title="Delete Report"
                    >
                      <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2H10a1 1 0 00-1 1v1h8V6a1 1 0 00-1-1z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selected && (
        <ReportDetailModal 
          report={selected} 
          onClose={() => setSelected(null)} 
        />
      )}
    </div>
  );
};

export default AdminFeed;