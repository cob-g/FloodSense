import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ReportList from '../components/reports/ReportList';
import SensorDashboard from '../components/sensors/SensorDashboard';
import { useReports } from '../hooks/useReports';
import { useSensors } from '../hooks/useSensors';
import { MapView } from '../components/map/MapView';
import ReportSubmissionForm from '../components/reports/ReportSubmissionForm';
import { useNetwork } from '../hooks/useNetwork';
import { useFallbacks } from '../hooks/useFallbacks';
import { getFallbacks } from '../lib/idb';
import { useToast } from '../contexts/ToastContext';
import { Map, Radio, Users, Plus, Activity, AlertTriangle, Droplets, Phone, Home, Ambulance, Shield, TrendingUp, CheckCircle } from 'lucide-react';

const FeedPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'sensors', 'reports'

  // Fetch all reports (auto-refresh every 30s) - matching LandingPage
  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useReports({}, {
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  // Fetch sensor data (auto-refresh every 30s) - matching LandingPage
  const { data: sensorsRes } = useSensors({ withStatus: true }, {
    refetchInterval: 30000,
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
<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-cyan-600/10 to-blue-500/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-0 w-48 h-48 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-full blur-2xl"></div>
  </div>

  <div className="relative max-w-6xl mx-auto p-4 lg:p-6">
    
    {/* Header Section - Split Layout */}
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
      {/* Left: Logo & Title */}
      <div className="flex-1">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full border-2 border-slate-950"></div>
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-light bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Flood Zone Archive
            </h1>
            <p className="text-white/40 text-sm">Locally stored flood data</p>
          </div>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
              <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <div className="text-white/90 font-medium">Local Cache</div>
              <div className="text-white/40 text-sm">Offline Mode</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          className="px-4 py-2.5 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    {/* Main Dashboard Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Left Column - Stats & Info */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Stats Cards - Vertical Stack */}
        <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-white font-medium mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Cache Statistics
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl p-5 border border-cyan-500/20 backdrop-blur-sm">
              <div className="text-3xl font-light text-cyan-300 mb-1">{offlineItems.length}</div>
              <div className="text-white/60 text-sm">Active Zones</div>
              <div className="mt-2 w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, offlineItems.length * 10)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-5 border border-emerald-500/20 backdrop-blur-sm">
              <div className="text-3xl font-light text-emerald-300 mb-1">100%</div>
              <div className="text-white/60 text-sm">Verification Rate</div>
              <div className="mt-2 w-full h-1 bg-slate-800/50 rounded-full">
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Info */}
        <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-medium mb-4">Cache Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Last Updated</span>
              <span className="text-white/90 font-medium">
                {(() => {
                  const ms = Array.isArray(offlineItems)
                    ? offlineItems.reduce((acc, item) => {
                        const d = item?.updatedAt || item?.createdAt;
                        const t = d ? new Date(d).getTime() : 0;
                        return t > acc ? t : acc;
                      }, 0)
                    : 0;

                  return ms ? new Date(ms).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Never';
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Storage Mode</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-cyan-300 text-sm border border-white/10">
                Offline
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Data Integrity</span>
              <span className="text-emerald-400 font-medium">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Flood Items List */}
      <div className="lg:col-span-2">
        <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-medium text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Cached Flood Zones
              <span className="text-white/40 font-normal text-sm ml-2">
                ({offlineItems.length} items)
              </span>
            </h2>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
              <span className="text-white/40 text-sm">Live Cache</span>
            </div>
          </div>

          {/* Flood Items Container */}
          <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {offlineItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full -z-10"></div>
                </div>
                <h3 className="text-xl font-light text-white mb-2">No Cache Available</h3>
                <p className="text-white/40 text-sm mb-6 max-w-sm text-center">
                  Connect to sync the latest flood zone data
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 rounded-xl text-sm transition-all duration-200"
                >
                  Sync Data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offlineItems.map((item) => (
                  <div
                    key={item._id || item.name + (item.address || '')}
                    className="group relative bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-2px] backdrop-blur-sm"
                  >
                    {/* Left accent line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full"></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-white font-medium">
                            {item.name || 'Flood Area'}
                          </h3>
                          <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-full">
                            CACHED
                          </span>
                        </div>

                        <div className="space-y-2">
                          {item.barangay && (
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <span className="text-white/50">◉</span>
                              <span className="truncate">Barangay {item.barangay}</span>
                            </div>
                          )}

                          {(item.address || item.notes) && (
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                              <span className="text-white/50">📍</span>
                              <span className="truncate">{item.address || item.notes}</span>
                            </div>
                          )}

                          {Array.isArray(item.location?.coordinates) && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-white/40">Coordinates:</span>
                                <div className="text-white/40 font-mono">
                                  {item.location.coordinates[1].toFixed(4)}, {item.location.coordinates[0].toFixed(4)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Bar */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-cyan-300 text-sm font-medium">Verified Flood</span>
                        </div>
                        <span className="text-xs text-white/30">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-white/30 text-sm">
          Flood Zone Archive • Offline Data Repository
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-white/40 text-sm">
            <span className="text-cyan-300">{offlineItems.length}</span> zones cached
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="text-white/30 text-sm">
            Last sync: {(() => {
              const ms = Array.isArray(offlineItems)
                ? offlineItems.reduce((acc, item) => {
                    const d = item?.updatedAt || item?.createdAt;
                    const t = d ? new Date(d).getTime() : 0;
                    return t > acc ? t : acc;
                  }, 0)
                : 0;

              return ms ? new Date(ms).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              }) : 'N/A';
            })()}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Custom Scrollbar Styles */}
  <style jsx>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #22d3ee, #3b82f6);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, #06b6d4, #2563eb);
    }
  `}</style>
</div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden">
      {/* Gradient Orbs Background */}
      <div className="fixed top-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full px-5 py-2 backdrop-blur-sm">
                <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-sm font-bold text-orange-400 tracking-wide">LIVE MONITORING</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight">
                <span className="text-white">Flood Intelligence</span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-lg text-white/70 max-w-2xl">
                Monitor real-time flood conditions, sensor data, and community reports across North Caloocan in one unified dashboard.
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
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:scale-105 flex items-center space-x-3"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Submit Report</span>
            </button>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3">
          
            {[
              { id: 'map', label: 'Live Map', icon: Map, color: 'from-orange-500 to-red-500' },
              { id: 'sensors', label: 'Sensor Network', icon: Radio, color: 'from-orange-500 to-red-500' },
              { id: 'reports', label: 'Community Reports', icon: Users, color: 'from-orange-500 to-red-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 font-semibold ${activeTab === tab.id
                  ? 'text-white scale-105 shadow-xl'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-6">

            {/* Live Map Section */}
            {activeTab === 'map' && (
              <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden transform transition-all duration-500 hover:border-orange-500/30">
                <div className="p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Map className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Live Flood Map</h2>
                        <p className="text-white/60 text-sm">Interactive map showing validated flood zones and sensor locations</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                      <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                      <span className="text-green-400 text-sm font-semibold">Live</span>
                    </div>
                  </div>

                  <div className="h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {(!online || (isSlow && !forceShowMap)) ? (
                      <div className="h-full flex items-center justify-center text-center p-8 bg-gradient-to-br from-white/5 to-white/10">
                        <div className="max-w-md space-y-4">
                          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-10 h-10 text-amber-500" />
                          </div>
                          <h3 className="text-2xl font-bold text-white">Slow Connection Detected</h3>
                          <p className="text-white/70">
                            The live map is temporarily hidden to improve performance. You can still view it, but loading may be slow.
                          </p>
                          <button
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold transition-all duration-300 hover:scale-105"
                            onClick={() => setForceShowMap(true)}
                          >
                            Load Map Anyway
                          </button>
                        </div>
                      </div>
                    ) : (
                      <MapView
                        reports={validatedReports}
                        sensors={sensorReadings}
                        onMarkerClick={(report) => console.log('Clicked report:', report)}
                        className="h-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sensors Section */}
            {activeTab === 'sensors' && (
              <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden transform transition-all duration-500 hover:border-orange-500/30">
                <div className="p-6 lg:p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Radio className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Sensor Network</h2>
                      <p className="text-white/60 text-sm">Real-time water level data from IoT sensors across the city</p>
                    </div>
                  </div>

                  <SensorDashboard />
                </div>
              </div>
            )}

            {/* Community Reports Section */}
            {activeTab === 'reports' && (
              <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden transform transition-all duration-500 hover:border-orange-500/30">
                <div className="p-6 lg:p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Community Reports</h2>
                      <p className="text-white/60 text-sm">Barangay-validated flood reports submitted by local residents</p>
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

          {/* Right Sidebar - Stats & Quick Actions */}
          <div className="xl:col-span-4 space-y-6">

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/5 backdrop-blur-md rounded-3xl border border-orange-500/20 p-6 lg:p-8 transform transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/40">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">Quick Stats</h3>
              </div>

              <div className="space-y-4">
                <div className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Verified Reports</div>
                        <div className="text-white/60 text-sm">Today</div>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-green-400">{validatedReports.length}</div>
                  </div>
                </div>

                <div className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Active Alerts</div>
                        <div className="text-white/60 text-sm">Needs attention</div>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-amber-400">
                      {validatedReports.filter(r => r.passability === 'NotPassable').length}
                    </div>
                  </div>
                </div>

                <div className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Droplets className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Sensors Online</div>
                        <div className="text-white/60 text-sm">24/7 monitoring</div>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-blue-400">{sensorReadings.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 lg:p-8 transform transition-all duration-300 hover:border-red-500/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">Emergency Contacts</h3>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Barangay Emergency', number: '(02) 8282-1234', icon: Home },
                  { name: 'Rescue Team', number: '(02) 8282-5678', icon: Shield },
                  { name: 'Medical Emergency', number: '(02) 8282-9012', icon: Ambulance }
                ].map((contact, index) => (
                  <button
                    key={index}
                    className="w-full p-4 bg-white/5 hover:bg-red-500/10 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <contact.icon className="w-5 h-5 text-white/70" />
                        <div>
                          <div className="text-white font-bold text-sm">{contact.name}</div>
                          <div className="text-white/60 text-xs">{contact.number}</div>
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
                  For life-threatening emergencies, dial 911 immediately
                </p>
              </div>
            </div>
          </div>
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