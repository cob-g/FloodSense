import { useEffect, useRef, useState } from 'react';
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
        maxBounds: bounds,
        maxBoundsViscosity: 1.0, // hard wall — cannot pan outside
        minZoom: NORTH_CALOOCAN_MIN_ZOOM,
      }).setView(initialCenter, DEFAULT_MAP_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Faint overlay outside North Caloocan — uses actual irregular polygon boundary
      const world = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
      L.polygon([world, NORTH_CALOOCAN_POLYGON], {
        color: 'none',
        fillColor: '#000',
        fillOpacity: 0.25,
        interactive: false,
        pane: 'overlayPane',
      }).addTo(mapInstanceRef.current);

      // Colored inner barangay boundaries
      if (BARANGAYS && BARANGAYS.length > 0) {
        BARANGAYS.forEach(brgy => {
          brgy.paths.forEach(path => {
             L.polygon(path, {
                fillColor: brgy.color,
                fillOpacity: 0.55,
                color: '#ffffff',
                weight: 1.5,
                opacity: 0.9,
                interactive: false
             }).addTo(mapInstanceRef.current);
          });
        });
      }

      // Drawn numbers inside barangays
      if (BARANGAY_NUMBERS && BARANGAY_NUMBERS.length > 0) {
        BARANGAY_NUMBERS.forEach(bnum => {
            const icon = L.divIcon({
               className: 'leaflet-barangay-number',
               html: `<div style="font-weight: 700; font-size: 0.7rem; color: #404040; opacity: 0.8; font-style: italic; white-space: nowrap; transform: translate(-50%, -50%); pointer-events: none; font-family: sans-serif;">${bnum.text}</div>`,
               iconSize: [0, 0] // the CSS translate will center the text exactly
            });
            L.marker([bnum.lat, bnum.lng], { icon: icon, interactive: false, zIndexOffset: -100 }).addTo(mapInstanceRef.current);
        });
      }

      // Outline border of North Caloocan
      L.polygon(NORTH_CALOOCAN_POLYGON, {
        color: '#c54914',
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0,
        interactive: false,
        dashArray: '6 4',
      }).addTo(mapInstanceRef.current);

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
      alert('Geolocation is not supported by your browser');
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
          alert('Your current location is outside North Caloocan. Please select your location manually on the map.');
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
        alert(msg);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-xl overflow-hidden border border-neutral-300"
        />
        
        {/* Current Location Button (optional inside map) */}
        {showInMapButton && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="absolute top-3 right-3 bg-white hover:bg-neutral-50 text-neutral-700 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
          >
            📍 Use My Location
          </button>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <p className="text-sm font-medium text-primary-900 mb-1">Selected Location:</p>
          {loadingAddress ? (
            <p className="text-sm text-primary-700">Loading address...</p>
          ) : (
            <p className="text-sm text-primary-700">{selectedLocation.address}</p>
          )}
        </div>
      )}

      {!selectedLocation && (
        <p className="text-sm text-neutral-600 text-center">
          Click on the map to select a location
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
