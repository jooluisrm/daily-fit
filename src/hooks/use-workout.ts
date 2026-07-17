import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkoutAPI } from '../services/api/workout.api';

export const useWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => WorkoutAPI.getWorkouts(),
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string, daysOfWeek: number[] }) => WorkoutAPI.createWorkout(data),
    onSuccess: () => {
      // Atualiza o cache da lista de treinos
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useUpdateWorkout = (workoutId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string, daysOfWeek?: number[], isActive?: boolean }) => WorkoutAPI.updateWorkout(workoutId, data),
    onSuccess: () => {
      // Atualiza o cache da lista de treinos
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useDeleteWorkout = (workoutId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => WorkoutAPI.deleteWorkout(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useSyncWorkoutExercises = (workoutId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sets: number, reps: string }) => WorkoutAPI.syncWorkoutExercises(workoutId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] });
    },
  });
};
