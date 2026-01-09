import { formatRelativeTime, getSeverityColor } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';
import { memo } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const ReportCard = ({ report, onClick }) => {
  const statusColors = { 
    UNVERIFIED: 'from-amber-400/30 to-amber-500/20',
    VALIDATED: 'from-emerald-400/30 to-emerald-500/20',
    REJECTED: 'from-rose-400/30 to-rose-500/20',
  };

  const statusBadges = {
    UNVERIFIED: 'bg-white/90 text-amber-700 backdrop-blur-sm',
    VALIDATED: 'bg-white/90 text-emerald-700 backdrop-blur-sm',
    REJECTED: 'bg-white/90 text-rose-700 backdrop-blur-sm',
  };

  const severityIndicators = {
    LOW: 'bg-blue-500',
    MODERATE: 'bg-amber-500',
    HIGH: 'bg-orange-600',
    SEVERE: 'bg-rose-600',
  };

  return (
    <div
      onClick={() => onClick?.(report)}
      className="relative bg-gradient-to-br from-[#c54914] to-[#a03d11] rounded-2xl shadow-lg border border-[#d35a1a] p-6 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group overflow-hidden"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '160px 120px' }}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
      
      {/* Status gradient indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusColors[report.status]} backdrop-blur-sm`}></div>
      
      {/* Severity dot indicator */}
      <div className="absolute top-5 left-5">
        <div className={`w-2.5 h-2.5 rounded-full ${severityIndicators[report.severity]} shadow-lg`}></div>
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4 pl-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-semibold ${statusBadges[report.status]} shadow-sm`}>
              {STATUS_LABELS[report.status]}
            </span>
            <span className="text-xs text-white/80 font-medium">
              {formatRelativeTime(report.createdAt)}
            </span>
          </div>
          <h3 className="font-bold text-white text-lg mb-2 group-hover:text-white/90 transition-colors leading-tight">
            {report.location?.address || 'Unknown Location'}
          </h3>
          <p className="text-sm text-white/80 flex items-center gap-2">
            <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {report.barangay}
          </p>
        </div>
        
        {report.photos?.[0] && (
          <div className="relative ml-4 flex-shrink-0">
            <img
              src={`${BASE_URL}/uploads/${report.photos[0]}`}
              alt="Flood"
              className="w-24 h-24 rounded-xl object-cover border-2 border-white/30 group-hover:border-white/60 transition-all shadow-lg"
              loading="lazy"
              decoding="async"
              width="96"
              height="96"
            />
            {report.photos.length > 1 && (
              <div className="absolute -bottom-2 -right-2 bg-white text-[#c54914] text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                +{report.photos.length - 1}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="relative grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
          <span className="text-[10px] text-white/70 block mb-1 font-medium uppercase tracking-wider">Water Depth</span>
          <span className="font-bold text-white text-base">{report.depth}</span>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
          <span className="text-[10px] text-white/70 block mb-1 font-medium uppercase tracking-wider">Passability</span>
          <span className="font-bold text-white text-base">{report.passability}</span>
        </div>
      </div>

      {/* Description */}
      {report.description && (
        <div className="relative mb-4">
          <p className="text-sm text-white/90 line-clamp-2 bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            {report.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="relative flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-white/40">
            <span className="text-sm font-bold text-[#c54914]">
              {report.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm text-white font-medium">{report.user?.name || 'Anonymous'}</span>
        </div>
        
        <div className="flex items-center gap-1 text-white/90 group-hover:translate-x-1 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default memo(ReportCard);
