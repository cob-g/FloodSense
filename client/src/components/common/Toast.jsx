import { useEffect } from 'react';

export const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'border-green-500/30 bg-green-500/10 backdrop-blur-lg',
    error: 'border-red-500/30 bg-red-500/10 backdrop-blur-lg',
    warning: 'border-amber-500/30 bg-amber-500/10 backdrop-blur-lg',
    info: 'border-blue-500/30 bg-blue-500/10 backdrop-blur-lg',
  };

  const textStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="animate-slide-in-right">
      <div 
        className={`${typeStyles[type]} ${textStyles[type]} border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md backdrop-blur-lg transition-all duration-300 transform hover:scale-[1.02]`}
      >
        <div className={`p-1.5 rounded-lg ${textStyles[type].replace('text-', 'bg-').replace(/\/.*$/, '')}/10`}>
          {icons[type]}
        </div>
        <p className="flex-1 font-medium text-white/90">{message}</p>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
