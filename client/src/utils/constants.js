// Flood depth options
export const DEPTH_OPTIONS = ['Ankle', 'Knee', 'Waist', 'Chest'];

// Road passability options
export const PASSABILITY_OPTIONS = [
  { value: 'Passable', label: 'Passable (Safe)' },
  { value: 'HeavyOnly', label: 'Passable – Heavy vehicles only' },
  { value: 'NotPassable', label: 'Not passable' },
];

// Report status
export const REPORT_STATUS = {
  UNVERIFIED: 'UNVERIFIED',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED',
};

// Report status labels (Tagalog)
export const STATUS_LABELS = {
  UNVERIFIED: 'Hindi pa nakumpirma',
  VALIDATED: 'Nakumpirma',
  REJECTED: 'Tinanggihan',
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// Severity colors
export const SEVERITY_COLORS = {
  Low: 'text-green-600 bg-green-50',
  Medium: 'text-yellow-600 bg-yellow-50',
  High: 'text-orange-600 bg-orange-50',
  Critical: 'text-red-600 bg-red-50',
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

// Fallback place categories
export const FALLBACK_CATEGORIES = [
  { value: 'evacuation_center', label: 'Evacuation Center' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'school', label: 'School' },
  { value: 'government', label: 'Government Office' },
  { value: 'landmark', label: 'Landmark' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'road', label: 'Road' },
  { value: 'other', label: 'Other' },
];

// Default map center (Philippines - Manila area)
export const DEFAULT_MAP_CENTER = [14.5995, 120.9842];
export const DEFAULT_MAP_ZOOM = 12;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  REPORTS: '/api/reports',
  FALLBACKS: '/api/fallbacks',
  PING: '/api/ping',
};

// Tagalog messages
export const MESSAGES = {
  REPORT_SUCCESS: 'Salamat sa ulat. Ipe-validate ng Barangay DRRM Officer.',
  RATE_LIMIT: 'Nag-submit ka kamakailan. Maaari lamang mag-report kada 3 minuto.',
  OFFLINE_WARNING: 'Offline — showing admin-curated fallback places',
  NETWORK_RESTORED: 'Updated: new data available',
  LOCATION_REQUIRED: 'Mangyaring pumili ng lokasyon sa mapa',
  PHOTO_REQUIRED: 'Mangyaring mag-upload ng larawan',
};

export default {
  DEPTH_OPTIONS,
  PASSABILITY_OPTIONS,
  REPORT_STATUS,
  STATUS_LABELS,
  SEVERITY_LEVELS,
  SEVERITY_COLORS,
  USER_ROLES,
  FALLBACK_CATEGORIES,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  API_ENDPOINTS,
  MESSAGES,
};
