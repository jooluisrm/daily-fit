import { api } from '@/src/lib/axios';

export type ExerciseLog = {
  id: string;
  setNumber: number;
  weight: number;
  repsDone: number;
  date: string;
};

export type Exercise = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

export type WorkoutExercise = {
  id: string;
  workoutId: string;
  exerciseId: string;
  sets: number;
  reps: string;
  order: number;
  exercise: Exercise;
  logs: ExerciseLog[];
};

export const ExerciseAPI = {
  getWorkoutExercises: async (workoutId: string): Promise<WorkoutExercise[]> => {
    const response = await api.get(`/workouts/${workoutId}/exercises`);
    return response.data;
  },

  addExerciseToWorkout: async (workoutId: string, data: { name: string; image?: string; sets: number; reps: string }): Promise<WorkoutExercise> => {
    const response = await api.post(`/workouts/${workoutId}/exercises`, data);
    return response.data;
  },

  logExercise: async (workoutExerciseId: string, data: { setNumber: number; weight: number; repsDone: number }): Promise<ExerciseLog> => {
    const response = await api.post(`/workouts/exercises/${workoutExerciseId}/log`, data);
    return response.data;
  }
};
