import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatineAPI } from '@/src/services/api/creatine.api';

export function useCreatineStatus() {
  return useQuery({
    queryKey: ['creatine-status'],
    queryFn: CreatineAPI.getTodayStatus,
  });
}

export function useTakeCreatine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CreatineAPI.takeCreatine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatine-status'] });
    },
  });
}

export function useRemoveCreatine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CreatineAPI.removeCreatine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatine-status'] });
    },
  });
}
