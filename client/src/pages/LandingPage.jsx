import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import MapView from '../components/map/MapView';

import { useReports } from '../hooks/useReports';
import { useSensors } from '../hooks/useSensors';
import { 
  Satellite, 
  Users, 
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Plus,
  ChevronRight,
  Activity,
  Car,
  Home,
  Building
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Fetch validated reports for the map (auto-refresh every 30s)
  const { data: validatedData } = useReports({
    status: 'VALIDATED',
    limit: 100,
  }, {
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  const validatedReports = validatedData?.data?.reports || [];

  // Fetch sensor data (auto-refresh every 30s)
  const { data: sensorsRes } = useSensors({ withStatus: true }, {
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  const sensorReadings = sensorsRes?.data || [];

  const features = [
    {
      icon: <Satellite className="w-6 h-6" />,
      title: 'IoT Sensor Network',
      description: 'Real-time water level monitoring across North Caloocan'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community Reports',
      description: 'Verified ground-level flood intelligence'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Barangay Validation',
      description: 'Officially confirmed flood data'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-space-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-white to-accent-500 bg-clip-text text-transparent">
                  FloodSense
                </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/feed" className="text-white/70 hover:text-accent-500 transition-colors font-medium">
                Live Feed
              </Link>
              <Link to="/map" className="text-white/70 hover:text-accent-500 transition-colors font-medium">
                Map
              </Link>
              <Link to="/about" className="text-white/70 hover:text-accent-500 transition-colors font-medium">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <button 
                  onClick={() => navigate('/feed')}
                  className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => {
                    try { window.sessionStorage.setItem('openReportAfterLogin', '1'); } catch (_) {}
                    navigate('/auth/login', { state: { from: { pathname: '/feed' } } });
                  }}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-500 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Live Flood Monitoring Active
                </div>
                <h1 className="text-5xl sm:text-6xl font-black leading-tight">
                  <span className="text-white">Flood Intelligence</span>
                  <br />
                  <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
                    For North Caloocan
                  </span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed">
                  Combining IoT sensors and community reports to deliver real-time flood alerts and keep our community safe.
                </p>
              </div>

              {/* Interactive Stats */}
              <div className="grid grid-cols-3 gap-4 py-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-accent-500">{validatedReports.length}+</div>
                  <div className="text-white/60 text-sm font-medium">Verified Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-accent-500">{sensorReadings.length}+</div>
                  <div className="text-white/60 text-sm font-medium">Active Sensors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-accent-500">24/7</div>
                  <div className="text-white/60 text-sm font-medium">Monitoring</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-accent-500/25 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>View Live Map</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      try { window.sessionStorage.setItem('openReportAfterLogin', '1'); } catch (_) {}
                      navigate('/auth/login', { state: { from: { pathname: '/feed' } } });
                      return;
                    }
                    try { window.sessionStorage.setItem('openReportAfterLogin', '1'); } catch (_) {}
                    navigate('/feed', { state: { openReport: true } });
                  }}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-2"
                >
                  <span>Submit Report</span>
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Content - Feature Showcase */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-96">
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl transition-all duration-500 cursor-pointer ${
                        activeFeature === index
                          ? 'bg-accent-500/10 border border-accent-500/30'
                          : 'bg-white/5 border border-white/5 hover:border-white/10'
                      }`}
                      onMouseEnter={() => setActiveFeature(index)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-accent-500">{feature.icon}</div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                          <p className="text-white/60 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Map Preview */}
              <div className="absolute -bottom-6 -right-6 w-64 h-48 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-accent-500/10 to-accent-600/10 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-accent-500" />
                    <div className="text-white font-semibold">Live Map</div>
                    <div className="text-white/60 text-xs">Real-time data</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Map Section */}
      <section id="live-map" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/3">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="text-white">Live Flood</span>{' '}
              <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
                Monitoring
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Real-time flood data across North Caloocan with verified community reports and sensor readings
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-white/10 shadow-2xl overflow-hidden">
            <div className="w-full h-[600px] rounded-xl overflow-hidden">
              <MapView reports={validatedReports} sensors={sensorReadings} className="h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                <span className="text-white">Why</span>{' '}
                <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
                  FloodSense?
                </span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Traditional flood monitoring systems are often slow and centralized. FloodSense brings real-time, 
                hyperlocal intelligence directly to the people who need it most.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-accent-500/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Real-time Alerts</h3>
                    <p className="text-white/60 text-sm">Get instant notifications when flood levels rise</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-accent-500/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Hyperlocal Data</h3>
                    <p className="text-white/60 text-sm">Street-level precision for accurate decision making</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-accent-500/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Community Powered</h3>
                    <p className="text-white/60 text-sm">Verified reports from residents and officials</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="space-y-6">
                  <div className="text-center">
                    <Car className="w-12 h-12 mx-auto mb-4 text-accent-500" />
                    <h3 className="text-2xl font-bold text-white mb-2">For Commuters</h3>
                    <p className="text-white/70">Plan safer routes with real-time flood data</p>
                  </div>
                  
                  <div className="h-px bg-white/10"></div>
                  
                  <div className="text-center">
                    <Home className="w-12 h-12 mx-auto mb-4 text-accent-500" />
                    <h3 className="text-2xl font-bold text-white mb-2">For Residents</h3>
                    <p className="text-white/70">Stay informed and protect your property</p>
                  </div>
                  
                  <div className="h-px bg-white/10"></div>
                  
                  <div className="text-center">
                    <Building className="w-12 h-12 mx-auto mb-4 text-accent-500" />
                    <h3 className="text-2xl font-bold text-white mb-2">For Government</h3>
                    <p className="text-white/70">Make data-driven emergency decisions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-500/10 to-accent-600/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            <span className="text-white">Ready to Stay</span>{' '}
            <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              Flood-Safe?
            </span>
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of North Caloocan residents who trust FloodSense for real-time flood intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/feed"
              className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-accent-500/25 hover:scale-105"
            >
              Explore Live Data
            </Link>
            <Link
              to="/learn"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;