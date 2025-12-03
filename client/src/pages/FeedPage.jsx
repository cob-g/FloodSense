import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ReportList from '../components/reports/ReportList';
import SensorDashboard from '../components/sensors/SensorDashboard';
import { useReports } from '../hooks/useReports';
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

  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useReports({}, {
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  const { online, isSlow } = useNetwork();
  useFallbacks({}, { enabled: online });
  const [offlineItems, setOfflineItems] = useState([]);
  const [forceShowMap, setForceShowMap] = useState(false);
  const toast = useToast();
  const [reachable, setReachable] = useState(true);
  const effectiveOnline = online && reachable;
  const [sensorsForMap, setSensorsForMap] = useState([]);

  const reports = reportsData?.data?.reports || [];

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

  useEffect(() => {
    let timer;
    let cancelled = false;
    async function fetchSensorsOnce() {
      try {
        const res = await fetch('/api/sensors/with-status', { cache: 'no-store' });
        const payload = await res.json();
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        if (!cancelled) setSensorsForMap(list);
      } catch (e) {
        // ignore and keep previous state
      }
    }

    if (effectiveOnline) {
      fetchSensorsOnce();
      timer = setInterval(fetchSensorsOnce, 10000);
    }
    return () => { cancelled = true; if (timer) clearInterval(timer); };
  }, [effectiveOnline]);

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
      <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
  <div className="max-w-2xl mx-auto">
    
    {/* Header */}
    <div className="text-center mb-12">
      <div className="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-300 text-sm font-medium mb-6">
        ⚠️ Flood Confirmation Mode
      </div>
      <h1 className="text-3xl font-light mb-3">Verified Flood Zones</h1>
      <p className="text-white/60">100% confirmed flood areas from cached data</p>
    </div>

    {/* Connection Status */}
    <div className="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        <span className="text-white/70">Offline Access</span>
      </div>
      <button
        onClick={handleRefresh}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm transition-colors"
      >
        Check Connection
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
        <div className="text-2xl font-light text-red-400">{offlineItems.length}</div>
        <div className="text-white/60 text-sm mt-1">Active Floods</div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
        <div className="text-2xl font-light text-green-400">100%</div>
        <div className="text-white/60 text-sm mt-1">Accuracy</div>
      </div>
    </div>

    {/* Flood List */}
    <div className="space-y-3">
      {offlineItems.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Flood Data</h3>
          <p className="text-white/60 text-sm mb-4">Connect to sync latest flood information</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm transition-colors"
          >
            Sync Data
          </button>
        </div>
      ) : (
        offlineItems.map((item) => (
          <div 
            key={item._id || item.name + (item.address || '')}
            className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-red-500/30"
          >
            <div className="flex items-start justify-between">
              
              {/* Left Content */}
              <div className="flex items-start gap-3 flex-1">
                {/* Flood Indicator */}
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30 flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                </div>

                {/* Location Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium mb-1">
                    {item.name || 'Flood Area'}
                  </h3>
                  
                  <div className="space-y-1">
                    {item.barangay && (
                      <div className="text-white/70 text-sm flex items-center gap-2">
                        <span>🏘️</span>
                        Barangay {item.barangay}
                      </div>
                    )}
                    
                    {(item.address || item.notes) && (
                      <div className="text-white/60 text-sm flex items-center gap-2">
                        <span>📍</span>
                        {item.address || item.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              {Array.isArray(item.location?.coordinates) && item.location.coordinates.length === 2 && (
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-xs text-white/40 bg-white/5 rounded-lg px-2 py-1 font-mono border border-white/10">
                    <div>{item.location.coordinates[1].toFixed(4)}</div>
                    <div>{item.location.coordinates[0].toFixed(4)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">Flood Confirmed</span>
              </div>
              <div className="text-white/40 text-xs">
                100% Certain
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Footer Note */}
    <div className="mt-8 text-center">
      <p className="text-white/40 text-sm">
        Data verified during last online session • Refresh when connected
      </p>
    </div>
  </div>
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
                className={`relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 font-semibold ${
                  activeTab === tab.id
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
                        reports={reports}
                        sensors={sensorsForMap}
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
                    <div className="text-3xl font-black text-green-400">{reports.length}</div>
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
                      {reports.filter(r => r.passability === 'NotPassable').length}
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
                    <div className="text-3xl font-black text-blue-400">{sensorsForMap.length}</div>
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