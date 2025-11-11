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
  const [latest, setLatest] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [history, setHistory] = useState([]);

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
      setLatest(data);
      
      // Add to history (keep last 10 readings)
      setHistory(prev => [data, ...prev].slice(0, 10));
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

  // Get water level status based on distance
  const getWaterLevelStatus = (distance) => {
    if (distance < 10) return { text: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (distance < 20) return { text: 'High', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (distance < 30) return { text: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Real-time Flood Sensor</h2>
            <p className="text-gray-600 mt-1">Live water level monitoring from ESP32 sensor</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
            <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Current Reading */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Reading</h3>
        
        {latest ? (
          <div className="space-y-4">
            {/* Distance Display */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Distance to Water Surface</p>
                <p className="text-4xl font-bold text-blue-600">{latest.distance} <span className="text-2xl">cm</span></p>
              </div>
              <div className="text-right">
                {(() => {
                  const status = getWaterLevelStatus(latest.distance);
                  return (
                    <span className={`inline-block px-4 py-2 rounded-full font-semibold ${status.bg} ${status.color}`}>
                      {status.text}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Sensor meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="text-gray-700">
                <span className="text-gray-500">Sensor ID:</span> <span className="font-medium">{latest.sensorId || 'N/A'}</span>
              </div>
              <div className="text-gray-700">
                <span className="text-gray-500">Latitude:</span> <span className="font-medium">{latest?.location?.lat ?? 'N/A'}</span>
              </div>
              <div className="text-gray-700">
                <span className="text-gray-500">Longitude:</span> <span className="font-medium">{latest?.location?.lng ?? 'N/A'}</span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: {formatTime(latest.timestamp)}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No data yet. Waiting for sensor readings...</p>
            <p className="text-sm text-gray-400 mt-2">Make sure your ESP32 is connected and sending data</p>
          </div>
        )}
      </div>

      {/* Reading History */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Readings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sensor ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance (cm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((reading, index) => {
                  const status = getWaterLevelStatus(reading.distance);
                  return (
                    <tr key={reading._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reading.sensorId || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(reading.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reading.distance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reading?.location?.lat != null && reading?.location?.lng != null
                          ? `${reading.location.lat}, ${reading.location.lng}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How it works:</p>
            <p>The ESP32 sensor measures the distance from the sensor to the water surface. Lower distances indicate higher water levels.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorDashboard;
