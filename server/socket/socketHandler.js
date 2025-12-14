import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

const REFRESH_INTERVAL = 15000; // 15 seconds

// Component to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const LiveFloodMap = ({ height = '400px', showControls = true }) => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [socket, setSocket] = useState(null);

  const defaultCenter = [14.5995, 120.9842]; // Manila coordinates
  const defaultZoom = 12;

  // Fetch sensor data
  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sensors`);
      if (response.ok) {
        const data = await response.json();
        // Filter only online sensors with recent data
        const onlineSensors = data.filter(sensor => 
          sensor.status === 'online' || sensor.isActive
        );
        setSensors(onlineSensors);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup socket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('LiveFloodMap connected to socket');
    });

    newSocket.on('sensorUpdate', (data) => {
      console.log('Received sensor update:', data);
      fetchSensorData(); // Refresh all sensor data on update
    });

    newSocket.on('floodDataUpdate', (data) => {
      console.log('Received flood data update:', data);
      fetchSensorData();
    });

    newSocket.on('newSensorData', (data) => {
      console.log('Received new sensor data:', data);
      fetchSensorData();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [fetchSensorData]);

  // Initial fetch and auto-refresh every 15 seconds
  useEffect(() => {
    fetchSensorData();

    const intervalId = setInterval(() => {
      console.log('Auto-refreshing sensor data...');
      fetchSensorData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchSensorData]);

  // Get flood level color
  const getFloodColor = (level) => {
    if (level >= 3) return '#ff0000'; // Critical - Red
    if (level >= 2) return '#ff9800'; // Warning - Orange
    if (level >= 1) return '#ffeb3b'; // Caution - Yellow
    return '#4caf50'; // Normal - Green
  };

  // Get flood level radius
  const getFloodRadius = (level) => {
    if (level >= 3) return 500;
    if (level >= 2) return 400;
    if (level >= 1) return 300;
    return 200;
  };

  if (loading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {showControls && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 1000,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '12px'
        }}>
          <div>Sensors Online: {sensors.length}</div>
          {lastUpdate && (
            <div>Last Update: {lastUpdate.toLocaleTimeString()}</div>
          )}
          <div style={{ color: '#666', fontSize: '10px' }}>
            Auto-refresh: 15s
          </div>
        </div>
      )}
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={defaultCenter} zoom={defaultZoom} />
        
        {sensors.map((sensor) => {
          const floodLevel = sensor.currentReading?.floodLevel || sensor.floodLevel || 0;
          const lat = sensor.location?.coordinates?.[1] || sensor.latitude;
          const lng = sensor.location?.coordinates?.[0] || sensor.longitude;
          
          if (!lat || !lng) return null;
          
          return (
            <Circle
              key={sensor._id || sensor.id}
              center={[lat, lng]}
              radius={getFloodRadius(floodLevel)}
              pathOptions={{
                color: getFloodColor(floodLevel),
                fillColor: getFloodColor(floodLevel),
                fillOpacity: 0.4,
              }}
            >
              <Popup>
                <div>
                  <strong>{sensor.name || sensor.sensorId}</strong>
                  <br />
                  Status: {sensor.status || 'Unknown'}
                  <br />
                  Flood Level: {floodLevel}
                  <br />
                  Water Level: {sensor.currentReading?.waterLevel || sensor.waterLevel || 'N/A'} cm
                  {sensor.lastReading && (
                    <>
                      <br />
                      Last Reading: {new Date(sensor.lastReading).toLocaleString()}
                    </>
                  )}
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
};

// Add this function to broadcast sensor updates to all clients
const broadcastSensorUpdate = (io, sensorData) => {
  io.emit('sensorUpdate', sensorData);
  io.emit('floodDataUpdate', sensorData); // Also emit as flood data for map refresh
};

export default LiveFloodMap;