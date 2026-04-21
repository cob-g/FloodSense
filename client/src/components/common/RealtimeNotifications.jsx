import useReportValidationNotifier from '../../hooks/useReportValidationNotifier';
import useCriticalSensorNotifier from '../../hooks/useCriticalSensorNotifier';

const RealtimeNotifications = () => {
  useReportValidationNotifier();
  useCriticalSensorNotifier();
  return null;
};

export default RealtimeNotifications;
