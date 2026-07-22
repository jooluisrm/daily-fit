import { api } from '@/src/lib/axios';

export const CreatineAPI = {
  getTodayStatus: async (): Promise<{ tookToday: boolean }> => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await api.get(`/creatine?tz=${tz}`);
    return response.data;
  },

  takeCreatine: async (): Promise<void> => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await api.post(`/creatine?tz=${tz}`);
  },

  removeCreatine: async (): Promise<void> => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await api.delete(`/creatine?tz=${tz}`);
  }
};
