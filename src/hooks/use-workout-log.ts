import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkoutLogAPI } from '../services/api/workout-log.api';

export const useTodayWorkoutStatus = (workoutId: string | undefined, date?: string) => {
  return useQuery({
    queryKey: ['workout-status', workoutId, date],
    queryFn: () => WorkoutLogAPI.getTodayStatus(workoutId!, date),
    enabled: !!workoutId,
  });
};

export const useToggleWorkoutStatus = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isCompleted: boolean) => 
      WorkoutLogAPI.toggleWorkoutStatus(workoutId!, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-status', workoutId] });
    },
  });
};
