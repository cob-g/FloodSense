import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fallbacksService } from '../services/fallbacks.service';
import { setFallbacks } from '../lib/idb';

export const useFallbacks = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['fallbacks', params],
    queryFn: () => fallbacksService.getFallbacks(params),
    onSuccess: (res) => {
      try {
        const list = res?.data?.places || res?.places || res?.data?.fallbacks || res?.fallbacks || [];
        localStorage.setItem('fallbacks_cache', JSON.stringify(list));
        setFallbacks(list);
      } catch (e) {
        // ignore caching errors
      }
    },
    ...options,
  });
};

export const useCreateFallback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fallbacksService.createFallback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fallbacks'] });
    }
  });
};

export const useUpdateFallback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => fallbacksService.updateFallback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fallbacks'] });
    }
  });
};

export const useDeleteFallback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fallbacksService.deleteFallback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fallbacks'] });
    }
  });
};
