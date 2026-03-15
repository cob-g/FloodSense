import { formatRelativeTime } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';
import { memo } from 'react';
import { MapPin, ArrowUpRight, Droplets, Waves } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const severityConfig = {
  Low:      { header: 'from-blue-400 via-cyan-400 to-blue-500',      chip: 'bg-blue-500/20 text-blue-100 border-blue-300/30',   dot: 'bg-blue-300',    glow: 'shadow-blue-500/20'   },
  Medium:   { header: 'from-amber-400 via-yellow-400 to-orange-400', chip: 'bg-amber-500/20 text-amber-100 border-amber-300/30', dot: 'bg-amber-300',   glow: 'shadow-amber-500/20'  },
  High:     { header: 'from-orange-500 via-red-400 to-orange-600',   chip: 'bg-orange-500/20 text-orange-100 border-orange-300/30', dot: 'bg-orange-300', glow: 'shadow-orange-500/25' },
  Critical: { header: 'from-rose-600 via-red-500 to-rose-700',       chip: 'bg-rose-500/20 text-rose-100 border-rose-300/30',   dot: 'bg-rose-300',    glow: 'shadow-rose-500/30'   },
};

const statusConfig = {
  UNVERIFIED: { label: STATUS_LABELS.UNVERIFIED, style: 'bg-amber-400/20 text-amber-900 border-amber-300/50 backdrop-blur-md',   dot: 'bg-amber-500', pulse: false },
  VALIDATED:  { label: STATUS_LABELS.VALIDATED,  style: 'bg-emerald-400/25 text-emerald-900 border-emerald-300/50 backdrop-blur-md', dot: 'bg-emerald-500', pulse: true  },
  REJECTED:   { label: STATUS_LABELS.REJECTED,   style: 'bg-rose-400/20 text-rose-900 border-rose-300/50 backdrop-blur-md',    dot: 'bg-rose-500',    pulse: false },
};

const passLabel = { Passable: 'Passable', HeavyOnly: 'Heavy only', NotPassable: 'Blocked' };

export const ReportCard = ({ report, onClick }) => {
  const sev  = severityConfig[report.severity]  || severityConfig.Low;
  const stat = statusConfig[report.status]      || statusConfig.UNVERIFIED;
  const hasPhoto = !!report.photos?.[0];

  return (
    <div
      onClick={() => onClick?.(report)}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${sev.glow} bg-white/60 backdrop-blur-xl border border-white/70 hover:border-white/90`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '240px 160px' }}
    >
      {/* ── Header: photo or gradient ── */}
      <div className="relative h-32 overflow-hidden">
        {hasPhoto ? (
          <>
            <img
              src={`${BASE_URL}/uploads/${report.photos[0]}`}
              alt="Flood"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${sev.header}`} />
            {/* Decorative wave pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full border-4 border-white" />
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-4 border-white" />
              <div className="absolute top-4 left-1/3 w-16 h-16 rounded-full border-2 border-white" />
            </div>
            {/* Centered icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Waves className="w-12 h-12 text-white/30" strokeWidth={1.5} />
            </div>
          </>
        )}

        {/* Extra photo count badge */}
        {report.photos?.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20">
            +{report.photos.length - 1} photos
          </div>
        )}

        {/* Severity chip — bottom left of header */}
        <div className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${sev.chip}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
          {report.severity}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4">

        {/* Status + time row */}
        <div className="flex items-center justify-between mb-2.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${stat.style}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} ${stat.pulse ? 'animate-pulse' : ''}`} />
            {stat.label}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">{formatRelativeTime(report.createdAt)}</span>
        </div>

        {/* Location */}
        <h3 className="font-black text-gray-900 text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {report.location?.address || 'Unknown Location'}
        </h3>

        {/* Barangay */}
        <div className="flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">Brgy. {report.barangay}</span>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mb-3 flex-wrap">
          <span className="bg-gray-900/[0.05] border border-gray-900/[0.07] rounded-lg px-2.5 py-1">
            {report.depth}
          </span>
          <span className="text-gray-300">·</span>
          <span className={`rounded-lg px-2.5 py-1 border font-bold ${
            report.passability === 'Passable'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
            report.passability === 'HeavyOnly'  ? 'bg-amber-50 text-amber-700 border-amber-200/60'       :
                                                  'bg-rose-50 text-rose-700 border-rose-200/60'
          }`}>
            {passLabel[report.passability] || report.passability}
          </span>
        </div>

        {/* Description */}
        {report.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 italic">
            "{report.description}"
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-900/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ring-2 ring-white shadow-sm flex-shrink-0">
              <span className="text-[10px] font-black text-white select-none">
                {report.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium truncate">{report.user?.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-orange-500 transition-colors duration-300 flex-shrink-0">
            View
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ReportCard);
