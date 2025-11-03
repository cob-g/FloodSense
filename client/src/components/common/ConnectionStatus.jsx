import { useEffect, useState } from 'react';

const ConnectionStatus = ({ className = '' }) => {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
        online
          ? 'bg-green-500/15 text-green-300 border-green-500/30'
          : 'bg-red-500/15 text-red-300 border-red-500/30'
      } ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`} />
      {online ? 'Online' : 'Offline'}
    </div>
  );
};

export default ConnectionStatus;
