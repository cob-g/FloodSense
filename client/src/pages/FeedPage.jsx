import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import ReportList from '../components/reports/ReportList';
import SensorDashboard from '../components/sensors/SensorDashboard';
import { useReports } from '../hooks/useReports';
import { useSensors } from '../hooks/useSensors';
import LazyMapView from '../components/map/LazyMapView';
import ReportSubmissionForm from '../components/reports/ReportSubmissionForm';
import { useNetwork } from '../hooks/useNetwork';
import { useFallbacks } from '../hooks/useFallbacks';
import { getFallbacks } from '../lib/idb';
import { useToast } from '../contexts/ToastContext';
import { Map, Radio, Users, Plus, Activity, AlertTriangle, Droplets, Phone, Home, Ambulance, Shield, TrendingUp, CheckCircle, WifiOff, RefreshCw, MapPin, Clock, Database } from 'lucide-react';
import { ReportsChart } from '../components/analytics/ReportsChart';
import { SensorChart } from '../components/analytics/SensorChart';
import { useBlurryReveal } from '../hooks/useBlurryReveal';

const FeedPage = () => {
  const { t } = useTranslation();
  const feedContainerRef = useRef(null);
  useBlurryReveal(feedContainerRef, '.reveal-target');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // Add 'analytics' option

  // Fetch all reports (auto-refresh every 15s) - matching LandingPage
  const {
    data: reportsData,
    isLoading: reportsLoading,
    isFetching: reportsFetching,
    error: reportsError,
    dataUpdatedAt: reportsUpdatedAt,
  } = useReports({}, {
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  // Fetch sensor data (auto-refresh every 15s) - matching LandingPage
  const {
    data: sensorsRes,
    isFetching: sensorsFetching,
    error: sensorsError,
    dataUpdatedAt: sensorsUpdatedAt,
  } = useSensors({ withStatus: true }, {
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  const { online, isSlow } = useNetwork();
  useFallbacks({}, { enabled: online });
  const [offlineItems, setOfflineItems] = useState([]);
  const [forceShowMap, setForceShowMap] = useState(false);
  const toast = useToast();
  const [reachable, setReachable] = useState(true);
  const effectiveOnline = online && reachable;

  // Memoize reports to prevent unnecessary re-renders
  const reports = useMemo(() => {
    return reportsData?.data?.reports || [];
  }, [reportsData?.data?.reports]);

  // Memoize validated reports for the map - matching LandingPage
  const validatedReports = useMemo(() => {
    return Array.isArray(reports) ? reports.filter(r => r.status === 'VALIDATED') : [];
  }, [reports]);

  // Memoize sensor readings - matching LandingPage
  const sensorReadings = useMemo(() => {
    return sensorsRes?.data || [];
  }, [sensorsRes?.data]);

  const mapIsSyncing = reportsFetching || sensorsFetching;
  const lastMapUpdateAt = Math.max(reportsUpdatedAt || 0, sensorsUpdatedAt || 0);
  const mapLastUpdatedLabel = lastMapUpdateAt
    ? new Date(lastMapUpdateAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  // Auto-open report modal when navigated with intent from another page
  useEffect(() => {
    if (location?.state?.openReport) {
      setShowReportForm(true);
      // Clear navigation state so modal doesn't re-open on back/refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Fallback: open modal if a session flag was set before redirect/login
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flag = window.sessionStorage.getItem('openReportAfterLogin');
    if (flag) {
      window.sessionStorage.removeItem('openReportAfterLogin');
      setShowReportForm(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!online) {
      (async () => {
        let list = await getFallbacks();
        if (!list || list.length === 0) {
          try {
            const s = localStorage.getItem('fallbacks_cache');
            list = s ? JSON.parse(s) : [];
          } catch (_) {
            list = [];
          }
        }
        if (mounted) {
          setOfflineItems(Array.isArray(list) ? list : []);
        }
      })();
    } else {
      setOfflineItems([]);
    }
    return () => { mounted = false; };
  }, [online]);

  // Reachability check: detects when connected to LAN/Wi‑Fi but internet/server not reachable
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function check() {
      if (!online) {
        if (!cancelled) setReachable(false);
        return;
      }
      try {
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store', signal: controller.signal });
        clearTimeout(timeout);
        // Any HTTP response means network path is reachable (even 401)
        if (!cancelled) setReachable(true);
      } catch (e) {
        if (!cancelled) setReachable(false);
      }
    }
    check();
    return () => { cancelled = true; controller.abort(); };
  }, [online]);

  if (!effectiveOnline) {
    const handleRefresh = () => {
      // Re-run reachability check then decide
      (async () => {
        const wasOnline = typeof navigator !== 'undefined' && navigator.onLine;
        // Quick ping with timeout
        const controller = new AbortController();
        try {
          const timeout = setTimeout(() => controller.abort(), 4000);
          const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store', signal: controller.signal });
          clearTimeout(timeout);
          setReachable(true);
          if (wasOnline) {
            toast.success('You are back online. Refreshing...');
            window.location.reload();
          } else {
            toast.success('Connection restored. Refreshing...');
            window.location.reload();
          }
        } catch (_) {
          setReachable(false);
          toast.warning('Still offline or no internet access.');
        }
      })();
    };

    return (
      <div className="min-h-screen bg-transparent text-gray-900 overflow-x-hidden">
        {/* Background Orbs — amber tones to signal offline state */}
        <div className="fixed top-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-orange-400/8 rounded-full blur-3xl pointer-events-none"></div>

        {/* Offline Status Banner */}
        <div className="sticky top-0 z-40 bg-amber-50/80 border-b border-amber-200/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-amber-800 font-semibold text-sm">
                  {t('feed.offline.title')} —{' '}
                  <span className="font-normal text-amber-700">{t('feed.offline.subtitle')}</span>
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('feed.offline.retry')}
              </button>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

          {/* Hero Header */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 backdrop-blur-sm">
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-black text-amber-700 tracking-widest uppercase">{t('feed.status.offline')}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black leading-tight">
                  <span className="text-gray-900">{t('feed.title')}</span>
                  <br />
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {t('feed.titleHighlight')}
                  </span>
                </h1>
                <p className="text-base text-gray-900/60 max-w-xl">
                  {t('feed.offline.viewingCached')}
                </p>
              </div>

              <button
                onClick={handleRefresh}
                className="group flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                {t('feed.offline.restoreConnection')}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900/5 backdrop-blur-md rounded-2xl border border-gray-900/10 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">{offlineItems.length}</div>
                <div className="text-gray-900/50 text-sm font-medium">Cached Reports</div>
              </div>
            </div>

            <div className="bg-gray-900/5 backdrop-blur-md rounded-2xl border border-gray-900/10 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">
                  {offlineItems.filter(i => i.status === 'VALIDATED').length}
                </div>
                <div className="text-gray-900/50 text-sm font-medium">Verified Zones</div>
              </div>
            </div>

            <div className="bg-gray-900/5 backdrop-blur-md rounded-2xl border border-gray-900/10 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">
                  {(() => {
                    const ms = Array.isArray(offlineItems)
                      ? offlineItems.reduce((acc, item) => {
                          const d = item?.updatedAt || item?.createdAt;
                          const t = d ? new Date(d).getTime() : 0;
                          return t > acc ? t : acc;
                        }, 0)
                      : 0;
                    return ms
                      ? new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'No data';
                  })()}
                </div>
                <div className="text-gray-900/50 text-sm font-medium">Last Synced</div>
              </div>
            </div>
          </div> */}

          {/* Cached Reports List */}
          <div className="bg-gray-900/5 backdrop-blur-md rounded-3xl border border-gray-900/30 overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-gray-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">{t('feed.offline.cachedReports')}</h2>
                    <p className="text-gray-900/50 text-sm">{offlineItems.length} {t('feed.offline.reportsStored')}</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-700 text-xs font-bold tracking-wide uppercase">
                  {t('feed.status.readOnly')}
                </span>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {offlineItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-900/5 rounded-full flex items-center justify-center mb-6 border border-gray-900/10">
                    <Database className="w-8 h-8 text-gray-900/20" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{t('feed.offline.noCachedData')}</h3>
                  <p className="text-gray-900/50 text-sm max-w-sm mb-6">
                    {t('feed.offline.noCachedMessage')}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('feed.offline.tryReconnect')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1 offline-scrollbar">
                  {offlineItems.map((item) => (
                    <div
                      key={item._id || item.name + (item.address || '')}
                      className="group relative bg-white/60 hover:bg-white/80 border border-gray-900/10 hover:border-orange-500/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* Offline badge */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <span className="text-amber-700 text-xs font-bold tracking-wide">{t('feed.offline.cached')}</span>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Droplets className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0 pr-12">
                          <h3 className="text-gray-900 font-bold text-sm leading-tight truncate">
                            {item.name || 'Flood Report'}
                          </h3>
                          {item.barangay && (
                            <p className="text-gray-900/50 text-xs mt-0.5">Brgy. {item.barangay}</p>
                          )}
                        </div>
                      </div>

                      {(item.address || item.notes) && (
                        <div className="flex items-start gap-2 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-gray-900/30 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900/60 text-xs line-clamp-2">{item.address || item.notes}</span>
                        </div>
                      )}

                      {Array.isArray(item.location?.coordinates) && (
                        <div className="text-xs text-gray-900/30 font-mono mb-3">
                          {item.location.coordinates[1].toFixed(4)}, {item.location.coordinates[0].toFixed(4)}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-900/8">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-700 text-xs font-semibold">{t('feed.offline.verified')}</span>
                        </div>
                        <span className="text-gray-900/30 text-xs">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-900/30 text-xs">
            <WifiOff className="w-3.5 h-3.5" />
            <span>FloodSense • Offline Mode • Data may not reflect current conditions</span>
          </div>
        </div>

        <style>{`
          .offline-scrollbar::-webkit-scrollbar { width: 5px; }
          .offline-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .offline-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
          .offline-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        `}</style>
      </div>
    );
  }

  return (
    <div ref={feedContainerRef} className="min-h-screen bg-transparent text-gray-900 overflow-x-hidden">
      {/* Gradient Orbs Background */}
      <div className="fixed top-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Header Section */}
        <div className="reveal-target mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full px-5 py-2 backdrop-blur-sm">
                <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-sm font-bold text-orange-400 tracking-wide">{t('feed.status.liveMonitoring')}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight">
                <span className="text-gray-900">{t('feed.title')}</span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {t('feed.titleHighlight')}
                </span>
              </h1>
              <p className="text-lg text-gray-900/70 max-w-2xl">
                {t('feed.subtitle')}
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  navigate('/auth/login', { state: { from: location } });
                  return;
                }
                setShowReportForm(true);
              }}
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-gray-50 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:scale-105 flex items-center space-x-3"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>{t('feed.submitReport')}</span>
            </button>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        <div className="mb-10">
          <div data-reveal-mode="blur-only" className="reveal-target flex flex-wrap gap-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-900/30 p-3">
          
            {[
              { id: 'map', label: t('feed.tabs.liveMap'), icon: Map, color: 'from-orange-500 to-red-500' },
              { id: 'analytics', label: t('feed.tabs.analytics'), icon: TrendingUp, color: 'from-orange-500 to-red-500' },
              { id: 'sensors', label: t('feed.tabs.sensors'), icon: Radio, color: 'from-orange-500 to-red-500' },
              { id: 'reports', label: t('feed.tabs.reports'), icon: Users, color: 'from-orange-500 to-red-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 font-semibold ${activeTab === tab.id
                  ? 'text-gray-50 scale-105 shadow-xl'
                  : 'text-gray-900 hover:text-gray-900 hover:bg-white/5'
                  }`}
              >
                {activeTab === tab.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl opacity-100`}></div>
                )}
                <tab.icon className="relative z-10 w-5 h-5" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid - Tab-based Display */}
        <div className={`reveal-target grid grid-cols-1 gap-6 lg:gap-8 ${activeTab !== 'reports' ? 'xl:grid-cols-12' : ''}`}>
          {/* Main Content Area */}
          <div className={`space-y-6 ${activeTab !== 'reports' ? 'xl:col-span-8' : ''}`}>

            {/* Live Map Section */}
            {activeTab === 'map' && (
              <div className="bg-gray-900/5 backdrop-blur-md rounded-3xl border border-gray-900/30 overflow-hidden transform transition-all duration-500 hover:border-orange-500/30">
                <div className="p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Map className="w-7 h-7 text-gray-50" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">{t('feed.liveMap.title')}</h2>
                        <p className="text-gray-900/60 text-sm">{t('feed.liveMap.subtitle')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                        <span className="text-green-400 text-sm font-semibold">{t('feed.liveMap.live')}</span>
                      </div>
                      <div className="text-xs text-gray-900/60">
                        {mapIsSyncing
                          ? 'Syncing live map data...'
                          : mapLastUpdatedLabel
                          ? `Last updated ${mapLastUpdatedLabel}`
                          : 'Waiting for first sync'}
                      </div>
                    </div>
                  </div>

                  {(reportsError || sensorsError) && (
                    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
                      Live map refresh is temporarily unavailable: {reportsError?.message || sensorsError?.message || 'Failed to fetch latest map data.'}
                    </div>
                  )}

                  <div className="h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {(!online || (isSlow && !forceShowMap)) ? (
                      <div className="h-full flex items-center justify-center text-center p-8 bg-gradient-to-br from-white/5 to-white/10">
                        <div className="max-w-md space-y-4">
                          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-10 h-10 text-amber-500" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">{t('feed.liveMap.slowConnection.title')}</h3>
                          <p className="text-gray-900/70">
                            {t('feed.liveMap.slowConnection.message')}
                          </p>
                          <button
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-gray-900 font-bold transition-all duration-300 hover:scale-105"
                            onClick={() => setForceShowMap(true)}
                          >
                            {t('feed.liveMap.slowConnection.loadAnyway')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <LazyMapView
                        reports={validatedReports}
                        sensors={sensorReadings}
                        onMarkerClick={(report) => console.log('Clicked report:', report)}
                        height="100%"
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section - NEW */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <ReportsChart reports={reports} />
                <SensorChart sensorData={sensorReadings} />
              </div>
            )}

            {/* Sensors Section */}
            {activeTab === 'sensors' && (
              <div className="bg-gray-900/5 backdrop-blur-md rounded-3xl border border-gray-900/30 overflow-hidden transform transition-all duration-500 hover:border-orange-500/30">
                <div className="p-6 lg:p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Radio className="w-7 h-7 text-gray-50" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">{t('feed.sensors.title')}</h2>
                      <p className="text-gray-900/60 text-sm">{t('feed.sensors.subtitle')}</p>
                    </div>
                  </div>

                  <SensorDashboard />
                </div>
              </div>
            )}

            {/* Community Reports Section */}
            {activeTab === 'reports' && (
              <div className="bg-gray-900/5 backdrop-blur-md rounded-3xl border border-gray-900/30 overflow-hidden transform transition-all duration-500 hover:border-orange-500/30">
                <div className="p-6 lg:p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-gray-50" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">{t('feed.communityReports.title')}</h2>
                      <p className="text-gray-900/60 text-sm">{t('feed.communityReports.subtitle')}</p>
                    </div>
                  </div>

                  <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    <ReportList
                      reports={reports}
                      loading={reportsLoading}
                      error={reportsError}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Stats & Quick Actions (hidden on Community Reports tab) */}
          {activeTab !== 'reports' && (
            <div className="xl:col-span-4 space-y-6">

              {/* Quick Stats Card */}
              <div className="bg-gray-900/5 backdrop-blur-md rounded-3xl border border-gray-900/30 p-6 lg:p-8 transform transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/40">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-50" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{t('feed.stats.quickStats') || 'Quick Stats'}</h3>
                </div>

                <div className="space-y-4">
                  <div className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold">{t('feed.stats.verifiedReports')}</div>
                          <div className="text-gray-900/60 text-sm">{t('feed.stats.today')}</div>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-gray-900">{validatedReports.length}</div>
                    </div>
                  </div>

                  <div className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <AlertTriangle className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold">{t('feed.stats.activeAlerts')}</div>
                          <div className="text-gray-900/60 text-sm">{t('feed.stats.needsAttention')}</div>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-gray-900">
                        {validatedReports.filter(r => r.passability === 'NotPassable').length}
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Droplets className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold">{t('feed.stats.sensorsOnline')}</div>
                          <div className="text-gray-900/60 text-sm">{t('feed.stats.monitoring')}</div>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-gray-900">{sensorReadings.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts Card */}
              <div className="bg-gray-900/5 backdrop-blur-md rounded-3xl border border-gray-900/30 p-6 lg:p-8 transform transition-all duration-300 hover:border-red-500/30">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-gray-50" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{t('feed.emergency.title')}</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { name: t('feed.emergency.barangay'), number: '(02) 8282-1234', icon: Home },
                    { name: t('feed.emergency.rescue'), number: '(02) 8282-5678', icon: Shield },
                    { name: t('feed.emergency.medical'), number: '(02) 8282-9012', icon: Ambulance }
                  ].map((contact, index) => (
                    <button
                      key={index}
                      className="w-full p-4 bg-white/5 hover:bg-red-500/10 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <contact.icon className="w-5 h-5 text-gray-900/70" />
                          <div>
                            <div className="text-gray-900 font-bold text-sm">{contact.name}</div>
                            <div className="text-gray-900/60 text-xs">{contact.number}</div>
                          </div>
                        </div>
                        <div className="w-10 h-10 bg-red-500/10 group-hover:bg-red-500/20 rounded-lg flex items-center justify-center transition-colors">
                          <Phone className="w-5 h-5 text-red-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    {t('feed.emergency.warningText')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Submission Modal */}
      {showReportForm && (
        <ReportSubmissionForm
          onClose={() => setShowReportForm(false)}
          onSuccess={() => {
            setShowReportForm(false);
          }}
        />
      )}


    </div>
  );
};

export default FeedPage;