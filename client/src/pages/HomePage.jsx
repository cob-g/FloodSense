import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useReports, useInfiniteReports } from '../hooks/useReports';
import { useToast } from '../contexts/ToastContext';
import { useFallbacks } from '../hooks/useFallbacks';
import { MESSAGES } from '../utils/constants';
import { getFallbacks as idbGetFallbacks } from '../lib/idb';
import { api } from '../services/api';
import ReportList from '../components/reports/ReportList';
import MapView from '../components/map/MapView';
import ReportSubmissionForm from '../components/reports/ReportSubmissionForm';

export const HomePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [offline, setOffline] = useState(!navigator.onLine);
  // Debounce network toasts
  const netToastShownRef = useRef({ offline: false, online: false });
  const [cachedFallbacks, setCachedFallbacks] = useState([]);
  const offlineFallbacks = useMemo(() => {
    const arr = Array.isArray(cachedFallbacks) ? cachedFallbacks.slice() : [];
    return arr.sort((a, b) => {
      const pa = Number.isFinite(a?.priority) ? a.priority : 0;
      const pb = Number.isFinite(b?.priority) ? b.priority : 0;
      if (pb !== pa) return pb - pa;
      const ba = (a?.barangay || '').localeCompare(b?.barangay || '');
      if (ba !== 0) return ba;
      return (a?.name || '').localeCompare(b?.name || '');
    });
  }, [cachedFallbacks]);
  
  // Infinite paginated recent reports for the feed
  const {
    data: pagesData,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteReports(
    { status: filter === 'all' ? undefined : filter.toUpperCase() },
    pageSize
  );

  // Dedicated query for confirmed (validated) reports to show on the map
  const { data: validatedData, isLoading: mapLoading } = useReports({
    status: 'VALIDATED',
    limit: 200,
  });

  const reports = useMemo(
    () => (pagesData?.pages || []).flatMap((p) => p?.data?.reports || []),
    [pagesData]
  );
  const validatedReports = validatedData?.data?.reports || [];

  useFallbacks({}, { enabled: !offline });

  const refreshOfflineData = async () => {
    // Prefer IndexedDB; fall back to localStorage
    try {
      const idbList = await idbGetFallbacks();
      if (Array.isArray(idbList) && idbList.length) {
        setCachedFallbacks(idbList);
        return;
      }
    } catch (_) {
      // ignore and try localStorage
    }
    try {
      const raw = localStorage.getItem('fallbacks_cache');
      const parsed = raw ? JSON.parse(raw) : [];
      setCachedFallbacks(Array.isArray(parsed) ? parsed : []);
    } catch (_) {
      setCachedFallbacks([]);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      if (!netToastShownRef.current.online) {
        toast.info(MESSAGES.NETWORK_RESTORED);
        netToastShownRef.current.online = true;
      }
      // reset offline flag so a future offline will notify
      netToastShownRef.current.offline = false;
    };
    const handleOffline = () => {
      setOffline(true);
      refreshOfflineData();
      if (!netToastShownRef.current.offline) {
        toast.warning(MESSAGES.OFFLINE_WARNING);
        netToastShownRef.current.offline = true;
      }
      // reset online flag so a future online will notify
      netToastShownRef.current.online = false;
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) {
      handleOffline();
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const attemptReconnect = async () => {
    try {
      await api.get('/ping');
      setOffline(false);
      toast.info(MESSAGES.NETWORK_RESTORED);
    } catch (e) {
      toast.warning('Still offline. Please check your connection.');
    }
  };

  if (offline) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-6xl mx-auto pt-16">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-white to-light-orange bg-clip-text text-transparent">
              Offline Mode
            </h1>
            <p className="text-medium-gray text-lg">Some features are unavailable. Showing verified flood spots saved on your device.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6 flex flex-wrap items-center gap-3 justify-between">
            <div className="text-white/80">You are currently offline. Data shown below is cached.</div>
            <div className="flex gap-2">
              <button onClick={refreshOfflineData} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">Refresh Cache</button>
              <button onClick={attemptReconnect} className="px-4 py-2 bg-accent-orange hover:bg-bright-orange text-space-black font-semibold rounded-lg">Retry Connection</button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-black text-white">Verified Flood Spots (Offline)</h2>
              <p className="text-white/60 mt-1 text-sm">Sorted by priority, then barangay and name</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-white/70">Name</th>
                    <th className="px-4 py-3 text-left text-sm text-white/70">Barangay</th>
                    <th className="px-4 py-3 text-left text-sm text-white/70">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {offlineFallbacks.length === 0 && (
                    <tr><td className="px-4 py-6 text-white/70" colSpan={3}>No cached flood spots yet. Go online to fetch data.</td></tr>
                  )}
                  {offlineFallbacks.map((i) => (
                    <tr key={i._id || `${i.name}-${i.barangay}`} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-white">{i.name}</td>
                      <td className="px-4 py-3 text-white/80">{i.barangay}</td>
                      <td className="px-4 py-3 text-white/80">{i.priority ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto">
        {/* Header with Gradient Text */}
        <div className="text-center mb-12 relative pt-16">
          <div className="relative z-10">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white to-light-orange bg-clip-text text-transparent">
              FloodSense Feed
            </h1>
            <p className="text-medium-gray text-xl tracking-wide uppercase">REAL-TIME FLOOD REPORTS</p>
          </div>
          
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
            <div className="absolute top-20 left-20 w-40 h-40 bg-accent-orange/10 rounded-full blur-3xl"></div>
            <div className="absolute top-10 right-20 w-32 h-32 bg-accent-orange/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Stats Cards - Glassmorphism Design */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:border-accent-orange transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="text-4xl font-black text-white mb-2">{reports.length}</div>
            <div className="text-medium-gray text-sm uppercase tracking-wider font-semibold">Total Reports</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:border-bright-orange transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="text-4xl font-black text-white mb-2">
              {reports.filter(r => r.status === 'VALIDATED').length}
            </div>
            <div className="text-medium-gray text-sm uppercase tracking-wider font-semibold">Validated Reports</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:border-light-orange transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="text-4xl font-black text-white mb-2">
              {reports.filter(r => r.status === 'UNVERIFIED').length}
            </div>
            <div className="text-medium-gray text-sm uppercase tracking-wider font-semibold">Pending Reports</div>
          </div>
        </div> */}

        {/* Map Section - Confirmed (Validated) Flood Reports */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-material p-4 mb-8">
          <h2 className="text-xl font-bold mb-3 bg-[linear-gradient(to_right,_#f97316_50%,_white_50%)] bg-clip-text text-transparent">
            Confirmed Flood Map
          </h2>
          <div className="w-full h-[420px] rounded-xl overflow-hidden">
            <MapView reports={validatedReports} className="h-full" />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-3">Filter Reports</h2>
            <p className="text-medium-gray">Essential flood intelligence when you need it most</p>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap border ${
                filter === 'all'
                  ? 'bg-accent-orange text-space-black border-accent-orange shadow-lg'
                  : 'bg-white/5 text-white border-white/10 hover:border-accent-orange hover:bg-white/10'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setFilter('validated')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap border ${
                filter === 'validated'
                  ? 'bg-accent-orange text-space-black border-accent-orange shadow-lg'
                  : 'bg-white/5 text-white border-white/10 hover:border-accent-orange hover:bg-white/10'
              }`}
            >
              Validated
            </button>
            <button
              onClick={() => setFilter('unverified')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap border ${
                filter === 'unverified'
                  ? 'bg-accent-orange text-space-black border-accent-orange shadow-lg'
                  : 'bg-white/5 text-white border-white/10 hover:border-accent-orange hover:bg-white/10'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-3">Recent Reports</h2>
            <p className="text-medium-gray">Community flood monitoring updates</p>
          </div>
          {/* List Controls */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="text-white/70 text-sm">Showing {reports.length} items</div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const next = parseInt(e.target.value, 10);
                  setPageSize(next);
                }}
                className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>
          {/* Separator */}
          <div className="border-t border-white/10 my-6"></div>
          <ReportList reports={reports} loading={isLoading} error={error} />
          {/* Pagination Controls */}
          <div className="mt-6 flex justify-center">
            {hasNextPage ? (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-5 py-2 rounded-lg bg-accent-orange text-space-black font-semibold disabled:opacity-60 disabled:cursor-not-allowed border border-white/10"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            ) : (
              <span className="text-white/50 text-sm">End of list</span>
            )}
          </div>
        </div>

        {/* Enhanced Floating Action Button - visible only for non-admin users */}
        {!isAdmin && (
          <button
            onClick={() => setShowSubmitForm(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-accent-orange/90 hover:bg-accent-orange backdrop-blur-lg text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-accent-orange/50 hover:transform hover:-translate-y-1 border border-white/20 hover:border-accent-orange/50 group"
            title="Submit Flood Report"
          >
            <svg
              className="w-7 h-7 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}

        {/* Submit Form Modal - only for non-admin users */}
        {!isAdmin && showSubmitForm && (
          <ReportSubmissionForm
            onClose={() => setShowSubmitForm(false)}
            onSuccess={() => {
              setShowSubmitForm(false);
              toast.success('Salamat sa ulat! Ipe-validate ng Barangay DRRM Officer.');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;