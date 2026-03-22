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
    if (distance < 40) return { text: 'Not Passable', color: 'text-red-600', bg: 'bg-red-500/10' };
    if (distance < 60) return { text: 'Heavy Vehicles Only', color: 'text-amber-600', bg: 'bg-amber-500/10' };

    return { text: 'Passable', color: 'text-green-600', bg: 'bg-green-500/10' };
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

  // Filter to show only online sensors
  const onlineSensors = sensors.filter(sensor => sensor.isActive);

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Sensors List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {onlineSensors.length > 0 ? (
          onlineSensors.map((sensor) => {
            const floodStatus = getFloodStatus(sensor.distance);

            return (
              <div
                key={sensor.sensorId}
                className="rounded-xl p-4 transition-all duration-300 hover:shadow-lg group cursor-pointer bg-white/60 hover:bg-white/80 border border-gray-900/10 hover:border-orange-500/30"
              >
                {/* Header with Location and Status Badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${floodStatus.bg} ${floodStatus.color} border-opacity-30`}>
                        {floodStatus.text}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-green-500/10 text-green-600 border-green-500/30">
                        Online
                      </span>
                      <span className="text-xs text-gray-900/50">{getTimeSinceUpdate(sensor.timestamp)}</span>
                    </div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-orange-500 transition-colors">
                      {sensor.locationName || 'Sensor Location'}
                    </h3>
                  </div>
                </div>

                {/* Water Level */}
                <div className="bg-gray-900/5 rounded-lg p-2.5 border border-gray-900/10">
                  <span className="text-xs text-gray-900/60 block mb-1">Current Water Level</span>
                  <span className="font-bold text-gray-900 text-sm">{sensor.distance} cm</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-900 text-sm font-semibold">No online sensors</p>
            <p className="text-gray-900/60 text-xs mt-2">Waiting for sensor data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SensorDashboard;
