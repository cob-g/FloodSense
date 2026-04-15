import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

// Lazy load the heavy MapView component
const MapView = lazy(() => import('./MapView'));

/**
 * LazyMapView - Wrapper for MapView with lazy loading and CLS prevention
 * Reserves space for the map before it loads to prevent layout shifts
 */
const LazyMapView = ({
  reports = [],
  sensors = [],
  className = '',
  style = {},
  height = '500px',
  ...props
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Use Intersection Observer to load map only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before it's visible
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Skeleton loader that reserves exact space
  const MapSkeleton = () => (
    <div
      className={`relative bg-gray-900/50 overflow-hidden w-full h-full`}
    >
      {/* Animated background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,94,26,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,94,26,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative">
          {/* Pulsing circle */}
          <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
          <div className="relative w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-400 text-sm font-medium">Loading map...</p>
      </div>

      {/* Fake map elements for visual hint */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="w-8 h-8 bg-gray-800/60 rounded" />
        <div className="w-8 h-8 bg-gray-800/60 rounded" />
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: height, height: height !== '100%' ? height : undefined, ...style }}
    >
      {shouldLoad ? (
        <Suspense fallback={<MapSkeleton />}>
          <MapView
            reports={reports}
            sensors={sensors}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', minHeight: height }}
            onLoad={() => setIsVisible(true)}
            {...props}
          />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
};

export default LazyMapView;
