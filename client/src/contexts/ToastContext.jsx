import { createContext, useContext, useCallback } from 'react';
import { sileo } from 'sileo';

const ToastContext = createContext(null);

const FILL = '#1a0a00'; // deepest FloodSense brand dark — feels native to the system

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'info', description) => {
    sileo[type]?.({ title: message, description, fill: FILL, duration: description ? 5000 : 3000 }) ?? sileo.info({ title: message, description, fill: FILL, duration: description ? 5000 : 3000 });
  }, []);

  const success = useCallback((message, description) => sileo.success({ title: message, description, fill: FILL, duration: description ? 5000 : 3000 }), []);
  const error   = useCallback((message, description) => sileo.error({   title: message, description, fill: FILL, duration: description ? 5000 : 3000 }), []);
  const warning = useCallback((message, description) => sileo.warning({ title: message, description, fill: FILL, duration: description ? 5000 : 3000 }), []);
  const info    = useCallback((message, description) => sileo.info({    title: message, description, fill: FILL, duration: description ? 5000 : 3000 }), []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
