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
