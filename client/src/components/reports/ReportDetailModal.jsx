import { useState } from 'react';
import { formatDate, formatCoordinates } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteReport } from '../../hooks/useReports';
import { useToast } from '../../contexts/ToastContext';
import ReportDeleteConfirmModal from '../admin/ReportDeleteConfirmModal';
import { createPortal } from 'react-dom';
import { MapPin, Droplets, Navigation, User, Calendar, FileText, ShieldAlert, Waves, Archive, X } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const severityGradient = {
  Low:      'linear-gradient(135deg, #60a5fa, #22d3ee, #3b82f6)',
  Medium:   'linear-gradient(135deg, #fbbf24, #fde68a, #f97316)',
  High:     'linear-gradient(135deg, #f97316, #f87171, #ea580c)',
  Critical: 'linear-gradient(135deg, #e11d48, #f87171, #be123c)',
};

const severityChip = {
  Low:      { bg: 'rgba(96,165,250,0.2)',  color: '#dbeafe', border: 'rgba(147,197,253,0.3)' },
  Medium:   { bg: 'rgba(251,191,36,0.2)',  color: '#fef3c7', border: 'rgba(253,230,138,0.3)' },
  High:     { bg: 'rgba(249,115,22,0.2)',  color: '#ffedd5', border: 'rgba(253,186,116,0.3)' },
  Critical: { bg: 'rgba(225,29,72,0.2)',   color: '#ffe4e6', border: 'rgba(253,164,175,0.3)' },
};

const statusConfig = {
  UNVERIFIED: { bg: 'rgba(254,243,199,0.93)', color: '#78350f', border: 'rgba(251,191,36,0.55)', dot: '#f59e0b', pulse: false },
  VALIDATED:  { bg: 'rgba(209,250,229,0.93)', color: '#064e3b', border: 'rgba(16,185,129,0.55)', dot: '#10b981', pulse: true  },
  REJECTED:   { bg: 'rgba(254,226,226,0.93)', color: '#7f1d1d', border: 'rgba(239,68,68,0.55)',  dot: '#ef4444', pulse: false },
};

const passLabel = { Passable: 'Passable', HeavyOnly: 'Heavy only', NotPassable: 'Blocked' };
const passStyle = {
  Passable:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  HeavyOnly:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  NotPassable: { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
};

export const ReportDetailModal = ({ report, onClose }) => {
  const { user } = useAuth();
  const deleteReport = useDeleteReport();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDeleting = deleteReport.isLoading;

  const sev     = severityGradient[report.severity] || severityGradient.Low;
  const sevChip = severityChip[report.severity]     || severityChip.Low;
  const stat    = statusConfig[report.status]       || statusConfig.UNVERIFIED;
  const pass    = passStyle[report.passability]     || { bg: '#f9fafb', color: '#374151', border: '#e5e7eb' };
  const hasPhotos = report.photos?.length > 0;

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    try {
      await deleteReport.mutateAsync(report._id);
      toast.success('Report archived successfully');
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      toast.error('Failed to archive report: ' + (error?.message || 'Unknown error'));
    }
  };

  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-[3000]"
          style={{
            background: 'rgba(20, 8, 0, 0.55)',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          }}
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-2xl my-4 rounded-[2rem] overflow-hidden flex flex-col"
            style={{
              maxHeight: '92vh',
              background: 'rgba(255,252,249,0.72)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 32px 80px rgba(122,34,0,0.22), 0 8px 24px rgba(197,73,20,0.12), inset 0 1.5px 0 rgba(255,255,255,0.95)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: '1.5px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 40%, rgba(255,200,160,0.55) 65%, transparent 100%)',
          }}
        />
        {/* Warm tint blob */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '-80px', right: '-80px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(197,73,20,0.07)', filter: 'blur(50px)' }}
        />

        {/* ── Hero ── */}
        <div className="relative h-52 flex-shrink-0 overflow-hidden">
          {hasPhotos ? (
            <img
              src={`${BASE_URL}/uploads/${report.photos[0]}`}
              alt="Flood"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: sev }}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full border-4 border-white" />
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute top-6 left-1/3 w-20 h-20 rounded-full border-2 border-white" />
              </div>
              <Waves className="w-16 h-16 text-white/25" strokeWidth={1.5} />
            </div>
          )}

          {/* Bottom dark overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(20,8,0,0.6) 0%, rgba(20,8,0,0.08) 50%, transparent 100%)' }}
          />

          {/* Status badge — top left */}
          <div className="absolute top-4 left-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: stat.bg, color: stat.color, border: `1px solid ${stat.border}`, backdropFilter: 'blur(8px)' }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${stat.pulse ? 'animate-pulse' : ''}`}
                style={{ background: stat.dot }}
              />
              {STATUS_LABELS[report.status]}
            </span>
          </div>

          {/* Close — top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'rgba(20,8,0,0.35)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Severity chip + extra photos count — bottom */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: sevChip.bg, color: sevChip.color, border: `1px solid ${sevChip.border}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {report.severity} Severity
            </span>
            {report.photos?.length > 1 && (
              <span
                className="text-white/80 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(20,8,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                +{report.photos.length - 1} more photo{report.photos.length > 2 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* ── Extra photos strip ── */}
        {report.photos?.length > 1 && (
          <div className="flex gap-2 px-5 pt-4 pb-0 flex-shrink-0 overflow-x-auto">
            {report.photos.slice(1).map((photo, i) => (
              <img
                key={i}
                src={`${BASE_URL}/uploads/${photo}`}
                alt={`Photo ${i + 2}`}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0 hover:scale-105 transition-transform duration-200"
                style={{ border: '2px solid rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

          {/* Location */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(197,73,20,0.1)', border: '1px solid rgba(197,73,20,0.2)' }}>
                <MapPin size={13} style={{ color: '#c54914' }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b4030' }}>Location</span>
            </div>
            <p className="font-black text-lg leading-snug" style={{ color: '#1a0a00' }}>
              {report.location?.address || 'No address provided'}
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#c54914' }}>Brgy. {report.barangay}</p>
            {report.location?.coordinates && (
              <p className="text-xs font-mono mt-1.5" style={{ color: '#6b4030' }}>
                {formatCoordinates(report.location.coordinates[1], report.location.coordinates[0])}
              </p>
            )}
          </div>

          {/* Metric tiles */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6b4030' }}>Depth</div>
              <div className="text-sm font-black" style={{ color: '#1a0a00' }}>{report.depth}</div>
            </div>

            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(197,73,20,0.1)', border: '1px solid rgba(197,73,20,0.15)' }}>
                <ShieldAlert size={16} style={{ color: '#c54914' }} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6b4030' }}>Severity</div>
              <div className="text-sm font-black" style={{ color: '#1a0a00' }}>{report.severity}</div>
            </div>

            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <Navigation className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6b4030' }}>Access</div>
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-lg inline-block"
                style={{ background: pass.bg, color: pass.color, border: `1px solid ${pass.border}` }}
              >
                {passLabel[report.passability] || report.passability}
              </span>
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(61,32,16,0.06)', border: '1px solid rgba(61,32,16,0.1)' }}>
                  <FileText size={13} style={{ color: '#7a5040' }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b4030' }}>Description</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#3d2010' }}>{report.description}</p>
            </div>
          )}

          {/* Admin notes */}
          {report.validationNotes && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(237,233,254,0.5)', border: '1px solid rgba(167,139,250,0.3)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <ShieldAlert size={13} className="text-violet-500" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Admin Notes</span>
              </div>
              <p className="text-sm leading-relaxed text-violet-900/80">{report.validationNotes}</p>
            </div>
          )}

          {/* Reporter + date */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-md"
                  style={{ background: 'linear-gradient(135deg, #c54914, #7a2200)' }}
                >
                  <span className="text-sm font-black text-white select-none">
                    {report.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <User size={11} style={{ color: '#6b4030' }} className="flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6b4030' }}>Reporter</span>
                  </div>
                  <p className="font-black text-sm truncate" style={{ color: '#1a0a00' }}>{report.user?.name || 'Anonymous'}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 mb-0.5 justify-end">
                  <Calendar size={11} style={{ color: '#6b4030' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6b4030' }}>Submitted</span>
                </div>
                <p className="text-xs font-semibold" style={{ color: '#3d2010' }}>{formatDate(report.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Admin delete */}
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:shadow-md disabled:opacity-50"
              style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239' }}
            >
              <Archive className="w-4 h-4" />
              {isDeleting ? 'Archiving...' : 'Archive Report'}
            </button>
          )}

          <div className="h-1" />
        </div>
          </div>
        </div>,
        document.body
      )}

      <ReportDeleteConfirmModal
        open={showDeleteConfirm}
        report={report}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
};

export default ReportDetailModal;
