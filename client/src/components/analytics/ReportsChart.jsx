import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const ReportsChart = ({ reports }) => {
  const chartData = useMemo(() => {
    // Group reports by date and status
    const grouped = reports.reduce((acc, report) => {
      const date = new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { date, verified: 0, unverified: 0, total: 0 };
      }
      if (report.status === 'VALIDATED') acc[date].verified++;
      else if (report.status === 'UNVERIFIED') acc[date].unverified++;
      acc[date].total++;
      return acc;
    }, {});

    return Object.values(grouped).slice(-7); // Last 7 days
  }, [reports]);

  const stats = useMemo(() => ({
    verified: reports.filter(r => r.status === 'VALIDATED').length,
    unverified: reports.filter(r => r.status === 'UNVERIFIED').length,
    total: reports.length
  }), [reports]);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-gray-900/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Community Reports Trend</h3>
          <p className="text-sm text-gray-900/60">Last 7 days activity</p>
        </div>
        <TrendingUp className="w-6 h-6 text-orange-500" />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
          <div className="text-2xl font-black text-gray-900">{stats.verified}</div>
          <div className="text-xs text-gray-900/60">Verified</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-4 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
          <div className="text-2xl font-black text-gray-900">{stats.unverified}</div>
          <div className="text-xs text-gray-900/60">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-xl p-4 border border-orange-500/20">
          <TrendingUp className="w-5 h-5 text-orange-600 mb-2" />
          <div className="text-2xl font-black text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-900/60">Total</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUnverified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              padding: '12px'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="verified" 
            stroke="#10b981" 
            strokeWidth={2}
            fill="url(#colorVerified)" 
            name="Verified"
          />
          <Area 
            type="monotone" 
            dataKey="unverified" 
            stroke="#f59e0b" 
            strokeWidth={2}
            fill="url(#colorUnverified)" 
            name="Pending"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};