import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background matching navbar */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #c54914 0%, #7a2200 55%, #3a0e00 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '260px', height: '260px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-50px', left: '-50px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        {/* Watermark droplet icon */}
        <div style={{
          position: 'absolute', bottom: '24px', right: '32px',
          opacity: 0.08,
        }}>
          <Droplets size={120} strokeWidth={1} color="white" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4 group">
              <img
                src="/logo.png"
                alt="FloodSense Logo"
                width={32}
                height={32}
                className="w-8 h-8 bg-transparent object-contain shadow-md group-hover:shadow-lg transition-all duration-300"
              />
              <h1 className="text-2xl font-semibold [font-family:Goodly] text-gray-100 group-hover:text-white transition-colors duration-300">
                FloodSense
              </h1>
            </div>
            <p className="text-white/60 text-sm">
              Real-time flood monitoring for North Caloocan
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/feed" className="block text-white/60 hover:text-gray-950 transition-colors text-sm">
                Live Feed
              </Link>
              <Link to="/map" className="block text-white/60 hover:text-gray-950 transition-colors text-sm">
                Flood Map
              </Link>
              <Link to="/report" className="block text-white/60 hover:text-gray-950 transition-colors text-sm">
                Submit Report
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <div className="space-y-2">
              <Link to="/learn" className="block text-white/60 hover:text-gray-950 transition-colors text-sm">
                Safety Tips
              </Link>
              <Link to="/about" className="block text-white/60 hover:text-gray-950 transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-white/60 hover:text-gray-950 transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <p className="text-white/60">info@floodsense.ph</p>
              <p className="text-white/60">North Caloocan, Metro Manila</p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            © 2025 FloodSense North Caloocan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
