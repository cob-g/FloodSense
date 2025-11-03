import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const LocationPicker = ({ onLocationSelect, initialLocation, registerUseMyLocation, showInMapButton = true }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      const initialCenter = initialLocation 
        ? [initialLocation.lat, initialLocation.lng]
        : DEFAULT_MAP_CENTER;

      mapInstanceRef.current = L.map(mapRef.current).setView(initialCenter, DEFAULT_MAP_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
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

  // Expose the 'Use My Location' handler to parent (if provided)
  useEffect(() => {
    if (typeof registerUseMyLocation === 'function') {
      registerUseMyLocation(() => handleUseCurrentLocation());
    }
  }, [registerUseMyLocation]);

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
    addMarker(lat, lng);

    setLoadingAddress(true);
    
    // Reverse geocoding using Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapInstanceRef.current.setView([latitude, longitude], 16);
        handleMapClick({ latlng: { lat: latitude, lng: longitude } });
      },
      (error) => {
        alert('Unable to get your location: ' + error.message);
      }
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
