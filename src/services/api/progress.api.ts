import { api } from '@/src/lib/axios';

export type SpecificWorkoutProgressData = {
  workoutName: string;
  sessions: {
    date: string;
    volume: number;
    duration: number | null;
  }[];
};

export type WorkoutProgressData = {
  date: string;
  volume: number;
  treinos: number;
};

export type CardioProgressData = {
  date: string;
  esteira: number;
  bike: number;
  escada: number;
};

export type WaterProgressData = {
  date: string;
  amount: number;
  goal: number;
};

export const ProgressAPI = {
  getWorkoutProgress: async (range: string = '30d'): Promise<WorkoutProgressData[]> => {
    const response = await api.get(`/progress/workout?range=${range}`);
    return response.data;
  },
  
  getCardioProgress: async (range: string = '30d'): Promise<CardioProgressData[]> => {
    const response = await api.get(`/progress/cardio?range=${range}`);
    return response.data;
  },

  getWaterProgress: async (range: string = '30d'): Promise<WaterProgressData[]> => {
    const response = await api.get(`/progress/water?range=${range}`);
    return response.data;
  },

  getSpecificWorkoutProgress: async (workoutId: string): Promise<SpecificWorkoutProgressData> => {
    const response = await api.get(`/progress/workout/${workoutId}`);
    return response.data;
  }
};
