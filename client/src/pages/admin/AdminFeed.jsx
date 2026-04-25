import { useMemo, useState } from 'react';
import {
  useReports,
  useArchivedReports,
  useDeleteReport,
  useRestoreReport,
  usePermanentDeleteReport,
} from '../../hooks/useReports';
import ReportDetailModal from '../../components/reports/ReportDetailModal';
import ReportDeleteConfirmModal from '../../components/admin/ReportDeleteConfirmModal';
import { useToast } from '../../contexts/ToastContext';

const VIEW_MODE = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

export const AdminFeed = () => {
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState(VIEW_MODE.ACTIVE);

  const activeQuery = useReports(
    { limit, status: 'VALIDATED' },
    { enabled: viewMode === VIEW_MODE.ACTIVE }
  );
  const archivedQuery = useArchivedReports(
    { limit },
    { enabled: viewMode === VIEW_MODE.ARCHIVED }
  );

  const activeReports = useMemo(() => activeQuery?.data?.data?.reports || [], [activeQuery.data]);
  const archivedReports = useMemo(() => archivedQuery?.data?.data?.reports || [], [archivedQuery.data]);

  const reports = viewMode === VIEW_MODE.ACTIVE ? activeReports : archivedReports;
  const isLoading = viewMode === VIEW_MODE.ACTIVE ? activeQuery.isLoading : archivedQuery.isLoading;
  const error = viewMode === VIEW_MODE.ACTIVE ? activeQuery.error : archivedQuery.error;

  const delMut = useDeleteReport();
  const restoreMut = useRestoreReport();
  const permanentDeleteMut = usePermanentDeleteReport();
  const [selected, setSelected] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [pendingRestoreId, setPendingRestoreId] = useState(null);
  const [pendingPermanentDeleteId, setPendingPermanentDeleteId] = useState(null);
  const toast = useToast();

  const isDeleting = delMut.isLoading;
  const isRestoring = restoreMut.isLoading;
  const isPermanentlyDeleting = permanentDeleteMut.isLoading;

  const getErrorMessage = (err, fallback = 'Request failed') => {
    return (
      err?.message ||
      err?.error ||
      err?.response?.data?.message ||
      fallback
    );
  };

  const setView = (nextView) => {
    if (isDeleting || isRestoring || isPermanentlyDeleting) return;
    setViewMode(nextView);
    setSelected(null);
    setReportToDelete(null);
  };

  const openDeleteModal = (report) => {
    if (viewMode !== VIEW_MODE.ACTIVE) return;
    setReportToDelete(report);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setReportToDelete(null);
  };

  const confirmDelete = async () => {
    if (isDeleting || !reportToDelete?._id) return;
    try {
      const result = await delMut.mutateAsync(reportToDelete._id);
      toast.success(result?.message || 'Report deleted successfully');
      if (selected?._id === reportToDelete._id) {
        setSelected(null);
      }
      setReportToDelete(null);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to delete report'));
    }
  };

  const confirmRestore = async (report) => {
    if (!report?._id || isRestoring || isPermanentlyDeleting) return;

    const targetLabel = report?.location?.address || report?.barangay || 'this report';
    const confirmed = window.confirm(`Restore archived report at ${targetLabel}?`);
    if (!confirmed) return;

    try {
      setPendingRestoreId(report._id);
      const result = await restoreMut.mutateAsync(report._id);
      toast.success(result?.message || 'Report restored successfully');
      if (selected?._id === report._id) {
        setSelected(null);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to restore report'));
    } finally {
      setPendingRestoreId(null);
    }
  };

  const confirmPermanentDelete = async (report) => {
    if (!report?._id || isPermanentlyDeleting || isRestoring) return;

    const targetLabel = report?.location?.address || report?.barangay || 'this report';
    const confirmed = window.confirm(
      `Permanently delete archived report at ${targetLabel}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setPendingPermanentDeleteId(report._id);
      const result = await permanentDeleteMut.mutateAsync(report._id);
      toast.success(result?.message || 'Report permanently deleted successfully');
      if (selected?._id === report._id) {
        setSelected(null);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to permanently delete report'));
    } finally {
      setPendingPermanentDeleteId(null);
    }
  };

  const getPassabilityColor = (passability) => {
    switch (passability) {
      case 'NotPassable': return 'bg-red-500/20 text-red-400';
      case 'HeavyOnly': return 'bg-amber-500/20 text-amber-400';
      case 'Passable': return 'bg-green-500/20 text-green-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getReportStatusColor = (status) => {
    switch (status) {
      case 'VALIDATED': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'REJECTED': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'UNVERIFIED': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      default: return 'bg-white/10 text-white/60 border border-white/20';
    }
  };

  const formatDate = (value) => {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Report Management</h1>
            <p className="text-white/60">
              {viewMode === VIEW_MODE.ACTIVE
                ? 'Validated active community flood reports'
                : 'Archived reports across all validation statuses'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setView(VIEW_MODE.ACTIVE)}
                disabled={isDeleting || isRestoring || isPermanentlyDeleting}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === VIEW_MODE.ACTIVE
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setView(VIEW_MODE.ARCHIVED)}
                disabled={isDeleting || isRestoring || isPermanentlyDeleting}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === VIEW_MODE.ARCHIVED
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Archived
              </button>
            </div>
            <label className="text-white/70 text-sm">Show</label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value={10} style={{ color: '#111827', backgroundColor: '#ffffff' }}>10</option>
              <option value={25} style={{ color: '#111827', backgroundColor: '#ffffff' }}>25</option>
              <option value={50} style={{ color: '#111827', backgroundColor: '#ffffff' }}>50</option>
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
            <div className="text-red-400">{getErrorMessage(error, 'Failed to load reports')}</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && reports.length === 0 && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
            <div className="text-4xl mb-3">{viewMode === VIEW_MODE.ACTIVE ? '📝' : '🗂️'}</div>
            <h3 className="text-lg text-white mb-1">
              {viewMode === VIEW_MODE.ACTIVE ? 'No Reports' : 'No Archived Reports'}
            </h3>
            <p className="text-white/60">
              {viewMode === VIEW_MODE.ACTIVE
                ? 'No validated reports to display'
                : 'No archived reports matched your current view'}
            </p>
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPassabilityColor(report.passability)}`}>
                        {report.passability}
                      </span>
                      {viewMode === VIEW_MODE.ARCHIVED && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getReportStatusColor(report.status)}`}>
                          {report.status || 'UNKNOWN'}
                        </span>
                      )}
                      <span className="text-white/40 text-sm">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-white font-medium mb-1">
                      {report?.location?.address || report.barangay || 'Unknown Location'}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <span>Depth: {report.depth}</span>
                      {report.barangay && <span>Brgy. {report.barangay}</span>}
                      {viewMode === VIEW_MODE.ARCHIVED && <span>Archived: {formatDate(report.updatedAt)}</span>}
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

                    {viewMode === VIEW_MODE.ACTIVE ? (
                      <button
                        onClick={() => openDeleteModal(report)}
                        disabled={isDeleting}
                        className="w-10 h-10 bg-white/5 hover:bg-red-500/20 rounded-lg border border-white/10 flex items-center justify-center"
                        title="Delete Report"
                      >
                        <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2H10a1 1 0 00-1 1v1h8V6a1 1 0 00-1-1z"/>
                        </svg>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => confirmRestore(report)}
                          disabled={isRestoring || isPermanentlyDeleting}
                          className="px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Restore Report"
                        >
                          {pendingRestoreId === report._id && isRestoring ? 'Restoring...' : 'Restore'}
                        </button>
                        <button
                          onClick={() => confirmPermanentDelete(report)}
                          disabled={isPermanentlyDeleting || isRestoring}
                          className="px-3 py-2 text-xs font-semibold rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Permanent Delete"
                        >
                          {pendingPermanentDeleteId === report._id && isPermanentlyDeleting ? 'Deleting...' : 'Permanent Delete'}
                        </button>
                      </>
                    )}
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

      <ReportDeleteConfirmModal
        open={!!reportToDelete}
        report={reportToDelete}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
};

export default AdminFeed;