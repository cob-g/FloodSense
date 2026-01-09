import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Get socket URL from environment variable or use default
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Initialize socket connection
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

function SensorDashboard() {
  const [sensors, setSensors] = useState([]);
  const [activeSensorIds, setActiveSensorIds] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Fetch all registered sensors on mount
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch('/api/sensor-data?limit=100');
        if (response.ok) {
          const data = await response.json();
          const sensorList = Array.isArray(data) ? data : data.data || [];
          console.log('SensorDashboard fetched sensors:', sensorList);
          setSensors(sensorList.map(s => ({ ...s, isActive: false })));
        }
      } catch (error) {
        console.error('Failed to fetch sensors:', error);
      }
    };
    fetchSensors();
  }, []);

  useEffect(() => {
    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    });

    // Listen for sensor updates
    socket.on('update', (data) => {
      console.log('📊 Received sensor update:', data);
      console.log('Sensor location data:', {
        lat: data.location?.lat,
        lng: data.location?.lng,
        address: data.location?.address
      });
      
      // Mark sensor as active
      setActiveSensorIds(prev => new Set([...prev, data.sensorId]));
      
      setSensors(prev => {
        const existing = prev.findIndex(s => s.sensorId === data.sensorId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...data, isActive: true };
          return updated;
        }
        return [{ ...data, isActive: true }, ...prev];
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('update');
    };
  }, []);

  // Get status indicator color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Get flood status based on distance (lower distance = higher water level)
  const getFloodStatus = (distance) => {
    if (distance < 40) return { text: 'Not Passable', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (distance < 60) return { text: 'Heavy Vehicles Only', color: 'text-amber-400', bg: 'bg-amber-500/10' };

    return { text: 'Passable', color: 'text-green-400', bg: 'bg-green-500/10' };
  };

  // Format time since last reading
  const getTimeSinceUpdate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Sort sensors: active first, then inactive
  const sortedSensors = [...sensors].sort((a, b) => {
    const aActive = a.isActive ? 1 : 0;
    const bActive = b.isActive ? 1 : 0;
    return bActive - aActive;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Sensors List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {sortedSensors.length > 0 ? (
          sortedSensors.map((sensor) => {
            const isActive = sensor.isActive;
            const floodStatus = isActive ? getFloodStatus(sensor.distance) : { text: 'N/A', color: 'text-gray-400', bg: 'bg-gray-500/10' };
            const deviceStatus = isActive ? 'Online' : 'Offline';
            const deviceStatusColor = isActive ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30';
            
            return (
              <div 
                key={sensor.sensorId} 
                className={`rounded-xl p-4 transition-all duration-300 hover:shadow-lg group cursor-pointer ${
                  isActive 
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                    : 'bg-white/3 hover:bg-white/5 border border-white/5 opacity-70'
                }`}
              >
                {/* Header with Location and Status Badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${floodStatus.bg} ${floodStatus.color}`}>
                        {floodStatus.text}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${deviceStatusColor}`}>
                        {deviceStatus}
                      </span>
                      {isActive && <span className="text-xs text-white/50">{getTimeSinceUpdate(sensor.timestamp)}</span>}
                    </div>
                    <h3 className={`font-bold text-base group-hover:text-accent transition-colors ${
                      isActive ? 'text-white' : 'text-white/60'
                    }`}>
                      {sensor.locationName || 'Sensor Location'}
                    </h3>
                  </div>
                </div>

                {/* Water Level */}
                {isActive ? (
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                    <span className="text-xs text-white/50 block mb-1">Current Water Level</span>
                    <span className="font-bold text-white text-sm">{sensor.distance} cm</span>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                    <span className="text-xs text-white/50 block mb-1">Current Water Level</span>
                    <span className="font-bold text-white/40 text-sm">No data</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-900 text-sm">No sensors available</p>
            <p className="text-gray-900 text-xs mt-2">Waiting for sensor data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SensorDashboard;
