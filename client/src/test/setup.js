import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock navigator.onLine
let isOnline = true;

Object.defineProperty(navigator, 'onLine', {
  get: () => isOnline,
  configurable: true,
});

// Helper to simulate online/offline
global.setOnlineStatus = (status) => {
  isOnline = status;
  window.dispatchEvent(new Event(status ? 'online' : 'offline'));
};

// Mock Network Information API
const connectionMock = {
  effectiveType: '4g',
  saveData: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(navigator, 'connection', {
  get: () => connectionMock,
  configurable: true,
});

// Helper to set connection type
global.setConnectionType = (type, saveData = false) => {
  connectionMock.effectiveType = type;
  connectionMock.saveData = saveData;
  // Trigger change event
  const event = new Event('change');
  connectionMock.addEventListener.mock.calls.forEach(([, callback]) => {
    callback(event);
  });
};

// Mock IntersectionObserver (for lazy loading components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver (for responsive components)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia (for responsive design tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset mocks before each test
beforeEach(() => {
  isOnline = true;
  connectionMock.effectiveType = '4g';
  connectionMock.saveData = false;
  localStorage.clear();
  vi.clearAllMocks();
});
