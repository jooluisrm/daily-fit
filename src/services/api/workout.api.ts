import { api } from '@/src/lib/axios';

export type Workout = {
  id: string;
  name: string;
  daysOfWeek: number[];
  createdAt: string;
};

export const WorkoutAPI = {
  getWorkouts: async (): Promise<Workout[]> => {
    const response = await api.get('/workouts');
    return response.data;
  },

  createWorkout: async (data: { name: string, daysOfWeek: number[] }): Promise<Workout> => {
    const response = await api.post('/workouts', data);
    return response.data;
  }
};
