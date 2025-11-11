import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const MapView = ({ 
  reports = [], 
  sensors = [],
  center = DEFAULT_MAP_CENTER, 
  zoom = DEFAULT_MAP_ZOOM,
  onMarkerClick,
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const clusterGroupRef = useRef(null);
  const [clusterReady, setClusterReady] = useState(false);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, { 
        zoomControl: false,
        attributionControl: false
      }).setView(center, zoom);

      // Add elegant dark-themed map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Custom minimalist zoom control
      const zoomControl = L.control.zoom({ 
        position: 'bottomright'
      });
      zoomControl.addTo(mapInstanceRef.current);

      // Add subtle attribution
      L.control.attribution({
        position: 'bottomleft'
      })
      .addAttribution('© OpenStreetMap contributors, © CARTO')
      .addTo(mapInstanceRef.current);

      // Try to load MarkerCluster dynamically
      const ensureCluster = async () => {
        try {
          if (!('markerClusterGroup' in L)) {
            await new Promise((resolve, reject) => {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
              link.onload = resolve; link.onerror = resolve;
              document.head.appendChild(link);
            });
            await new Promise((resolve, reject) => {
              const link2 = document.createElement('link');
              link2.rel = 'stylesheet';
              link2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
              link2.onload = resolve; link2.onerror = resolve;
              document.head.appendChild(link2);
            });
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
              script.onload = resolve; script.onerror = resolve;
              document.body.appendChild(script);
            });
          }
          if ('markerClusterGroup' in L) {
            clusterGroupRef.current = L.markerClusterGroup({
              showCoverageOnHover: false,
              spiderfyOnEveryZoom: false,
              maxClusterRadius: 60,
              iconCreateFunction: function (cluster) {
                return L.divIcon({
                  html: `<div class="cluster-marker">${cluster.getChildCount()}</div>`,
                  className: 'custom-cluster',
                  iconSize: L.point(40, 40, true)
                });
              }
            });
            mapInstanceRef.current.addLayer(clusterGroupRef.current);
            setClusterReady(true);
          }
        } catch (e) {
          setClusterReady(false);
        }
      };

      ensureCluster();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers();
    } else {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }

    // Modern color scheme for flood status
    const statusConfig = {
      'Passable': { 
        color: '#10b981', 
        icon: '🟢',
        label: 'Passable',
        gradient: 'from-green-500 to-green-600'
      },
      'HeavyOnly': { 
        color: '#f59e0b', 
        icon: '🟡',
        label: 'Heavy Vehicles Only',
        gradient: 'from-amber-500 to-amber-600'
      },
      'NotPassable': { 
        color: '#ef4444', 
        icon: '🔴',
        label: 'Not Passable',
        gradient: 'from-red-500 to-red-600'
      }
    };

    // Add markers for reports
    reports.forEach(report => {
      if (!report.location?.coordinates) return;

      const [lng, lat] = report.location.coordinates;
      const status = statusConfig[report.passability] || statusConfig['Passable'];
      
      const iconHtml = `
        <div class="flood-marker" style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${status.color};
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        "></div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'flood-marker-container',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      if (clusterGroupRef.current) {
        clusterGroupRef.current.addLayer(marker);
      } else {
        marker.addTo(mapInstanceRef.current);
      }

      // Modern popup design
      const brgyTitle = report.barangay ? `Brgy. ${report.barangay}` : 'Flood Report';
      const statusText = status.label;
      
      const popupContent = `
        <div style="
          min-width: 260px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-left: 4px solid ${status.color};
          border-radius: 10px;
          padding: 14px;
          color: #111827;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${status.color};
            "></div>
            <div style="font-weight: 700; font-size: 15px; color: #111827;">${brgyTitle}</div>
          </div>
          <div style="font-size: 13px; color: #374151; margin-bottom: 12px;">
            ${report.location.address || 'Unknown Location'}
          </div>
          <div style="display: grid; gap: 6px; font-size: 12.5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #6b7280;">Flood Depth:</span>
              <span style="color: #111827; font-weight: 600;">${report.depth}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #6b7280;">Status:</span>
              <span style="color: ${status.color}; font-weight: 700;">${statusText}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(report));
      }

      markersRef.current.push(marker);
    });

    // Add markers for sensors (latest per sensor)
    sensors.forEach(s => {
      const lat = s?.location?.lat;
      const lng = s?.location?.lng;
      if (lat == null || lng == null) return;

      const iconHtml = `
        <div style="
          width: 24px; height: 24px; border-radius: 50%;
          background: #ffffff; border: 3px solid #f59e0b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        "></div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'sensor-marker-container',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      if (clusterGroupRef.current) {
        clusterGroupRef.current.addLayer(marker);
      } else {
        marker.addTo(mapInstanceRef.current);
      }

      // Sensor popup with Distance and Status (updates throttled by parent)
      const passStatus = (dist) => {
        if (dist == null || Number.isNaN(dist)) return { text: 'Passable', color: '#10b981' };
        if (dist < 10) return { text: 'Not Passable', color: '#ef4444' };
        if (dist < 20) return { text: 'Heavy Vehicles Only', color: '#f59e0b' };
        return { text: 'Passable', color: '#10b981' };
      };
      const p = passStatus(s.distance);
      const popupContent = `
        <div style="min-width: 240px; background: #ffffff; color: #111827; padding: 12px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08);">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px; display:flex; align-items:center; gap:8px;">
            <span>📡</span>
            <span>Sensor</span>
          </div>
          <div style="font-size: 12.5px; color: #374151; margin-bottom: 6px;">
            ${s.locationName || 'Unknown location'}
          </div>
          <div style="display:flex; justify-content:space-between; font-size: 12.5px;">
            <span style="color:#6b7280;">Sensor ID:</span>
            <span style="color:#111827; font-weight:600;">${s.sensorId || 'N/A'}</span>
          </div>
          <div style=\"display:flex; justify-content:space-between; font-size: 12.5px; margin-top:6px;\">
            <span style=\"color:#6b7280;\">Distance:</span>
            <span style=\"color:#111827; font-weight:600;\">${s.distance} cm</span>
          </div>
          <div style=\"display:flex; justify-content:space-between; font-size: 12.5px; margin-top:6px;\">
            <span style=\"color:#6b7280;\">Status:</span>
            <span style=\"color:${p.color}; font-weight:700;\">${p.text}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      markersRef.current.push(marker);
    });

    // Fit bounds if there are reports or sensors
    const boundsPoints = [];
    reports.forEach(r => {
      if (r.location?.coordinates) boundsPoints.push([r.location.coordinates[1], r.location.coordinates[0]]);
    });
    sensors.forEach(s => {
      if (s?.location?.lat != null && s?.location?.lng != null) boundsPoints.push([s.location.lat, s.location.lng]);
    });
    if (boundsPoints.length > 0) {
      const bounds = L.latLngBounds(boundsPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [reports, sensors, onMarkerClick]);

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '400px' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ 
          minHeight: '400px',
          zIndex: 0,
          position: 'relative'
        }}
      />
      
      {/* Elegant Glass-morphism Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl border border-gray-200 shadow-lg px-4 py-3 z-[1000]">
        <div className="text-sm font-semibold mb-2 text-gray-800">Flood Status</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-gray-700">Passable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
            <span className="text-gray-700">Heavy Vehicles Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-gray-700">Not Passable</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <div className="w-3 h-3 rounded-[6px] bg-orange-500 shadow-sm"></div>
            <span className="text-gray-700">Sensor</span>
          </div>
        </div>
      </div>

      {/* Add some custom styles for the cluster markers */}
      <style>{`
        .cluster-marker {
          background: black;
          color: white;
          border: 2px solid #e5e7eb;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        
        .flood-marker:hover {
          transform: scale(1.05);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default MapView;