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
  getTodayStatus: async (workoutId: string, startIso?: string, endIso?: string): Promise<WorkoutLog | null> => {
    const url = (startIso && endIso) ? `/workouts/${workoutId}/status?start=${startIso}&end=${endIso}` : `/workouts/${workoutId}/status`;
    const response = await api.get(url);
    return response.data;
  },

  getTodayAllLogs: async (startIso?: string, endIso?: string): Promise<(WorkoutLog & { workout: { id: string, name: string } })[]> => {
    const url = (startIso && endIso) ? `/workouts/today/logs?start=${startIso}&end=${endIso}` : `/workouts/today/logs`;
    const response = await api.get(url);
    return response.data;
  },

  startWorkout: async (workoutId: string, startIso?: string, endIso?: string): Promise<WorkoutLog> => {
    const response = await api.post(`/workouts/${workoutId}/status`, { action: 'start', startIso, endIso });
    return response.data;
  },

  updateWorkoutStatus: async (workoutId: string, status: string, hasCardio?: boolean, startIso?: string, endIso?: string): Promise<WorkoutLog> => {
    const response = await api.post(`/workouts/${workoutId}/status`, { action: 'update_status', status, hasCardio, startIso, endIso });
    return response.data;
  },

  toggleWorkoutStatus: async (workoutId: string, isCompleted: boolean, startIso?: string, endIso?: string): Promise<WorkoutLog | null> => {
    const response = await api.post(`/workouts/${workoutId}/status`, { isCompleted, startIso, endIso });
    return response.data;
  }
};
