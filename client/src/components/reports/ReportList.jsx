import { useState, memo } from 'react';
import ReportCard from './ReportCard';
import ReportDetailModal from './ReportDetailModal';

export const ReportList = ({ reports, loading, error, initialPageSize = 20, pageStep = 20 }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 text-center">
        <p className="text-danger-700">Failed to load reports</p>
        <p className="text-sm text-danger-600 mt-1">{error.message}</p>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-transparent rounded-xl shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No reports yet</h3>
        <p className="text-neutral-600">Be the first to report flood conditions in your area</p>
      </div>
    );
  }

  const visibleReports = Array.isArray(reports) ? reports.slice(0, visibleCount) : [];

  return (
    <>
      <div className="space-y-4 will-change-auto">
        {visibleReports.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            onClick={setSelectedReport}
          />
        ))}
      </div>

      {visibleCount < (reports?.length || 0) && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount((c) => c + pageStep)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 transition-colors"
          >
            Load more ({visibleCount}/{reports.length})
          </button>
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
};

export default memo(ReportList);
