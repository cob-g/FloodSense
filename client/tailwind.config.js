/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Space Black Theme
        'space': {
          '50': '#f8f9fa',
          '100': '#f1f3f5',
          '200': '#e9ecef',
          '300': '#dee2e6',
          '400': '#ced4da',
          '500': '#adb5bd',
          '600': '#868e96',
          '700': '#495057',
          '800': '#343a40',
          '900': '#1a1d23',
          '950': '#0a0a12',
        },
        // Accent Orange
        'accent': {
          '50': '#fff5f0',
          '100': '#ffe6d9',
          '200': '#ffccb3',
          '300': '#ffaa80',
          '400': '#ff8c4d',
          '500': '#ff5e1a',
          '600': '#e64500',
          '700': '#bf3800',
          '800': '#993000',
          '900': '#662000',
        },
        // Bright Orange
        'bright': {
          '50': '#fff7f2',
          '100': '#ffede0',
          '200': '#ffd6b8',
          '300': '#ffb88c',
          '400': '#ff8c42',
          '500': '#ff6b1a',
          '600': '#f05a00',
          '700': '#cc4c00',
          '800': '#993800',
          '900': '#662600',
        },
        // Success (Green)
        'success': {
          '50': '#f0fdf4',
          '100': '#dcfce7',
          '200': '#bbf7d0',
          '300': '#86efac',
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
          '800': '#166534',
          '900': '#14532d',
        },
        // Warning (Amber)
        'warning': {
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '300': '#fcd34d',
          '400': '#fbbf24',
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
          '800': '#92400e',
          '900': '#78350f',
        },
        // Danger (Red)
        'danger': {
          '50': '#fef2f2',
          '100': '#fee2e2',
          '200': '#fecaca',
          '300': '#fca5a5',
          '400': '#f87171',
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c',
          '800': '#991b1b',
          '900': '#7f1d1d',
        },
        // Primary (Blue)
        'primary': {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
        },
        // Secondary (Indigo)
        'secondary': {
          '50': '#eef2ff',
          '100': '#e0e7ff',
          '200': '#c7d2fe',
          '300': '#a5b4fc',
          '400': '#818cf8',
          '500': '#6366f1',
          '600': '#4f46e5',
          '700': '#4338ca',
          '800': '#3730a3',
          '900': '#312e81',
        },
        // Neutral colors
        'neutral': {
          '50': '#f9fafb',
          '100': '#f3f4f6',
          '200': '#e5e7eb',
          '300': '#d1d5db',
          '400': '#9ca3af',
          '500': '#6b7280',
          '600': '#4b5563',
          '700': '#374151',
          '800': '#1f2937',
          '900': '#111827',
          '950': '#030712'
        },
        // Gray scale (legacy)
        'gray': {
          '50': '#fafafa',
          '100': '#f5f5f5',
          '200': '#eeeeee',
          '300': '#e0e0e0',
          '400': '#bdbdbd',
          '500': '#9e9e9e',
          '600': '#757575',
          '700': '#616161',
          '800': '#424242',
          '900': '#212121'
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'material': '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
        'material-lg': '0 4px 8px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
