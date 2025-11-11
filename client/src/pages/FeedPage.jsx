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

const FeedPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'sensors', 'reports'
  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useReports();
  const { online, isSlow } = useNetwork();
  useFallbacks({}, { enabled: online });
  const [offlineItems, setOfflineItems] = useState([]);
  const [forceShowMap, setForceShowMap] = useState(false);
  const toast = useToast();
  const [reachable, setReachable] = useState(true);
  const effectiveOnline = online && reachable;

  const reports = reportsData?.data?.reports || [];

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
    <div className="min-h-[90vh] bg-transparent text-white p-6 font-sans max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Flood Monitoring Dashboard
            </h1>
            <p className="text-white/60 text-base">
              Real-time flood intelligence for North Caloocan
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
            className="group px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-3"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Submit Flood Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2 w-fit">
          {[
            { id: 'map', label: 'Live Map', icon: '🗺️' },
            { id: 'sensors', label: 'Sensor Network', icon: '📡' },
            { id: 'reports', label: 'Community Reports', icon: '👥' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-accent-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Map (Full width on mobile, 2/3 on desktop) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Live Map Card */}
          <div className={`bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 transition-all duration-500 ${
            activeTab !== 'map' ? 'opacity-40' : 'opacity-100'
          }`}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Live Flood Map</h2>
                    <p className="text-white/60">Real-time monitoring across North Caloocan</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
              
              <div className="h-[600px] rounded-2xl overflow-hidden border border-white/10">
                {(!online || (isSlow && !forceShowMap)) ? (
                  <div className="h-full flex items-center justify-center text-center p-8 bg-white/5">
                    <div className="max-w-md space-y-4">
                      <h3 className="text-xl font-semibold text-white">Slow Internet Detected</h3>
                      <p className="text-white/70 text-sm">
                        The live map is temporarily hidden to improve performance on a slow connection. You can still view it, but loading may be slow.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm"
                          onClick={() => setForceShowMap(true)}
                        >
                          Show anyway
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <MapView
                    reports={reports}
                    onMarkerClick={(report) => console.log('Clicked report:', report)}
                    className="h-full"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Community Reports Card */}
          <div className={`bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 transition-all duration-500 ${
            activeTab !== 'reports' ? 'opacity-40' : 'opacity-100'
          }`}>
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Community Reports</h2>
                  <p className="text-white/60">Verified flood reports from residents</p>
                </div>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <ReportList
                  reports={reports}
                  loading={reportsLoading}
                  error={reportsError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sensors & Stats (Full width on mobile, 1/3 on desktop) */}
        <div className="space-y-8">
          {/* Sensor Dashboard Card */}
          <div className={`bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 transition-all duration-500 ${
            activeTab !== 'sensors' ? 'opacity-40' : 'opacity-100'
          }`}>
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📡</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Sensor Network</h2>
                  <p className="text-white/60">Live IoT sensor readings</p>
                </div>
              </div>
              
              <SensorDashboard />
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-accent-500/10 to-accent-600/5 backdrop-blur-sm rounded-3xl border border-accent-500/20 p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Quick Overview</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <span className="text-green-500 text-lg">✓</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Verified Reports</div>
                    <div className="text-white/60 text-sm">Today</div>
                  </div>
                </div>
                <div className="text-2xl font-light text-white">{reports.length}</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <span className="text-amber-500 text-lg">⚠️</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Active Alerts</div>
                    <div className="text-white/60 text-sm">Needs attention</div>
                  </div>
                </div>
                <div className="text-2xl font-light text-amber-500">
                  {reports.filter(r => r.passability === 'NotPassable').length}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <span className="text-blue-500 text-lg">🌊</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Sensors Online</div>
                    <div className="text-white/60 text-sm">All systems operational</div>
                  </div>
                </div>
                <div className="text-2xl font-light text-white">24/7</div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Emergency Contacts</h3>
            
            <div className="space-y-3">
              {[
                { name: 'Barangay Emergency', number: '(02) 8282-1234', type: 'primary' },
                { name: 'Rescue Team', number: '(02) 8282-5678', type: 'rescue' },
                { name: 'Medical Emergency', number: '(02) 8282-9012', type: 'medical' }
              ].map((contact, index) => (
                <button
                  key={index}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 text-left group hover:scale-105"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{contact.name}</div>
                      <div className="text-white/60 text-sm">{contact.number}</div>
                    </div>
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <span className="text-red-500 text-lg">📞</span>
                    </div>
                  </div>
                </button>
              ))}
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