import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ToastProvider } from './contexts/ToastContext'
import { Toaster } from 'sileo'
import 'sileo/styles.css'
import App from './App.jsx'
import './index.css'
import { registerSW } from './serviceWorkerRegistration'
import './i18n' // Initialize i18n

const PUBLIC_TOAST_OPTIONS = {
  duration: 5000,
  fill: '#1a0a00',
}

const ADMIN_TOAST_OPTIONS = {
  duration: 5000,
  fill: '#ffffff', // Crisp white background
  styles: {
    toast: 'shadow-xl shadow-slate-200/40 border border-slate-100 rounded-2xl', // Aesthetic clean look
    title: 'text-slate-800 font-semibold',
    description: 'text-slate-500',
    button: 'text-slate-400 hover:text-slate-600 transition-colors',
  },
}

const RouteAwareToaster = () => {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <Toaster
      position={isAdminRoute ? 'bottom-right' : 'top-center'}
      offset={isAdminRoute ? { bottom: 40, right: 32 } : { top: 80 }}
      theme="light"
      options={isAdminRoute ? ADMIN_TOAST_OPTIONS : PUBLIC_TOAST_OPTIONS}
    />
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <App />
              <RouteAwareToaster />
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// Register Service Worker for offline support
registerSW()
