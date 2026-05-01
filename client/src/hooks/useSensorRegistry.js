import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensorsService } from '../services/sensors.service';

export const useListSensors = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['sensors', 'registry', params],
    queryFn: () => sensorsService.listSensors(params),
    ...options,
  });
};

export const useListSensorsWithStatus = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['sensors', 'with-status', params],
    queryFn: () => sensorsService.listSensorsWithStatus(params),
    refetchInterval: params?.archived ? false : 30000,
    ...options,
  });
};

export const useCreateSensor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sensorsService.createSensor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sensors'] });
    },
  });
};

export const useUpdateSensor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sensorsService.updateSensor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sensors'] });
    },
  });
};

export const useDeleteSensor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sensorsService.deleteSensor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sensors'] });
    },
  });
};

export const useRestoreSensor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sensorsService.restoreSensor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sensors'] });
    },
  });
};
