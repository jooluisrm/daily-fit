import { api } from '@/src/lib/axios';

export type WorkoutLog = {
  id: string;
  userId: string;
  workoutId: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  hasCardio: boolean;
  date: string;
};

export const WorkoutLogAPI = {
  getTodayStatus: async (workoutId: string, date?: string): Promise<WorkoutLog | null> => {
    const url = date ? `/workouts/${workoutId}/status?date=${date}` : `/workouts/${workoutId}/status`;
    const response = await api.get(url);
    return response.data;
  },

  getTodayAllLogs: async (date?: string): Promise<(WorkoutLog & { workout: { id: string, name: string } })[]> => {
    const url = date ? `/workouts/today/logs?date=${date}` : `/workouts/today/logs`;
    const response = await api.get(url);
    return response.data;
  },

  startWorkout: async (workoutId: string): Promise<WorkoutLog> => {
    const response = await api.post(`/workouts/${workoutId}/status`, { action: 'start' });
    return response.data;
  },

  updateWorkoutStatus: async (workoutId: string, status: string, hasCardio?: boolean): Promise<WorkoutLog> => {
    const response = await api.post(`/workouts/${workoutId}/status`, { action: 'update_status', status, hasCardio });
    return response.data;
  },

  toggleWorkoutStatus: async (workoutId: string, isCompleted: boolean): Promise<WorkoutLog | null> => {
    const response = await api.post(`/workouts/${workoutId}/status`, { isCompleted });
    return response.data;
  }
};
