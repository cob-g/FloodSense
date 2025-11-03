import { useState } from 'react';
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
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Severity</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Reporter</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {reports.map((report) => (
              <tr key={report._id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-neutral-900">{report.barangay}</p>
                    <p className="text-sm text-neutral-600 truncate max-w-xs">
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
                  <p className="text-sm text-neutral-900">{report.reporter?.name || report.user?.name || 'Unknown'}</p>
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
                      className="relative w-12 h-12 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
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
                    <span className="text-sm text-neutral-400">No photo</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-neutral-600">{formatDate(report.createdAt)}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    report.status === 'VALIDATED' ? 'bg-primary-100 text-primary-800' :
                    report.status === 'REJECTED' ? 'bg-danger-100 text-danger-800' :
                    'bg-warning-100 text-warning-800'
                  }`}>
                    {STATUS_LABELS[report.status]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {report.status === 'UNVERIFIED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidate(report)}
                        disabled={processingId === report._id}
                        className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        Validate
                      </button>
                      <button
                        onClick={() => handleReject(report)}
                        disabled={processingId === report._id}
                        className="px-3 py-1.5 bg-danger-500 hover:bg-danger-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {report.status !== 'UNVERIFIED' && (
                    <span className="text-sm text-neutral-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {actionModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              {actionModal === 'validate' ? 'Validate Report' : 'Reject Report'}
            </h3>
            
            <div className="mb-4 p-4 bg-neutral-50 rounded-xl">
              <p className="text-sm text-neutral-600 mb-1">Location</p>
              <p className="font-medium text-neutral-900">{selectedReport.barangay}</p>
              <p className="text-sm text-neutral-600 mt-2">{selectedReport.location?.address}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {actionModal === 'validate' ? 'Notes (optional)' : 'Reason for rejection *'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={actionModal === 'validate' ? 'Add any notes...' : 'Please explain why this report is being rejected...'}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="4"
                required={actionModal === 'reject'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={validateMutation.isPending || rejectMutation.isPending}
                className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-colors disabled:opacity-50 ${
                  actionModal === 'validate'
                    ? 'bg-primary-500 hover:bg-primary-600'
                    : 'bg-danger-500 hover:bg-danger-600'
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
        </div>
      )}

      {/* Photo Viewer Modal */}
      {photoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50" onClick={() => setPhotoModal(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPhotoModal(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors z-10"
            >
              ×
            </button>
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
        </div>
      )}
    </>
  );
};

export default AdminReportsTable;
