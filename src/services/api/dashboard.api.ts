import { api } from '@/src/lib/axios';

export type DashboardStats = {
  totalWorkouts: number;
  totalVolume: number;
  totalCardioMinutes: number;
  streak: {
    date: string;
    dayName: string;
    completed: boolean;
    isToday: boolean;
    isFuture: boolean;
    isRestDay: boolean;
    missedWorkout: boolean;
  }[];
  volumeByWorkout: Record<string, number>;
  activeWorkouts: {
    id: string;
    name: string;
  }[];
};

export const DashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};
