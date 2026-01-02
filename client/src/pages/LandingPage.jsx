import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';

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
  Building,
  Sparkles, Droplet
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Animation refs
  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const dropletRef = useRef(null);
  const textRef = useRef(null);
  const statsRef = useRef(null);
  const buttonsRef = useRef(null);

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

  // GSAP Hero Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Headline Reveal with 3D feel
      if (headlineRef.current) {
        tl.from(headlineRef.current, {
          y: 100,
          autoAlpha: 0,
          duration: 1.2,
          skewY: 2,
          rotationX: 10,
          transformOrigin: "0% 50% -50",
        });
      }

      // 2. Droplet Bounce Entry
      if (dropletRef.current) {
        tl.from(dropletRef.current, {
          y: -150,
          autoAlpha: 0,
          scale: 0,
          duration: 1,
          ease: 'bounce.out'
        }, '-=0.8');
      }

      // 3. Subtext Fade Up
      if (textRef.current) {
        tl.from(textRef.current, {
          y: 30,
          autoAlpha: 0,
          duration: 0.8,
        }, '-=0.6');
      }

      // 4. Stats Pop In with Back Ease
      if (statsRef.current && statsRef.current.children) {
        tl.from(statsRef.current.children, {
          scale: 0.5,
          y: 30,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(2)'
        }, '-=0.4');
      }

      // 5. Buttons Elastic Slide Up
      // Using autoAlpha ensures they are visible only when opacity > 0
      // clearProps ensures no inline styles remain that could hide the buttons
      if (buttonsRef.current && buttonsRef.current.children) {
        tl.from(buttonsRef.current.children, {
          y: 60,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'elastic.out(1, 0.5)',
          clearProps: 'all' 
        }, '-=0.2');
      }

      // Continuous floating animation for droplet
      if (dropletRef.current) {
        gsap.to(dropletRef.current, {
          y: -15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1
        });
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-space-950/80 backdrop-blur-lg border-b border-black/10">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">FS</span>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-black to-accent-500 bg-clip-text text-transparent">
                  FloodSense
                </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/feed" className="text-black/70 hover:text-accent-500 transition-colors font-medium">
                Live Feed
              </Link>
              <Link to="/map" className="text-black/70 hover:text-accent-500 transition-colors font-medium">
                Map
              </Link>
              <Link to="/about" className="text-black/70 hover:text-accent-500 transition-colors font-medium">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <button 
                  onClick={() => navigate('/feed')}
                  className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-black font-semibold rounded-lg transition-all duration-300"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => {
                    try { window.sessionStorage.setItem('openReportAfterLogin', '1'); } catch (_) {}
                    navigate('/auth/login', { state: { from: { pathname: '/feed' } } });
                  }}
                  className="px-6 py-2 bg-black/5 hover:bg-black/10 text-black font-semibold rounded-lg border border-black/10 transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-transparent">
        {/* Gradient Orbs - Why: Luma's signature background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff8c42]/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff8c42]/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#ff5e1a]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <h1 ref={headlineRef} className="text-6xl sm:text-7xl lg:text-8xl font-black relative inline-block origin-bottom">
            {/* Status Badge positioned relative to the headline */}
            <div ref={dropletRef} className="hidden lg:block absolute -top-6 -left-16">
              <Droplet className="w-12 h-12 text-[#ff5e1a]/60" />
            </div>
            Flood Intelligence
            <br />
            <span className="text-[#ff5e1a] animate-pulse">
              For North Caloocan
            </span>
          </h1>

          <p ref={textRef} className="text-lg sm:text-xl text-gray-900 max-w-2xl mx-auto font-normal">
            Real-time flood alerts powered by IoT sensors and community reports,
            <br className="hidden sm:block" />
            keeping our community safe and informed.
          </p>

          {/* Stats - Why: Luma uses minimal, elegant stat displays */}
          <div ref={statsRef} className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-4xl font-black mb-1 text-gray-900">{validatedReports.length}+</div>
              <div className="text-sm text-gray-900 font-medium">Verified Alerts</div>
            </div>
            <div className="w-px h-12 bg-transparent"></div>
            <div className="text-center">
              <div className="text-4xl font-black mb-1 text-gray-900">{sensorReadings.length}+</div>
              <div className="text-sm text-gray-900 font-medium">Active Sensors</div>
            </div>
            <div className="w-px h-12 bg-transparent"></div>
            <div className="text-center">
              <div className="text-4xl font-black mb-1 text-gray-900">24/7</div>
              <div className="text-sm text-gray-900 font-semibold">Monitoring</div>
            </div>
          </div>

          {/* CTA Buttons - Why: Luma uses clean, modern button hierarchy */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 bg-[#ff5e1a] text-gray-50 text-sm font-semibold rounded-full hover:bg-[#ff5e1a]/50 transition-all duration-300 flex items-center justify-center space-x-2 shadow-2xl shadow-white/20"
            >
              <span>View Live Map</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
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
              className="px-8 py-4 bg-white/50 hover:bg-white/10 text-gray-900 text-sm font-semibold rounded-full border border-white/10 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Report</span>
            </button>
          </div>

          {/* Scroll Indicator - Why: Luma uses subtle scroll hints */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Map Section */}
      <section id="live-map" className="py-24 px-4 sm:px-6 lg:px-8 bg-black/3">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="text-gray-900">Live Flood</span>{' '}
              <span className="bg-gradient-to-r from-[#c54914] to-[#c54914] bg-clip-text text-transparent">
                Monitoring
              </span>
            </h2>
            <p className="text-xl text-black/70 max-w-2xl mx-auto">
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
                <span className="text-gray-900">Why</span>{' '}
                <span className="bg-gradient-to-r from-[#c54914] to-[#c54914]  bg-clip-text text-transparent">
                  FloodSense?
                </span>
              </h2>
              <p className="text-lg text-black/70 font-medium mb-8 leading-relaxed">
                Traditional flood monitoring systems are often slow and centralized. FloodSense brings real-time, 
                hyperlocal intelligence directly to the people who need it most.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-black/5 rounded-xl border border-black/5 hover:border-accent-500/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black">Real-time Alerts</h3>
              
                    <p className="text-black/60 text-sm">Get instant notifications when flood levels rise</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-black/5 rounded-xl border border-black/5 hover:border-accent-500/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black">Hyperlocal Data</h3>
                    <p className="text-black/60 text-sm">Street-level precision for accurate decision making</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-black/5 rounded-xl border border-black/5 hover:border-accent-500/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black">Community Powered</h3>
                    <p className="text-black/60 text-sm">Verified reports from residents and officials</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-black/5 backdrop-blur-sm rounded-2xl p-8 border border-black/10">
                <div className="space-y-6">
                  <div className="text-center">
                    <Car className="w-12 h-12 mx-auto mb-4 text-accent-500" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">For Commuters</h3>
                    <p className="text-900/70">Plan safer routes with real-time flood data</p>
                  </div>
                  
                  <div className="h-px bg-black/10"></div>
                  
                  <div className="text-center">
                    <Home className="w-12 h-12 mx-auto mb-4 text-accent-500" />
                    <h3 className="text-2xl font-bold text-black mb-2">For Residents</h3>
                    <p className="text-black/70">Stay informed and protect your property</p>
                  </div>
                  
                  <div className="h-px bg-black/10"></div>
                  
                  <div className="text-center">
                    <Building className="w-12 h-12 mx-auto mb-4 text-accent-500" />
                    <h3 className="text-2xl font-bold text-black mb-2">For Government</h3>
                    <p className="text-black/70">Make data-driven emergency decisions</p>
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
            <span className="text-gray-900">Ready to Stay</span>{' '}
            <span className="bg-gradient-to-r from-[#c54914] to-accent-600 bg-clip-text text-transparent">
              Flood-Safe?
            </span>
          </h2>
          <p className="text-xl text-black/70 mb-8 max-w-2xl mx-auto">
            Join thousands of North Caloocan residents who trust FloodSense for real-time flood intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/feed"
              className="px-8 py-4 bg-[#c54914] hover:bg-accent-600 text-gray-100 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-accent-500/25   hover:scale-105"
            >
              Explore Live Data
            </Link>
            <Link
              to="/learn"
              className="px-8 py-4 bg-black/5 hover:bg-black/10 text-gray-900 font-bold rounded-xl border border-black/10 transition-all duration-300 backdrop-blur-sm"
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