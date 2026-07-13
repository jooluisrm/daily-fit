import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CardioAPI } from '../services/api/cardio.api';

export const useTodayCardio = () => {
  return useQuery({
    queryKey: ['today-cardio'],
    queryFn: () => CardioAPI.getTodayCardio(),
  });
};

export const useLogCardio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { intensity: string; duration: number; workoutId?: string }) => 
      CardioAPI.logCardio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-cardio'] });
    },
  });
};
