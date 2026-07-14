import { api } from '@/src/lib/axios';

export type CardioLog = {
  id: string;
  userId: string;
  workoutId?: string;
  workoutLogId?: string;
  type: string;
  intensity: string;
  duration: number;
  targetDuration?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  date: string;
};

export const CardioAPI = {
  getTodayCardio: async (): Promise<CardioLog | null> => {
    const response = await api.get('/cardio');
    return response.data;
  },

  getCardioLogs: async (): Promise<CardioLog[]> => {
    const response = await api.get('/cardio/logs');
    return response.data;
  },

  logCardio: async (data: { 
    intensity: string; 
    duration: number; 
    workoutId?: string;
    workoutLogId?: string;
    type?: string;
    targetDuration?: number;
    startTime?: Date | string;
    endTime?: Date | string;
  }): Promise<CardioLog | null> => {
    const response = await api.post('/cardio', data);
    return response.data;
  }
};
