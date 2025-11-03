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
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
      
      // Elegant water droplet marker design
      const iconHtml = `
        <div class="flood-marker ${status.gradient}" style="
          background: linear-gradient(135deg, ${status.color}20, ${status.color}40);
          border: 2px solid ${status.color};
          backdrop-filter: blur(8px);
          width: 44px;
          height: 44px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 4px 20px ${status.color}40,
            inset 0 1px 0 ${status.color}60;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: 18px;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
          ">
            💧
          </div>
          <div style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${status.color};
            border: 2px solid #1f2937;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: white;
          ">
            ${status.icon}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'flood-marker-container',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
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
        <div class="flood-popup" style="
          min-width: 260px;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 4px solid ${status.color};
          border-radius: 12px;
          padding: 16px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${status.color};
            "></div>
            <div style="font-weight: 700; font-size: 16px; color: #f9fafb;">${brgyTitle}</div>
          </div>
          
          <div style="font-size: 14px; color: #d1d5db; margin-bottom: 16px;">
            ${report.location.address || 'Unknown Location'}
          </div>
          
          <div style="display: grid; gap: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #9ca3af;">Flood Depth:</span>
              <span style="color: #f9fafb; font-weight: 600;">${report.depth}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #9ca3af;">Status:</span>
              <span style="color: ${status.color}; font-weight: 600;">${statusText}</span>
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

    // Fit bounds if there are reports
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports
          .filter(r => r.location?.coordinates)
          .map(r => [r.location.coordinates[1], r.location.coordinates[0]])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [reports, onMarkerClick]);

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
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-white rounded-2xl border border-white/10 shadow-2xl px-4 py-3 z-[1000]">
        <div className="text-sm font-semibold mb-2 text-white/90">Flood Status</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-white/80">Passable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
            <span className="text-white/80">Heavy Vehicles Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-white/80">Not Passable</span>
          </div>
        </div>
      </div>

      {/* Add some custom styles for the cluster markers */}
      <style jsx>{`
        .cluster-marker {
          background: linear-gradient(135deg, #31af2cff, #14d34dff);
          color: white;
          border: 2px solid #0da000ff;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(8px);
        }
        
        .flood-marker:hover {
          transform: rotate(-45deg) scale(1.1);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default MapView;