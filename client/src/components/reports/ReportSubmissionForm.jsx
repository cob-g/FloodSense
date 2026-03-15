import { useState } from 'react';
import { useCreateReport } from '../../hooks/useReports';
import { DEPTH_OPTIONS, PASSABILITY_OPTIONS, MESSAGES } from '../../utils/constants';
import LocationPicker from '../map/LocationPicker';
import { useToast } from '../../contexts/ToastContext';
import { MapPin, Camera, X, ChevronDown, Droplets, Navigation, FileText } from 'lucide-react';

export const ReportSubmissionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    depth: '',
    passability: '',
    description: '',
    location: null,
    photos: [],
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [useMyLocation, setUseMyLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const toast = useToast();

  const createReport = useCreateReport();

  // Depths that make "Passable (Safe)" logically impossible
  const HIGH_DEPTH = ['Waist', 'Chest'];
  const isHighDepth = HIGH_DEPTH.includes(formData.depth);

  const handleDepthChange = (e) => {
    const depth = e.target.value;
    const newPassability = HIGH_DEPTH.includes(depth) && formData.passability === 'Passable'
      ? '' // auto-clear Passable when switching to dangerous depth
      : formData.passability;
    setFormData({ ...formData, depth, passability: newPassability });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (5MB max per file)
    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.warning('Some files are too large. Maximum size is 5MB per photo.');
      return;
    }

    // Limit to 3 photos
    if (files.length > 3) {
      toast.warning('Maximum 3 photos allowed');
      return;
    }

    setPhotoFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.location) {
      toast.warning(MESSAGES.LOCATION_REQUIRED);
      return;
    }

    if (photoFiles.length === 0) {
      toast.warning(MESSAGES.PHOTO_REQUIRED);
      return;
    }

    // Create FormData for multipart upload
    const submitData = new FormData();
    submitData.append('depth', formData.depth);
    submitData.append('passability', formData.passability);
    submitData.append('description', formData.description);
    submitData.append('latitude', formData.location.lat);
    submitData.append('longitude', formData.location.lng);
    submitData.append('address', formData.location.address);
    submitData.append('barangay', formData.location.barangay);

    // Append photos
    photoFiles.forEach((file) => {
      submitData.append('photos', file);
    });

    try {
      const response = await createReport.mutateAsync(submitData);
      
      if (response.success) {
        toast.success('Report Submitted', 'Your flood report has been received and is under review.');
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || 'Failed to submit report');
      }
    } catch (err) {
      if (err.message?.includes('3 minuto')) {
        toast.warning(MESSAGES.RATE_LIMIT);
      } else {
        toast.error(err.message || 'An error occurred while submitting the report');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[2000]"
      style={{
        background: 'rgba(20, 8, 0, 0.55)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      }}
    >
      {/* Modal shell — liquid glass */}
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
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: '1.5px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 40%, rgba(255,200,160,0.55) 65%, transparent 100%)',
          }}
        />
        {/* Warm glass tint blob top-right */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '-80px', right: '-80px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(197,73,20,0.07)', filter: 'blur(50px)' }}
        />

        {/* ── Header ── */}
        <div
          className="relative flex-none px-7 py-5 overflow-hidden"
          style={{ borderBottom: '1px solid rgba(197,73,20,0.1)' }}
        >
          {/* Warm cream tint */}
          <div className="absolute inset-0" style={{ background: 'rgba(255,244,238,0.55)' }} />
          {/* Dot pattern — matches dashboard header */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(197,73,20,0.13) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div className="relative flex items-start justify-between">
            <div>
              {/* Pill badge — like "LIVE MONITORING" */}
              
              {/* Split title */}
              <h2 className="text-[20px] font-black tracking-tight leading-tight">
                <span style={{ color: '#1a0a00' }}>Submit </span>
                <span style={{ color: '#c54914' }}>Report</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 mt-1"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(197,73,20,0.18)' }}
            >
              <X size={15} strokeWidth={2.5} color="#7a2200" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

          {/* Location card */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(197,73,20,0.1)', border: '1px solid rgba(197,73,20,0.2)' }}>
                  <MapPin size={13} style={{ color: '#c54914' }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b4030' }}>
                  Location <span style={{ color: '#c54914' }}>*</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => !locating && useMyLocation && useMyLocation()}
                disabled={locating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ color: '#7a2200', background: 'rgba(197,73,20,0.08)', border: '1px solid rgba(197,73,20,0.2)', borderRadius: '999px' }}
              >
                {locating ? (
                  <>
                    <div className="w-3 h-3 rounded-full border-2 border-[#c54914]/30 border-t-[#c54914] animate-spin" />
                    Locating...
                  </>
                ) : (
                  <>
                    <MapPin size={11} strokeWidth={2.5} />
                    Use My Location
                  </>
                )}
              </button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(197,73,20,0.15)' }}>
              <LocationPicker
                onLocationSelect={(location) => setFormData({ ...formData, location })}
                initialLocation={formData.location}
                registerUseMyLocation={(fn) => setUseMyLocation(() => fn)}
                onLocatingChange={setLocating}
                showInMapButton={false}
              />
            </div>
          </div>

          {/* Depth + Passability cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Depth */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Droplets size={13} className="text-blue-500" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b4030' }}>
                  Depth <span style={{ color: '#c54914' }}>*</span>
                </span>
              </div>
              <div className="relative">
                <select
                  required
                  value={formData.depth}
                  onChange={handleDepthChange}
                  className="w-full appearance-none px-3.5 py-3 bg-white border border-[#e2d5cc] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all font-medium text-[13px] pr-8"
                  style={{ color: formData.depth ? '#1a0a00' : '#6b4030' }}
                >
                  <option value="" disabled>Select</option>
                  {DEPTH_OPTIONS.map((depth) => (
                    <option key={depth} value={depth}>{depth}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" color="#6b4030" />
              </div>
            </div>

            {/* Passability */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Navigation size={13} className="text-emerald-500" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b4030' }}>
                  Road Passability <span style={{ color: '#c54914' }}>*</span>
                </span>
              </div>
              <div className="relative">
                <select
                  required
                  value={formData.passability}
                  onChange={(e) => setFormData({ ...formData, passability: e.target.value })}
                  className="w-full appearance-none px-3.5 py-3 bg-white border border-[#e2d5cc] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all font-medium text-[13px] pr-8"
                  style={{ color: formData.passability ? '#1a0a00' : '#6b4030' }}
                >
                  <option value="" disabled>Select</option>
                  {PASSABILITY_OPTIONS.map((option) => {
                    const blocked = isHighDepth && option.value === 'Passable';
                    return (
                      <option key={option.value} value={option.value} disabled={blocked}>
                        {blocked ? `${option.label} — unavailable` : option.label}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" color="#6b4030" />
              </div>
              {isHighDepth && (
                <p className="mt-2 text-[11px] font-semibold" style={{ color: '#c54914' }}>
                  ⚠️ "Passable" unavailable at {formData.depth.toLowerCase()} depth.
                </p>
              )}
            </div>
          </div>

          {/* Description card */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(61,32,16,0.06)', border: '1px solid rgba(61,32,16,0.1)' }}>
                <FileText size={13} style={{ color: '#7a5040' }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b4030' }}>
                Description <span className="font-normal normal-case" style={{ color: '#9a6f55' }}>(optional)</span>
              </span>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-3 bg-white border border-[#e2d5cc] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#c54914]/10 focus:border-[#c54914] transition-all font-medium placeholder-[#9a7060] text-[14px] resize-none"
              style={{ color: '#1a0a00' }}
              placeholder="Describe the flood situation..."
            />
          </div>

          {/* Photos card */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid #e2d5cc' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(197,73,20,0.1)', border: '1px solid rgba(197,73,20,0.2)' }}>
                <Camera size={13} style={{ color: '#c54914' }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b4030' }}>
                Photos <span style={{ color: '#c54914' }}>*</span>
              </span>
              <span className="text-[11px]" style={{ color: '#9a6f55' }}>· Max 3, 5MB each</span>
            </div>
            <label
              className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl cursor-pointer transition-all"
              style={{
                background: photoFiles.length ? 'rgba(197,73,20,0.04)' : 'transparent',
                border: '1.5px dashed rgba(197,73,20,0.25)',
              }}
            >
              <Camera size={20} color="#c54914" strokeWidth={1.8} />
              <span className="text-[13px] font-semibold" style={{ color: '#7a2200' }}>
                {photoFiles.length ? `${photoFiles.length} photo${photoFiles.length > 1 ? 's' : ''} selected` : 'Tap to upload photos'}
              </span>
              {photoFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-0.5">
                  {photoFiles.map((file, idx) => (
                    <span key={idx} className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(197,73,20,0.1)', color: '#7a2200' }}>
                      {file.name.length > 18 ? file.name.slice(0, 16) + '…' : file.name}
                    </span>
                  ))}
                </div>
              )}
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-bold py-3.5 rounded-2xl text-[14px] transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'rgba(197,73,20,0.08)', border: '1px solid rgba(197,73,20,0.18)', color: '#7a2200' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReport.isLoading}
              className="flex-1 text-white font-bold py-3.5 rounded-2xl text-[14px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)', boxShadow: '0 8px 24px rgba(197,73,20,0.30)' }}
            >
              {createReport.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-200 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : 'Submit Report'}
            </button>
          </div>

          <p className="text-[11px] text-center pb-1" style={{ color: '#6b4030' }}>
            {MESSAGES.REPORT_SUCCESS}
          </p>
        </form>
      </div>
    </div>
  );
};

export default ReportSubmissionForm;
