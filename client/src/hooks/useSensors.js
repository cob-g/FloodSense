import { useQuery } from '@tanstack/react-query';
import { sensorsService } from '../services/sensors.service';

export const useSensors = (params = {}, options = {}) => {
  const { withStatus, ...rest } = params;

  return useQuery({
    queryKey: ['sensors', params],
    queryFn: () => {
      if (withStatus) {
        return sensorsService.listSensorsWithStatus(rest);
      }
      return sensorsService.getReadings(rest);
    },
    ...options,
  });
};

export const useLatestSensor = (options = {}) => {
  return useQuery({
    queryKey: ['sensors', 'latest'],
    queryFn: () => sensorsService.getLatest(),
    ...options,
  });
};
