import { useState, memo } from 'react';
import ReportCard from './ReportCard';
import ReportDetailModal from './ReportDetailModal';
import { AlertTriangle, Waves, ChevronDown, Radio } from 'lucide-react';

export const ReportList = ({ reports, loading, error, initialPageSize = 20, pageStep = 20 }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-2 animate-pulse">
          <div className="h-4 w-28 bg-gray-200/80 rounded-full" />
          <div className="h-4 w-16 bg-gray-200/60 rounded-full" />
        </div>
        {/* Card skeletons in 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl overflow-hidden bg-white/50 border border-gray-900/[0.07] animate-pulse">
              {/* Header */}
              <div className="h-32 bg-gray-200/70" />
              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 bg-gray-200/80 rounded-full" />
                  <div className="h-4 w-14 bg-gray-200/50 rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-gray-200/80 rounded-lg" />
                <div className="h-3.5 w-1/3 bg-gray-200/60 rounded-lg" />
                <div className="flex gap-2">
                  <div className="h-6 w-14 bg-gray-200/60 rounded-lg" />
                  <div className="h-6 w-18 bg-gray-200/60 rounded-lg" />
                </div>
                <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200/80" />
                  <div className="h-3 w-20 bg-gray-200/60 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-rose-500/20 rounded-3xl" />
        <div className="relative p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <h3 className="text-base font-black text-gray-900 mb-1.5">Failed to load reports</h3>
          <p className="text-gray-500 text-sm mb-5">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-white/55 backdrop-blur-xl border border-gray-900/[0.07] rounded-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.04] via-transparent to-blue-500/[0.03] rounded-3xl pointer-events-none" />
        <div className="relative py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/15 flex items-center justify-center mx-auto mb-5">
            <Waves className="w-9 h-9 text-orange-400/60" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No Reports Yet</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Be the first to contribute by reporting flood conditions in your area.
          </p>
          <div className="inline-flex items-center gap-2 mt-6 text-xs text-gray-400 bg-gray-900/[0.04] border border-gray-900/[0.06] px-4 py-2 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live community updates
          </div>
        </div>
      </div>
    );
  }

  const visibleReports = Array.isArray(reports) ? reports.slice(0, visibleCount) : [];

  return (
    <>
      {/* List header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">{reports.length} reports</span>
          <span className="w-px h-3.5 bg-gray-300" />
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <Radio className="w-3 h-3 animate-pulse" />
            Live
          </div>
        </div>
        <span className="text-xs text-gray-400">Showing {Math.min(visibleCount, reports.length)} of {reports.length}</span>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleReports.map((report) => (
          <ReportCard key={report._id} report={report} onClick={setSelectedReport} />
        ))}
      </div>

      {visibleCount < (reports?.length || 0) && (
        <div className="flex flex-col items-center mt-8 pt-6 border-t border-gray-900/[0.06]">
          <button
            onClick={() => setVisibleCount((c) => c + pageStep)}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-900/[0.08] hover:border-orange-500/30 text-gray-600 hover:text-orange-600 text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Load More Reports
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </>
  );
};

export default memo(ReportList);
