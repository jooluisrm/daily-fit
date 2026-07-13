import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExerciseAPI } from '../services/api/exercise.api';

export const useWorkoutExercises = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout-exercises', workoutId],
    queryFn: () => ExerciseAPI.getWorkoutExercises(workoutId),
    enabled: !!workoutId,
  });
};

export const useAddExerciseToWorkout = (workoutId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; image?: string; sets: number; reps: string }) => 
      ExerciseAPI.addExerciseToWorkout(workoutId, data),
    onSuccess: () => {
      // Atualiza o cache da lista de exercícios desse treino
      queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] });
    },
  });
};

export const useLogExercise = (workoutId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutExerciseId, setNumber, weight, repsDone }: { workoutExerciseId: string; setNumber: number; weight: number; repsDone: number }) => 
      ExerciseAPI.logExercise(workoutExerciseId, { setNumber, weight, repsDone }),
    onSuccess: () => {
      // Invalida a lista para que a UI receba os dados do último log atualizados
      queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] });
    },
  });
};
