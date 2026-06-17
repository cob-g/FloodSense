import { useAuth } from '../../hooks/useAuth';
import { User, Mail, MapPin, Shield, ChevronRight } from 'lucide-react';

export const ProfilePage = () => {
  // Mock user data for demonstration
  const user = {
    name: 'Bhon',
    email: 'bhon@floodsense.ph',
    barangay: 'North Caloocan',
    role: 'resident'
  };

  return (
    <div className="min-h-screen bg-black p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <span className="text-white/40">Account</span>
          <ChevronRight size={14} className="text-white/20" />
          <span className="text-white">Profile</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Profile</h1>
          <p className="text-white/50 text-lg">Your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
          {/* Avatar Section */}
          <div className="p-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <User size={40} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center border-2 border-black">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">{user?.name}</h2>
                <p className="text-white/50">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Name Field */}
              <div className="group">
                <div className="flex items-center justify-between py-4 border-b border-white/5 hover:border-orange-500/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                      <User size={18} className="text-white/60 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Full Name</p>
                      <p className="text-white font-medium">{user?.name}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <div className="flex items-center justify-between py-4 border-b border-white/5 hover:border-orange-500/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                      <Mail size={18} className="text-white/60 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Email Address</p>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>

              {/* Barangay Field */}
              <div className="group">
                <div className="flex items-center justify-between py-4 border-b border-white/5 hover:border-orange-500/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                      <MapPin size={18} className="text-white/60 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Barangay</p>
                      <p className="text-white font-medium">{user?.barangay}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>

              {/* Role Field */}
              <div className="group">
                <div className="flex items-center justify-between py-4 hover:border-orange-500/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                      <Shield size={18} className="text-white/60 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Account Role</p>
                      <p className="text-white font-medium capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-8 pt-4">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 rounded-2xl transition-all active:scale-[0.98]">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-start gap-3 px-4">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
          <p className="text-white/30 text-sm">
            Last login: Today at 2:30 PM from Quezon City, Metro Manila
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;