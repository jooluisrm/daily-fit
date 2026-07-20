import { api } from '@/src/lib/axios';

export type CardioLog = {
  id: string;
  userId: string;
  workoutId?: string;
  workoutLogId?: string;
  type: string;
  intensity?: string | null;
  duration: number;
  targetDuration?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  status: string;
  date: string;
};

export const CardioAPI = {
  getTodayCardio: async (startIso?: string, endIso?: string): Promise<CardioLog | null> => {
    const params = new URLSearchParams();
    if (startIso) params.append('startIso', startIso);
    if (endIso) params.append('endIso', endIso);
    const queryString = params.toString();
    const url = `/cardio${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getCardioLogs: async (): Promise<CardioLog[]> => {
    const response = await api.get('/cardio/logs');
    return response.data;
  },

  logCardio: async (data: {
    intensity?: string;
    duration: number;
    workoutId?: string;
    workoutLogId?: string;
    type?: string;
    targetDuration?: number;
    startTime?: Date | string;
    endTime?: Date | string;
    status?: string;
    startIso?: string;
    endIso?: string;
  }): Promise<CardioLog | null> => {
    const response = await api.post('/cardio', data);
    return response.data;
  }
};
