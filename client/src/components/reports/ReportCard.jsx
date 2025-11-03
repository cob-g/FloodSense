import { formatRelativeTime, getSeverityColor } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';
import { memo } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const ReportCard = ({ report, onClick }) => {
  const statusColors = { 
    UNVERIFIED: 'border-l-amber-500/50',
    VALIDATED: 'border-l-green-500/50',
    REJECTED: 'border-1-red-500/10',
  };

  const statusBadges = {
    UNVERIFIED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    VALIDATED: 'bg-green-500/10 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const severityColors = {
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    MODERATE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    SEVERE: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <div
      onClick={() => onClick?.(report)}
      className={`bg-space-800/50 backdrop-blur-md rounded-xl shadow-lg border-l-4 ${statusColors[report.status]} border border-white/5 p-5 cursor-pointer hover:bg-space-800/70 hover:border-accent/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '160px 120px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${severityColors[report.severity]}`}>
              {report.severity}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusBadges[report.status]}`}>
              {STATUS_LABELS[report.status]}
            </span>
            <span className="text-xs text-white/50">
              {formatRelativeTime(report.createdAt)}
            </span>
          </div>
          <h3 className="font-bold text-white text-base mb-1 group-hover:text-accent transition-colors">
            {report.location?.address || 'Unknown Location'}
          </h3>
          <p className="text-xs text-white/60 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {report.barangay}
          </p>
        </div>
        
        {report.photos?.[0] && (
          <div className="relative ml-3 flex-shrink-0">
            <img
              src={`${BASE_URL}/uploads/${report.photos[0]}`}
              alt="Flood"
              className="w-20 h-20 rounded-lg object-cover ring-2 ring-white/10 group-hover:ring-accent/30 transition-all"
              loading="lazy"
              decoding="async"
              width="80"
              height="80"
            />
            {report.photos.length > 1 && (
              <div className="absolute -bottom-1.5 -right-1.5 bg-accent/90 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {report.photos.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <span className="text-xs text-white/50 block mb-1">Water Depth</span>
          <span className="font-bold text-white text-sm">{report.depth}</span>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <span className="text-xs text-white/50 block mb-1">Passability</span>
          <span className="font-bold text-white text-sm">{report.passability}</span>
        </div>
      </div>

      {/* Description */}
      {report.description && (
        <div className="mb-4">
          <p className="text-sm text-white/70 line-clamp-2 bg-white/5 rounded-lg p-3 border border-white/5">
            {report.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center ring-2 ring-accent/20">
            <span className="text-xs font-bold text-accent">
              {report.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-xs text-white/70 font-medium">{report.user?.name || 'Anonymous'}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-white/50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default memo(ReportCard);
