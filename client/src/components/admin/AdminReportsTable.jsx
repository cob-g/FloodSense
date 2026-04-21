import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatDate, getSeverityColor } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';
import { useValidateReport, useRejectReport } from '../../hooks/useReports';
import { useToast } from '../../contexts/ToastContext';

// Base URL for static files (no /api prefix)
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const AdminReportsTable = ({ reports, loading }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'validate' or 'reject'
  const [notes, setNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [photoModal, setPhotoModal] = useState(null); // For viewing photos
  
  const validateMutation = useValidateReport();
  const rejectMutation = useRejectReport();
  const toast = useToast();

  const handleValidate = (report) => {
    setSelectedReport(report);
    setActionModal('validate');
    setNotes('');
  };

  const handleReject = (report) => {
    setSelectedReport(report);
    setActionModal('reject');
    setNotes('');
  };

  const confirmAction = async () => {
    if (!selectedReport) return;

    setProcessingId(selectedReport._id);

    try {
      if (actionModal === 'validate') {
        await validateMutation.mutateAsync({
          id: selectedReport._id,
          notes: notes.trim(),
        });
        toast.success('Report validated successfully!');
      } else if (actionModal === 'reject') {
        if (!notes.trim()) {
          toast.warning('Please provide a reason for rejection');
          return;
        }
        await rejectMutation.mutateAsync({
          id: selectedReport._id,
          notes: notes.trim(),
        });
        toast.success('Report rejected successfully');
      }
      
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const closeModal = () => {
    setActionModal(null);
    setSelectedReport(null);
    setNotes('');
  };

  // Debug logging
  console.log('AdminReportsTable - Reports:', reports);
  console.log('AdminReportsTable - BASE_URL:', BASE_URL);
  if (reports && reports.length > 0) {
    console.log('AdminReportsTable - First report photos:', reports[0].photos);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">No pending reports to review</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Severity</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Reporter</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {reports.map((report) => (
              <tr key={report._id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-white">{report.barangay}</p>
                    <p className="text-sm text-white/60 truncate max-w-xs">
                      {report.location?.address || 'No address'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(report.severity)}`}>
                    {report.depth}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-white/90">{report.reporter?.name || report.user?.name || 'Unknown'}</p>
                </td>
                <td className="px-4 py-4">
                  {report.photos && report.photos.length > 0 ? (
                    <button
                      onClick={() => {
                        console.log('Opening photos:', report.photos);
                        console.log('BASE_URL:', BASE_URL);
                        console.log('Full URL:', `${BASE_URL}/uploads/${report.photos[0]}`);
                        setPhotoModal(report.photos);
                      }}
                      className="relative w-12 h-12 rounded-lg overflow-hidden hover:ring-2 hover:ring-accent/50 transition-all"
                    >
                      <img
                        src={`${BASE_URL}/uploads/${report.photos[0]}`}
                        alt="Report photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          console.error('Photo filename:', report.photos[0]);
                        }}
                      />
                      {report.photos.length > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl">
                          +{report.photos.length - 1}
                        </span>
                      )}
                    </button>
                  ) : (
                    <span className="text-sm text-white/50">No photo</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-white/60">{formatDate(report.createdAt)}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs px-2 py-1 rounded-lg border whitespace-nowrap inline-block ${
                    report.status === 'VALIDATED' ? 'text-green-300 border-green-400/40 bg-green-400/10' :
                    report.status === 'REJECTED' ? 'text-red-300 border-red-400/40 bg-red-400/10' :
                    'text-amber-300 border-amber-400/40 bg-amber-400/10'
                  }`}>{STATUS_LABELS[report.status]}</span>
                </td>
                <td className="px-4 py-4">
                  {report.status === 'UNVERIFIED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidate(report)}
                        disabled={processingId === report._id}
                        className="px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40"
                      >
                        Validate
                      </button>
                      <button
                        onClick={() => handleReject(report)}
                        disabled={processingId === report._id}
                        className="px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {report.status !== 'UNVERIFIED' && (
                    <div className="flex items-center">
                      {report.status === 'REJECTED' && report.validationNotes ? (
                        <div className="relative group flex items-center">
                          <span className="text-xs text-red-300/80 cursor-help border-b border-dashed border-red-400/30 pb-0.5">
                            View notes
                          </span>
                          <div className="absolute hidden group-hover:block bg-[#1a1410] border border-white/10 shadow-2xl text-white/90 p-3 rounded-xl text-xs z-50 bottom-full right-0 mb-2 w-56">
                            <div className="font-semibold text-red-400 mb-1 border-b border-white/10 pb-1">Reason for Rejection</div>
                            <div className="leading-relaxed">{report.validationNotes}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-white/50">-</span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {actionModal && selectedReport && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[3200]" onClick={closeModal}>
          <div className="w-full max-w-md rounded-2xl bg-[#17120f] border border-white/10 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {actionModal === 'validate' ? 'Validate Report' : 'Reject Report'}
                </h3>
                <p className="text-sm text-white/65 mt-1">
                  {actionModal === 'validate'
                    ? 'Confirm this report and optionally leave internal notes.'
                    : 'Provide a clear reason before rejecting this report.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 flex items-center justify-center"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-xs uppercase tracking-wide text-white/50 mb-1">Location</p>
              <p className="font-semibold text-white">{selectedReport.barangay}</p>
              <p className="text-sm text-white/70 mt-1">{selectedReport.location?.address}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                {actionModal === 'validate' ? 'Notes (optional)' : 'Reason for rejection *'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={actionModal === 'validate' ? 'Add any notes...' : 'Please explain why this report is being rejected...'}
                className="w-full px-4 py-3 border border-white/15 bg-white/5 text-white placeholder-white/45 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c54914]/40 focus:border-[#c54914]/50 resize-none"
                rows="4"
                required={actionModal === 'reject'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={validateMutation.isPending || rejectMutation.isPending}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                  actionModal === 'validate'
                    ? 'border border-green-400/40 bg-green-500/20 hover:bg-green-500/30 text-green-100'
                    : 'border border-red-400/40 bg-red-500/20 hover:bg-red-500/30 text-red-100'
                }`}
              >
                {validateMutation.isPending || rejectMutation.isPending
                  ? 'Processing...'
                  : actionModal === 'validate'
                  ? 'Confirm Validation'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Photo Viewer Modal */}
      {photoModal && createPortal(
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[2100]" onClick={() => setPhotoModal(null)}>
          <button
            onClick={() => setPhotoModal(null)}
            className="fixed top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-neutral-100 transition-colors z-[2200]"
          >
            ×
          </button>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {photoModal.map((photo, index) => (
                <img
                  key={index}
                  src={`${BASE_URL}/uploads/${photo}`}
                  alt={`Report photo ${index + 1}`}
                  className="max-h-[80vh] rounded-lg shadow-2xl"
                />
              ))}
            </div>
            <p className="text-white text-center mt-4 text-sm">
              {photoModal.length} photo{photoModal.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminReportsTable;
