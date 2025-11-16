import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';
import { Check, AlertTriangle, X, Satellite } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create icon components for markers
const StatusIcons = {
  Passable: Check,
  HeavyOnly: AlertTriangle,
  NotPassable: X,
  Sensor: Satellite
};

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

      // Add minimalist map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
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

    // Minimal color scheme
    const statusConfig = {
      'Passable': { 
        color: '#10b981', // Green
        label: 'Passable'
      },
      'HeavyOnly': { 
        color: '#f59e0b', // Amber
        label: 'Heavy Vehicles Only'
      },
      'NotPassable': { 
        color: '#ef4444', // Red
        label: 'Not Passable'
      }
    };

    // Create SVG icons for markers
    const createMarkerSVG = (color, IconComponent) => {
      const svgString = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="${color}"/>
          ${IconComponent === Check ? `
            <path d="M7 12L10 15L17 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          ` : IconComponent === AlertTriangle ? `
            <path d="M12 9V11M12 15H12.01M10.29 3.86L1.82 18C1.65 18.3 1.56 18.64 1.56 18.99C1.56 19.83 2.23 20.5 3.07 20.5H20.94C21.78 20.5 22.45 19.83 22.45 18.99C22.45 18.64 22.36 18.3 22.19 18L13.72 3.86C13.43 3.36 12.91 3.06 12.35 3.06C11.79 3.06 11.27 3.36 10.98 3.86Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          ` : IconComponent === X ? `
            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          ` : `
            <path d="M22 12L18 8V4H14L12 2L10 4H6V8L2 12L6 16V20H10L12 22L14 20H18V16L22 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          `}
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svgString)}`;
    };

    // Add markers for reports
    reports.forEach(report => {
      if (!report.location?.coordinates) return;

      const [lng, lat] = report.location.coordinates;
      const status = statusConfig[report.passability] || statusConfig['Passable'];
      const IconComponent = StatusIcons[report.passability] || Check;
      
      const iconUrl = createMarkerSVG(status.color, IconComponent);

      const customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      if (clusterGroupRef.current) {
        clusterGroupRef.current.addLayer(marker);
      } else {
        marker.addTo(mapInstanceRef.current);
      }

      // Minimal popup design
      const brgyTitle = report.barangay ? `Brgy. ${report.barangay}` : 'Flood Report';
      
      const popupContent = `
        <div style="
          min-width: 240px;
          background: white;
          border-radius: 8px;
          padding: 16px;
          color: #1f2937;
          font-family: system-ui, -apple-system, sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <div style="
              width: 16px;
              height: 16px;
              border-radius: 4px;
              background: ${status.color};
              display: flex;
              align-items: center;
              justify-content: center;
            "></div>
            <div style="font-weight: 600; font-size: 14px; color: #111827;">${brgyTitle}</div>
          </div>
          
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
            ${report.location.address || 'Unknown Location'}
          </div>
          
          <div style="display: grid; gap: 6px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Depth:</span>
              <span style="color: #111827; font-weight: 500;">${report.depth}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Status:</span>
              <span style="color: ${status.color}; font-weight: 600;">${status.label}</span>
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

    // Add markers for sensors
    sensors.forEach(s => {
      const lat = s?.location?.lat;
      const lng = s?.location?.lng;
      if (lat == null || lng == null) return;

      const iconUrl = createMarkerSVG('#3b82f6', Satellite);

      const customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      if (clusterGroupRef.current) {
        clusterGroupRef.current.addLayer(marker);
      } else {
        marker.addTo(mapInstanceRef.current);
      }

      // Sensor popup
      const passStatus = (dist) => {
        if (dist == null || Number.isNaN(dist)) return { text: 'Passable', color: '#10b981' };
        if (dist < 40) return { text: 'Not Passable', color: '#ef4444' };
        if (dist < 60) return { text: 'Heavy Vehicles Only', color: '#f59e0b' };
        return { text: 'Passable', color: '#10b981' };
      };
      const p = passStatus(s.distance);
      
      const popupContent = `
        <div style="min-width: 240px; background: white; border-radius: 8px; padding: 16px; color: #1f2937; font-family: system-ui, -apple-system, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <div style="width: 16px; height: 16px; border-radius: 4px; background: #3b82f6;"></div>
            <div style="font-weight: 600; font-size: 14px;">Sensor Station</div>
          </div>
          
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
            ${s.locationName || 'Unknown location'}
          </div>
          
          <div style="display: grid; gap: 6px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">ID:</span>
              <span style="color: #111827; font-weight: 500;">${s.sensorId || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Distance:</span>
              <span style="color: #111827; font-weight: 500;">${s.distance} cm</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Status:</span>
              <span style="color: ${p.color}; font-weight: 600;">${p.text}</span>
            </div>
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
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ 
          minHeight: '400px',
          zIndex: 0,
          position: 'relative'
        }}
      />
      
      {/* Minimal Legend */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm px-3 py-2 z-[1000]">
        <div className="text-xs font-medium text-gray-700 mb-2">Status</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500 flex items-center justify-center">
              <Check size={8} color="white" />
            </div>
            <span className="text-gray-600">Passable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500 flex items-center justify-center">
              <AlertTriangle size={8} color="white" />
            </div>
            <span className="text-gray-600">Heavy Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500 flex items-center justify-center">
              <X size={8} color="white" />
            </div>
            <span className="text-gray-600">Not Passable</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <div className="w-3 h-3 rounded bg-blue-500 flex items-center justify-center">
              <Satellite size={8} color="white" />
            </div>
            <span className="text-gray-600">Sensor</span>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        .cluster-marker {
          background: #1f2937;
          color: white;
          border: 2px solid white;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .leaflet-marker-icon {
          transition: all 0.2s ease;
        }
        
        .leaflet-marker-icon:hover {
          transform: scale(1.15);
          z-index: 1000;
        }
        
        .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          border-radius: 8px;
        }
        
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default MapView;