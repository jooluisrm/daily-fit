import { api } from '@/src/lib/axios';

export type WorkoutLog = {
  id: string;
  userId: string;
  workoutId: string;
  date: string;
};

export const WorkoutLogAPI = {
  getTodayStatus: async (workoutId: string, date?: string): Promise<WorkoutLog | null> => {
    const url = date ? `/workouts/${workoutId}/status?date=${date}` : `/workouts/${workoutId}/status`;
    const response = await api.get(url);
    return response.data;
  },

  toggleWorkoutStatus: async (workoutId: string, isCompleted: boolean): Promise<WorkoutLog | null> => {
    const response = await api.post(`/workouts/${workoutId}/status`, { isCompleted });
    return response.data;
  }
};
