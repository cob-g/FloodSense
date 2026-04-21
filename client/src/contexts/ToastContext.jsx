import { createContext, useContext, useCallback } from 'react';
import { sileo } from 'sileo';

const ToastContext = createContext(null);

const getToastPayload = ({ message, description }) => ({
    title: message,
    description,
    duration: description ? 5000 : 3000,
  });

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'info', description) => {
    const payload = getToastPayload({ message, description });
    sileo[type]?.(payload) ?? sileo.info(payload);
  }, []);

  const success = useCallback((message, description) => sileo.success(getToastPayload({ message, description })), []);
  const error   = useCallback((message, description) => sileo.error(getToastPayload({ message, description })), []);
  const warning = useCallback((message, description) => sileo.warning(getToastPayload({ message, description })), []);
  const info    = useCallback((message, description) => sileo.info(getToastPayload({ message, description })), []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
