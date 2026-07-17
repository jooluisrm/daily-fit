import { api } from '@/src/lib/axios';

export type Workout = {
  id: string;
  name: string;
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: string;
  workoutLogs?: {
    id: string;
    startTime: string | null;
    endTime: string | null;
    date: string;
  }[];
};

export const WorkoutAPI = {
  getWorkouts: async (): Promise<Workout[]> => {
    const response = await api.get('/workouts');
    return response.data;
  },

  createWorkout: async (data: { name: string, daysOfWeek: number[] }): Promise<Workout> => {
    const response = await api.post('/workouts', data);
    return response.data;
  },

  updateWorkout: async (id: string, data: { name?: string, daysOfWeek?: number[], isActive?: boolean }): Promise<Workout> => {
    const response = await api.put(`/workouts/${id}`, data);
    return response.data;
  },

  deleteWorkout: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },

  syncWorkoutExercises: async (id: string, data: { sets: number, reps: string }): Promise<{ success: boolean, message: string }> => {
    const response = await api.post(`/workouts/${id}/sync-exercises`, data);
    return response.data;
  }
};
