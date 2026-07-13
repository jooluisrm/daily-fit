import { api } from '@/src/lib/axios';

export type WeightLog = {
  id: string;
  userId: string;
  weight: number;
  date: string;
};

export const WeightAPI = {
  getLogs: async (): Promise<WeightLog[]> => {
    const response = await api.get('/weight');
    return response.data;
  },
  
  createLog: async (data: { weight: number, date?: string }): Promise<WeightLog> => {
    const response = await api.post('/weight', data);
    return response.data;
  }
};
