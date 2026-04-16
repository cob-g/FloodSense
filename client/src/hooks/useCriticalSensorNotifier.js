import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import { useToast } from '../contexts/ToastContext';

const CRITICAL_THRESHOLD_CM = 40;
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

const getSensorKey = (reading) => {
  if (reading?.sensorId) return String(reading.sensorId);
  if (reading?._id) return String(reading._id);

  const lat = Number(reading?.location?.lat);
  const lng = Number(reading?.location?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${lat}:${lng}`;
  }

  return null;
};

const getLocationLabel = (reading) => {
  if (reading?.locationName) return reading.locationName;
  if (reading?.location?.name) return reading.location.name;
  if (reading?.sensorId) return `Sensor ${reading.sensorId}`;
  return 'Unknown location';
};

const formatDistance = (distance) => {
  if (!Number.isFinite(distance)) return 'N/A';
  return Number.isInteger(distance) ? `${distance}` : distance.toFixed(1);
};

export const useCriticalSensorNotifier = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { warning } = useToast();
  const lastAlertRef = useRef(new Map());

  useEffect(() => {
    lastAlertRef.current.clear();
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (!socket || !user) return;

    const onSensorUpdate = (reading) => {
      const distance = Number(reading?.distance);
      if (!Number.isFinite(distance)) return;

      const sensorKey = getSensorKey(reading);
      if (!sensorKey) return;

      if (distance >= CRITICAL_THRESHOLD_CM) {
        // Reset cooldown after recovery so a new critical transition alerts immediately.
        lastAlertRef.current.delete(sensorKey);
        return;
      }

      const now = Date.now();
      const lastAlertAt = lastAlertRef.current.get(sensorKey);
      if (lastAlertAt && now - lastAlertAt < ALERT_COOLDOWN_MS) return;

      lastAlertRef.current.set(sensorKey, now);

      const locationLabel = getLocationLabel(reading);
      const distanceLabel = formatDistance(distance);

      warning(
        'Critical sensor alert',
        `${locationLabel} is now Not Passable (${distanceLabel} cm water level).`
      );
    };

    socket.on('update', onSensorUpdate);

    return () => {
      socket.off('update', onSensorUpdate);
    };
  }, [socket, user, warning]);
};

export default useCriticalSensorNotifier;
