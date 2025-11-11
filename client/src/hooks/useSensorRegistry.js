import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensorsService } from '../services/sensors.service';

export const useListSensors = () => {
  return useQuery({
    queryKey: ['sensors', 'registry'],
    queryFn: sensorsService.listSensors,
  });
};

export const useListSensorsWithStatus = () => {
  return useQuery({
    queryKey: ['sensors', 'with-status'],
    queryFn: sensorsService.listSensorsWithStatus,
    refetchInterval: 30000,
  });
};

export const useCreateSensor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sensorsService.createSensor,
    onSuccess: () => {
      qc.invalidateQueries(['sensors', 'registry']);
      qc.invalidateQueries(['sensors', 'with-status']);
    },
  });
};

export const useUpdateSensor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sensorsService.updateSensor,
    onSuccess: () => {
      qc.invalidateQueries(['sensors', 'registry']);
      qc.invalidateQueries(['sensors', 'with-status']);
    },
  });
};

export const useDeleteSensor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sensorsService.deleteSensor,
    onSuccess: () => {
      qc.invalidateQueries(['sensors', 'registry']);
      qc.invalidateQueries(['sensors', 'with-status']);
    },
  });
};
