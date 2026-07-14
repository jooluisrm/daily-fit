import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkoutLogAPI } from '../services/api/workout-log.api';

export const useTodayWorkoutStatus = (workoutId: string | undefined, date?: string) => {
  return useQuery({
    queryKey: ['workout-status', workoutId, date],
    queryFn: () => WorkoutLogAPI.getTodayStatus(workoutId!, date),
    enabled: !!workoutId,
  });
};

export const useTodayAllWorkoutLogs = (date?: string) => {
  return useQuery({
    queryKey: ['today-all-workout-logs', date],
    queryFn: () => WorkoutLogAPI.getTodayAllLogs(date),
  });
};

export const useStartWorkout = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => WorkoutLogAPI.startWorkout(workoutId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-status', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['today-all-workout-logs'] });
    },
  });
};

export const useUpdateWorkoutStatus = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, hasCardio }: { status: string, hasCardio?: boolean }) => 
      WorkoutLogAPI.updateWorkoutStatus(workoutId!, status, hasCardio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-status', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['today-all-workout-logs'] });
    },
  });
};

export const useToggleWorkoutStatus = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isCompleted: boolean) => 
      WorkoutLogAPI.toggleWorkoutStatus(workoutId!, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-status', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['today-all-workout-logs'] });
    },
  });
};
