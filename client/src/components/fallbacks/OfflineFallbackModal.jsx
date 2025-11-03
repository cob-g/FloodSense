import { createPortal } from 'react-dom';

const OfflineFallbackModal = ({ items = [], onClose }) => {
  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[3000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-space-900/95 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Verified Flood Spots (Offline)</h3>
            <p className="text-white/60 text-sm">Showing admin-curated locations while offline</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {(!items || items.length === 0) && (
            <div className="text-white/70 text-center py-10">No cached fallback spots available</div>
          )}
          {items && items.length > 0 && (
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i._id || i.name + i.address} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{i.name}</div>
                      <div className="text-white/80 text-sm">{i.barangay}</div>
                      <div className="text-white/60 text-sm">{i.address}</div>
                    </div>
                    <div className="text-xs text-white/50">
                      {Array.isArray(i.location?.coordinates) && i.location.coordinates.length === 2 && (
                        <span>{i.location.coordinates[1]}, {i.location.coordinates[0]}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-3 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OfflineFallbackModal;
