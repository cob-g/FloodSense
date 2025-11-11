import { useEffect, useMemo, useState } from 'react';

export function useNetwork() {
  const getConnection = () => (typeof navigator !== 'undefined' ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) : null);
  const conn = getConnection();
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [effectiveType, setEffectiveType] = useState(conn?.effectiveType || '4g');
  const [saveData, setSaveData] = useState(!!conn?.saveData);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    let unsub = null;
    if (conn && typeof conn.addEventListener === 'function') {
      const handleChange = () => {
        setEffectiveType(conn.effectiveType || '4g');
        setSaveData(!!conn.saveData);
      };
      conn.addEventListener('change', handleChange);
      unsub = () => conn.removeEventListener('change', handleChange);
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (unsub) unsub();
    };
  }, []);

  const isSlow = useMemo(() => {
    const type = (effectiveType || '').toLowerCase();
    return saveData || type === 'slow-2g' || type === '2g' || type === '3g';
  }, [effectiveType, saveData]);

  return { online, effectiveType, saveData, isSlow };
}
