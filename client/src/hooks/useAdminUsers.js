import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';

export const useAdminUsers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => usersService.list(params),
    ...options,
  });
};

export const useArchivedAdminUsers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['admin-users', 'archived', params],
    queryFn: () => usersService.list({ ...params, archived: true }),
    ...options,
  });
};

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => usersService.updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => usersService.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};
