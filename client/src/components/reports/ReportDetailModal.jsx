import { formatDate, getSeverityColor, formatCoordinates } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteReport } from '../../hooks/useReports';
import { createPortal } from 'react-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const ReportDetailModal = ({ report, onClose }) => {
  const { user } = useAuth();
  const deleteReport = useDeleteReport();

  const statusColors = {
    UNVERIFIED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    VALIDATED: 'bg-green-500/10 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport.mutateAsync(report._id);
        onClose();
      } catch (error) {
        alert('Failed to delete report: ' + error.message);
      }
    }
  };

  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[3000]" onClick={onClose}>
      <div className="bg-space-800/95 backdrop-blur-xl rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-space-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent/30 to-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Report Details
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors group"
          >
            <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${statusColors[report.status]}`}>
              {STATUS_LABELS[report.status]}
            </span>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getSeverityColor(report.severity)}`}>
              {report.severity}
            </span>
          </div>

          {/* Photos */}
          {report.photos && report.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {report.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`${BASE_URL}/uploads/${photo}`}
                  alt={`Flood photo ${index + 1}`}
                  className="w-full h-56 object-cover rounded-xl ring-2 ring-white/10 hover:ring-accent/50 transition-all shadow-lg"
                />
              ))}
            </div>
          )}

          {/* Location */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </h3>
            <p className="text-white font-medium">{report.location?.address || 'No address provided'}</p>
            <p className="text-sm text-white/60 mt-1">
              {formatCoordinates(report.location?.coordinates[1], report.location?.coordinates[0])}
            </p>
            <p className="text-sm text-accent font-medium mt-2">{report.barangay}</p>
          </div>

          {/* Flood Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-bold text-white/90 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Water Depth
              </h3>
              <p className="text-white font-bold text-lg">{report.depth}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-bold text-white/90 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Road Passability
              </h3>
              <p className="text-white font-bold text-lg">{report.passability}</p>
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Description
              </h3>
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{report.description}</p>
            </div>
          )}

          {/* Reporter Info */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Reported By
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center ring-2 ring-accent/30">
                <span className="text-lg font-bold text-accent">
                  {report.user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-bold text-white">{report.user?.name || 'Anonymous'}</p>
                <p className="text-sm text-white/60">{formatDate(report.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {report.validationNotes && (
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
              <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Admin Notes
              </h3>
              <p className="text-white/90 leading-relaxed">{report.validationNotes}</p>
            </div>
          )}

          {/* Actions */}
          {canDelete && (
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleDelete}
                disabled={deleteReport.isLoading}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3.5 rounded-xl transition-all border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleteReport.isLoading ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportDetailModal;
