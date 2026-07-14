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
  }
};
