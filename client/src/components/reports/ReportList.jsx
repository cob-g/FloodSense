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
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-3 pt-2">
                  <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load reports</h3>
        <p className="text-gray-600 text-sm mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#c54914] hover:bg-[#a03d11] text-white transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 mb-6">
          <svg className="w-10 h-10 text-[#c54914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">No Reports Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Be the first to contribute by reporting flood conditions in your area. Your reports help keep the community safe.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Real-time community updates</span>
        </div>
      </div>
    );
  }

  const visibleReports = Array.isArray(reports) ? reports.slice(0, visibleCount) : [];

  return (
    <>
      <div className="space-y-4">
        {visibleReports.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            onClick={setSelectedReport}
          />
        ))}
      </div>

      {visibleCount < (reports?.length || 0) && (
        <div className="flex flex-col items-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Showing {visibleCount} of {reports.length} reports
          </p>
          <button
            onClick={() => setVisibleCount((c) => c + pageStep)}
            className="group relative px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 bg-gradient-to-r from-[#c54914] to-[#a03d11] hover:shadow-lg hover:scale-105 active:scale-100"
          >
            <span className="flex items-center gap-2">
              Load More Reports
              <svg 
                className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
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