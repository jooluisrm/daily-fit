import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkoutLogAPI } from '../services/api/workout-log.api';

export const useTodayWorkoutStatus = (workoutId: string | undefined) => {
  return useQuery({
    queryKey: ['workout-status', workoutId],
    queryFn: () => WorkoutLogAPI.getTodayStatus(workoutId!),
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
