import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CardioAPI } from '../services/api/cardio.api';

export const useTodayCardio = () => {
  return useQuery({
    queryKey: ['today-cardio'],
    queryFn: () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return CardioAPI.getTodayCardio(startOfDay.toISOString(), endOfDay.toISOString());
    },
  });
};

export const useCardioLogs = () => {
  return useQuery({
    queryKey: ['cardio-logs'],
    queryFn: () => CardioAPI.getCardioLogs(),
  });
};

export const useLogCardio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      intensity?: string;
      duration: number;
      workoutId?: string;
      workoutLogId?: string;
      type?: string;
      targetDuration?: number;
      startTime?: Date | string;
      endTime?: Date | string;
      status?: string;
    }) => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return CardioAPI.logCardio({
        ...data,
        startIso: startOfDay.toISOString(),
        endIso: endOfDay.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-cardio'] });
      queryClient.invalidateQueries({ queryKey: ['cardio-logs'] });
    },
  });
};
