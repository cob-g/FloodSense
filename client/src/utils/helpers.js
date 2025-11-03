/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  return past.toLocaleDateString();
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get status color classes
 */
export const getStatusColor = (status) => {
  const colors = {
    UNVERIFIED: 'border-l-warning-500 bg-warning-50',
    VALIDATED: 'border-l-primary-500 bg-primary-50',
    REJECTED: 'border-l-danger-500 bg-danger-50',
  };
  return colors[status] || 'border-l-neutral-300 bg-neutral-50';
};

/**
 * Get severity badge color (Dark Theme)
 */
export const getSeverityColor = (severity) => {
  const colors = {
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    MODERATE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    SEVERE: 'bg-red-500/10 text-red-400 border-red-500/30',
    // Legacy support
    Low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    Critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return colors[severity] || 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
};

/**
 * Check if user has required role
 */
export const hasRole = (user, requiredRole) => {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  if (requiredRole === 'admin') {
    return user.role === 'admin' || user.role === 'superadmin';
  }
  return user.role === requiredRole;
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat, lng) => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(2); // Distance in km
};

/**
 * Check if online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Get connection type
 */
export const getConnectionType = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return connection?.effectiveType || '4g';
};

/**
 * Check if slow connection
 */
export const isSlowConnection = () => {
  const connectionType = getConnectionType();
  return ['slow-2g', '2g', '3g'].includes(connectionType);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  formatRelativeTime,
  formatDate,
  truncateText,
  getStatusColor,
  getSeverityColor,
  hasRole,
  formatCoordinates,
  calculateDistance,
  isOnline,
  getConnectionType,
  isSlowConnection,
  debounce,
  throttle,
};
