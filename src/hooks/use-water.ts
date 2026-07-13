import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WaterAPI } from '../services/api/water.api';

export const useWaterData = () => {
  return useQuery({
    queryKey: ['water-data'],
    queryFn: () => WaterAPI.getTodayData()
  });
};

export const useAddWater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: WaterAPI.addWater,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-data'] });
    }
  });
};

export const useUpdateWaterSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: WaterAPI.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-data'] });
    }
  });
};
