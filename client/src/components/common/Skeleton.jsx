/**
 * Skeleton Loading Components
 * Provides smooth loading states for various UI elements
 */

/**
 * Base Skeleton Component
 */
const Skeleton = ({ className = '', animate = true }) => (
  <div
    className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
  />
);

/**
 * Text Skeleton - For text lines
 */
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

/**
 * Card Skeleton - For report cards and similar
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-4 ${className}`}>
    <div className="flex gap-4">
      {/* Image placeholder */}
      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Report Card Skeleton - Specific for flood reports
 */
export const SkeletonReportCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Image */}
    <Skeleton className="w-full h-48" />

    {/* Content */}
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* Description */}
      <SkeletonText lines={2} />
    </div>
  </div>
);

/**
 * Stats Card Skeleton
 */
export const SkeletonStats = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

/**
 * Table Row Skeleton
 */
export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

/**
 * Map Skeleton
 */
export const SkeletonMap = ({ className = '' }) => (
  <div className={`relative bg-gray-100 rounded-xl overflow-hidden ${className}`}>
    <Skeleton className="w-full h-full min-h-[400px]" animate={false} />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full animate-pulse" />
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    </div>
  </div>
);

/**
 * Avatar Skeleton
 */
export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
};

/**
 * Feed Page Skeleton - Complete feed loading state
 */
export const SkeletonFeedPage = () => (
  <div className="space-y-6">
    {/* Stats */}
    <SkeletonStats count={3} />

    {/* Tabs */}
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-lg" />
      ))}
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonReportCard key={i} />
      ))}
    </div>
  </div>
);

/**
 * Dashboard Skeleton
 */
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>

    {/* Stats Row */}
    <SkeletonStats count={4} />

    {/* Chart Placeholder */}
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
