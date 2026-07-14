import { api } from '@/src/lib/axios';

export type WaterData = {
  totalConsumed: number;
  goal: number;
  quickAdds: number[];
  logs?: any[];
};

export const WaterAPI = {
  getTodayData: async (): Promise<WaterData> => {
    const response = await api.get('/water');
    return response.data;
  },

  addWater: async (amount: number): Promise<any> => {
    const response = await api.post('/water', { amount });
    return response.data;
  },

  updateSettings: async (data: { goal: number, quickAdds: number[] }): Promise<any> => {
    const response = await api.put('/water/settings', data);
    return response.data;
  },

  autoCalculateGoal: async (): Promise<{ success: boolean, suggestedGoal: number, details: any }> => {
    const response = await api.get('/water/auto-calculate');
    return response.data;
  }
};
