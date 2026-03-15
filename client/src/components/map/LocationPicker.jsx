import { useEffect, useRef, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  NORTH_CALOOCAN_BOUNDS,
  NORTH_CALOOCAN_MIN_ZOOM,
  NORTH_CALOOCAN_POLYGON,
  isInNorthCaloocan,
} from '../../utils/constants';
import { BARANGAYS } from '../../utils/barangays';
import { BARANGAY_NUMBERS } from '../../utils/barangay_numbers';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const LocationPicker = ({ onLocationSelect, initialLocation, registerUseMyLocation, onLocatingChange, showInMapButton = true }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const handleUseCurrentLocationRef = useRef(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locating, setLocating] = useState(false);
  const toast = useToast();

  const setLocatingState = (val) => {
    setLocating(val);
    onLocatingChange?.(val);
  };

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      const initialCenter = initialLocation 
        ? [initialLocation.lat, initialLocation.lng]
        : DEFAULT_MAP_CENTER;

      const bounds = L.latLngBounds(NORTH_CALOOCAN_BOUNDS);

      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0, // hard wall — cannot pan outside
        minZoom: NORTH_CALOOCAN_MIN_ZOOM,
      }).setView(initialCenter, DEFAULT_MAP_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Faint overlay outside North Caloocan
      const world = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
      L.polygon([world, NORTH_CALOOCAN_POLYGON], {
        color: 'none',
        fillColor: '#000',
        fillOpacity: 0.18,
        interactive: false,
      }).addTo(mapInstanceRef.current);

      // Barangay boundary lines only (no fill)
      if (BARANGAYS && BARANGAYS.length > 0) {
        BARANGAYS.forEach(brgy => {
          brgy.paths.forEach(path => {
            L.polygon(path, {
              fillOpacity: 0,
              color: '#555555',
              weight: 2,
              opacity: 1,
              interactive: false,
            }).addTo(mapInstanceRef.current);
          });
        });
      }

      // OSM-style barangay labels (deduplicated, with halo)
      if (BARANGAY_NUMBERS && BARANGAY_NUMBERS.length > 0) {
        const groupMap = {};
        (BARANGAYS || []).forEach(b => { if (b.name && b.group && !groupMap[b.name]) groupMap[b.name] = b.group; });
        const seen = new Set();
        BARANGAY_NUMBERS.forEach(bnum => {
          if (seen.has(bnum.text)) return;
          seen.add(bnum.text);
          const groupName = groupMap[bnum.text] || '';
          const halo = '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 3px #fff';
          const icon = L.divIcon({
            className: '',
            html: `<div style="pointer-events:none;text-align:center;transform:translate(-50%,-50%)">
              ${groupName ? `<div style="font-size:9.5px;font-weight:400;font-style:italic;font-family:'Noto Sans',Arial,sans-serif;color:#5a4f2a;text-shadow:${halo};white-space:nowrap;line-height:1.2">${groupName.charAt(0) + groupName.slice(1).toLowerCase()}</div>` : ''}
            </div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          L.marker([bnum.lat, bnum.lng], { icon, interactive: false, zIndexOffset: 200 }).addTo(mapInstanceRef.current);
        });
      }

      // Outline border of North Caloocan
      L.polygon(NORTH_CALOOCAN_POLYGON, {
        color: '#c54914',
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0,
        interactive: false,
        dashArray: '6 4',
      }).addTo(mapInstanceRef.current);

      // Custom zoom control — bottom right, matching MapView
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      // Add click handler
      mapInstanceRef.current.on('click', handleMapClick);

      // Add initial marker if location provided
      if (initialLocation) {
        addMarker(initialLocation.lat, initialLocation.lng);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Keep the ref up-to-date on every render so the registered callback always calls the latest version
  useEffect(() => {
    handleUseCurrentLocationRef.current = handleUseCurrentLocation;
  });

  // Expose the 'Use My Location' handler to parent — only register ONCE to avoid infinite re-render loop
  useEffect(() => {
    if (typeof registerUseMyLocation === 'function') {
      registerUseMyLocation(() => handleUseCurrentLocationRef.current?.());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMarker = (lat, lng) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;

    // Guard: reject clicks outside the actual North Caloocan polygon boundary
    if (!isInNorthCaloocan(lat, lng)) {
      return; // silently ignore clicks in corners of the bounding box outside the real boundary
    }

    addMarker(lat, lng);

    setLoadingAddress(true);
    
    // Reverse geocoding via backend proxy (avoids CORS block from browser)
    try {
      const response = await fetch(
        `/api/geocode/reverse?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      
      // Extract address components
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      // Try to extract barangay from address components
      let barangay = '';
      if (data.address) {
        // Try different possible keys for barangay in the address
        barangay = data.address.village || 
                  data.address.suburb || 
                  data.address.neighbourhood || 
                  data.address.town || 
                  data.address.city || '';
      }
      
      const location = {
        lat,
        lng,
        address,
        barangay
      };

      setSelectedLocation(location);
      onLocationSelect(location);
    } catch (error) {
      console.error('Geocoding error:', error);
      const location = {
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
      setSelectedLocation(location);
      onLocationSelect(location);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser');
      return;
    }

    setLocatingState(true);

    // enableHighAccuracy: true  — uses GPS/WiFi triangulation instead of IP-based
    // maximumAge: 0             — never use a cached position, always fetch fresh
    // timeout: 15000            — allow up to 15s before giving up (GPS can be slow indoors)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Check if the user's actual GPS location is within the real North Caloocan polygon
        if (!isInNorthCaloocan(latitude, longitude)) {
          setLocatingState(false);
          toast.warning('Your current location is outside North Caloocan. Please select your location manually on the map.');
          return;
        }

        mapInstanceRef.current.setView([latitude, longitude], 17);
        handleMapClick({ latlng: { lat: latitude, lng: longitude } });
        setLocatingState(false);
      },
      (error) => {
        setLocatingState(false);
        let msg = 'Unable to get your location.';
        if (error.code === error.PERMISSION_DENIED) msg = 'Location access was denied. Please allow location permission in your browser settings.';
        else if (error.code === error.POSITION_UNAVAILABLE) msg = 'Your location is currently unavailable. Try again or pick manually on the map.';
        else if (error.code === error.TIMEOUT) msg = 'Location request timed out. Check your GPS/signal and try again.';
        toast.error(msg);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  return (
    <div className="space-y-0">
      {/* Map */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-xl overflow-hidden"
        />

        {/* Current Location Button (optional inside map) */}
        {showInMapButton && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#7a2200] px-3 py-1.5 rounded-lg shadow-md text-xs font-bold transition-all border border-[rgba(197,73,20,0.2)]"
          >
            📍 Use My Location
          </button>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="px-3 py-2.5 rounded-b-xl" style={{ background: 'rgba(255,244,238,0.7)', borderTop: '1px solid rgba(197,73,20,0.12)' }}>
          {loadingAddress ? (
            <p className="text-xs font-medium" style={{ color: '#9a6f55' }}>Loading address...</p>
          ) : (
            <p className="text-xs font-semibold leading-snug" style={{ color: '#3d2010' }}>{selectedLocation.address}</p>
          )}
        </div>
      )}

      {!selectedLocation && (
        <div className="px-3 py-2 rounded-b-xl" style={{ background: 'rgba(255,244,238,0.5)', borderTop: '1px solid rgba(197,73,20,0.1)' }}>
          <p className="text-xs text-center font-medium" style={{ color: '#9a6f55' }}>
            Tap on the map to select your location
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
