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
    sileo[type]?.({ title: message, description, fill: FILL }) ?? sileo.info({ title: message, description, fill: FILL });
  }, []);

  const success = useCallback((message, description) => sileo.success({ title: message, description, fill: FILL }), []);
  const error   = useCallback((message, description) => sileo.error({   title: message, description, fill: FILL }), []);
  const warning = useCallback((message, description) => sileo.warning({ title: message, description, fill: FILL }), []);
  const info    = useCallback((message, description) => sileo.info({    title: message, description, fill: FILL }), []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
