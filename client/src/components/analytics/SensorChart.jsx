import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import { Activity, Droplets } from 'lucide-react';

export const SensorChart = ({ sensorData }) => {
  const chartData = useMemo(() => {
    if (!sensorData || sensorData.length === 0) return [];
    
    // Group by timestamp (last 24 readings or available data)
    return sensorData.slice(-24).map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      waterLevel: reading.distance || 0,
      status: reading.distance > 90 ? 'Critical' : reading.distance > 50 ? 'Warning' : 'Normal'
    }));
  }, [sensorData]);

  const currentLevel = sensorData[sensorData.length - 1]?.distance || 0;
  const avgLevel = useMemo(() => {
    if (sensorData.length === 0) return 0;
    const sum = sensorData.reduce((acc, r) => acc + (r.distance || 0), 0);
    return (sum / sensorData.length).toFixed(1);
  }, [sensorData]);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-gray-900/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Sensor Water Level</h3>
          <p className="text-sm text-gray-900/60">Real-time monitoring (Last 24 readings)</p>
        </div>
        <Activity className="w-6 h-6 text-orange-500" />
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
          <Droplets className="w-5 h-5 text-blue-600 mb-2" />
          <div className="text-2xl font-black text-gray-900">{currentLevel} cm</div>
          <div className="text-xs text-gray-900/60">Current Level</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-xl p-4 border border-orange-500/20">
          <Activity className="w-5 h-5 text-orange-600 mb-2" />
          <div className="text-2xl font-black text-gray-900">{avgLevel} cm</div>
          <div className="text-xs text-gray-900/60">Average (24h)</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '10px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'cm', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              padding: '12px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="waterLevel" 
            stroke="#f97316" 
            strokeWidth={3}
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
            name="Water Level (cm)"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Thresholds Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-900/60">Normal (&lt;50cm)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-900/60">Warning (50-90cm)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-900/60">Critical (&gt;90cm)</span>
        </div>
      </div>
    </div>
  );
};