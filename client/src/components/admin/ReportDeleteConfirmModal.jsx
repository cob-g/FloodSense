import { createPortal } from 'react-dom';
import { AlertTriangle, Archive, X } from 'lucide-react';

export const ReportDeleteConfirmModal = ({
  open,
  onClose,
  onConfirm,
  isPending = false,
  report = null,
  title = 'Archive Report',
  description = 'This will move the report to the archived list and hide it from active views.',
  itemLabel = 'Location',
  itemValue,
  confirmText = 'Archive Report',
  pendingText = 'Archiving...',
  cancelText = 'Cancel',
}) => {
  if (!open) return null;

  const detailValue =
    itemValue ||
    report?.location?.address ||
    (report?.barangay ? `Brgy. ${report.barangay}` : 'Selected report');

  const handleBackdropClick = () => {
    if (!isPending) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[3200] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#17120f] border border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-white/70 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 flex items-center justify-center disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-1">{itemLabel}</p>
          <p className="text-sm text-white/90 line-clamp-2">{detailValue}</p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl border border-red-400/40 bg-red-500/20 hover:bg-red-500/30 text-red-100 font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Archive className="w-4 h-4" />
            {isPending ? pendingText : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportDeleteConfirmModal;
