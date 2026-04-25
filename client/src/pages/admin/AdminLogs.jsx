import { useEffect, useMemo, useState } from 'react';
import { useActivityLogs } from '../../hooks/useLogs';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'USER_STATUS_UPDATED', label: 'User Status Updated' },
  { value: 'USER_ROLE_UPDATED', label: 'User Role Updated' },
  { value: 'REPORT_VALIDATED', label: 'Report Validated' },
  { value: 'REPORT_REJECTED', label: 'Report Rejected' },
  { value: 'REPORT_DELETED', label: 'Report Deleted' },
  { value: 'REPORT_RESTORED', label: 'Report Restored' },
  { value: 'REPORT_PERMANENTLY_DELETED', label: 'Report Permanently Deleted' },
  { value: 'SENSOR_CREATED', label: 'Sensor Created' },
  { value: 'SENSOR_UPDATED', label: 'Sensor Updated' },
  { value: 'SENSOR_DELETED', label: 'Sensor Deleted' },
  { value: 'FALLBACK_CREATED', label: 'Fallback Created' },
  { value: 'FALLBACK_UPDATED', label: 'Fallback Updated' },
  { value: 'FALLBACK_PRIORITY_UPDATED', label: 'Fallback Priority Updated' },
  { value: 'FALLBACK_DELETED', label: 'Fallback Deleted' },
  { value: 'WEEKLY_REPORT_EXPORTED', label: 'Weekly Report Exported' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'USER', label: 'User' },
  { value: 'REPORT', label: 'Report' },
  { value: 'SENSOR', label: 'Sensor' },
  { value: 'FALLBACK', label: 'Historical Flood Spot' },
  { value: 'ANALYTICS', label: 'Analytics' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
];

const getStatusClass = (status) => {
  if (status === 'SUCCESS') {
    return 'text-green-300 border-green-400/40 bg-green-400/10';
  }
  if (status === 'FAILED') {
    return 'text-red-300 border-red-400/40 bg-red-400/10';
  }
  return 'text-white/70 border-white/20 bg-white/5';
};

const getEntityClass = (entityType) => {
  if (entityType === 'USER') return 'text-blue-300 border-blue-400/40 bg-blue-400/10';
  if (entityType === 'REPORT') return 'text-amber-300 border-amber-400/40 bg-amber-400/10';
  if (entityType === 'SENSOR') return 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10';
  if (entityType === 'FALLBACK') return 'text-purple-300 border-purple-400/40 bg-purple-400/10';
  if (entityType === 'ANALYTICS') return 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10';
  return 'text-white/70 border-white/20 bg-white/5';
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleString();
};

const summarizeChanges = (changes) => {
  if (!changes || typeof changes !== 'object') return '-';
  const keys = Object.keys(changes);
  if (keys.length === 0) return '-';
  const preview = keys.slice(0, 3).join(', ');
  if (keys.length <= 3) return `Updated: ${preview}`;
  return `Updated: ${preview} +${keys.length - 3} more`;
};

export const AdminLogs = () => {
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);

  const query = useMemo(() => {
    const skip = currentPage * pageSize;
    return {
      actor: actor.trim() || undefined,
      action: action || undefined,
      entityType: entityType || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: pageSize,
      skip,
    };
  }, [actor, action, entityType, status, dateFrom, dateTo, pageSize, currentPage]);

  const { data, isLoading, error, isFetching } = useActivityLogs(query);

  const payload = data?.data || {};
  const logs = payload.logs || [];
  const pagination = payload.pagination || {
    total: 0,
    limit: pageSize,
    skip: currentPage * pageSize,
    hasMore: false,
  };

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || pageSize)));

  const stats = useMemo(() => {
    const successCount = logs.filter((entry) => entry.status === 'SUCCESS').length;
    const failedCount = logs.filter((entry) => entry.status === 'FAILED').length;
    return {
      total: pagination.total || 0,
      success: successCount,
      failed: failedCount,
      showing: logs.length,
    };
  }, [logs, pagination.total]);

  useEffect(() => {
    setCurrentPage(0);
  }, [actor, action, entityType, status, dateFrom, dateTo, pageSize]);

  useEffect(() => {
    if (!isLoading && currentPage > 0 && logs.length === 0) {
      setCurrentPage(0);
    }
  }, [isLoading, currentPage, logs.length]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Activity Logs</h1>
          <p className="text-white/60">Immutable audit trail of admin actions across users, reports, sensors, fallbacks, and analytics exports.</p>
        </div>
        {isFetching && !isLoading && (
          <div className="text-xs text-white/60">Refreshing...</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Total Logs</div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Success (Page)</div>
          <div className="text-3xl font-black text-green-300">{stats.success}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Failed (Page)</div>
          <div className="text-3xl font-black text-red-300">{stats.failed}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Showing</div>
          <div className="text-3xl font-black text-white">{stats.showing}</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          <input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Filter by actor name/email or user ID"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/50"
          />

          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value || 'all-actions'} value={option.value} style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            {ENTITY_OPTIONS.map((option) => (
              <option key={option.value || 'all-entities'} value={option.value} style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all-statuses'} value={option.value} style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Rows per page</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
            >
              <option value={10} style={{ color: '#111827', backgroundColor: '#ffffff' }}>10</option>
              <option value={25} style={{ color: '#111827', backgroundColor: '#ffffff' }}>25</option>
              <option value={50} style={{ color: '#111827', backgroundColor: '#ffffff' }}>50</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setActor('');
                setAction('');
                setEntityType('');
                setStatus('');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 text-sm font-semibold hover:bg-white/10"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        {isLoading && (
          <div className="px-4 py-8 text-white/70">Loading activity logs...</div>
        )}

        {error && !isLoading && (
          <div className="px-4 py-8 text-red-400">Failed to load activity logs.</div>
        )}

        {!isLoading && !error && logs.length === 0 && (
          <div className="px-4 py-8 text-white/70">No activity logs found for the selected filters.</div>
        )}

        {!isLoading && !error && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Actor</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Action</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Entity</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Details</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 align-top">
                    <td className="px-4 py-3 text-sm text-white/80 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/85">
                      <div className="font-medium text-white/90">{log.actorName || 'Unknown Admin'}</div>
                      <div className="text-xs text-white/55">{log.actorEmail || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/85 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 rounded-lg border border-white/20 bg-white/5 text-white/80">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/85">
                      <div className="mb-1">
                        <span className={`text-xs px-2 py-1 rounded-lg border ${getEntityClass(log.entityType)}`}>
                          {log.entityType || 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">{log.entityLabel || log.entityId || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/75 max-w-sm">
                      <div className="line-clamp-2">{log.notes || summarizeChanges(log.changes)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/85 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-lg border ${getStatusClass(log.status)}`}>
                        {log.status || 'UNKNOWN'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && logs.length > 0 && (
          <div className="px-4 py-4 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-white/60">
              Showing {pagination.skip + 1}-{Math.min(pagination.skip + logs.length, pagination.total)} of {pagination.total}
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

export default AdminLogs;
