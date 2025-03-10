import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { User, UserFilters, CreateUserDTO, UpdateUserStatusDTO, PaginatedResponse } from '../types/user';
import { getUsers, createUser, updateUserStatus, deleteUser } from '@/app/api/users';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner'
export const useUsers = (page: number = 1, filters: UserFilters = {}) => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: ['users', page, filters],
    queryFn: () => getUsers({
      page,
      filters,
      })
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AxiosResponse<User>, Error, CreateUserDTO>({
    mutationFn: (userData) => createUser({
      userData,
      
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('User added successfully');
    }
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    AxiosResponse<User>,
    Error,
    { userId: string; statusData: UpdateUserStatusDTO }
  >({
    mutationFn: ({ userId, statusData }) => updateUserStatus({
      userId,
      statusData,
       }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('User status updated successfully');
    }
  });
};

export const useDeleteUser = (): UseMutationResult<
  AxiosResponse<void>,
  Error,
  string,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<void>, Error, string>({
    mutationFn: (userId) =>
      deleteUser({
        userId,
        }),
    onSuccess: () => {
      // Invalidate the 'users' query to refetch the data
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('User deleted successfully');
    },
  });
};