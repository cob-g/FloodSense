import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-space-900/50 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-white to-accent-500 bg-clip-text text-transparent">
                FloodSense
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Real-time flood monitoring for North Caloocan
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/feed" className="block text-white/60 hover:text-accent-500 transition-colors text-sm">
                Live Feed
              </Link>
              <Link to="/map" className="block text-white/60 hover:text-accent-500 transition-colors text-sm">
                Flood Map
              </Link>
              <Link to="/report" className="block text-white/60 hover:text-accent-500 transition-colors text-sm">
                Submit Report
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <div className="space-y-2">
              <Link to="/learn" className="block text-white/60 hover:text-accent-500 transition-colors text-sm">
                Safety Tips
              </Link>
              <Link to="/about" className="block text-white/60 hover:text-accent-500 transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-white/60 hover:text-accent-500 transition-colors text-sm">
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
