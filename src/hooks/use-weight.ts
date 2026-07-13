import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WeightAPI } from '../services/api/weight.api';

export const useWeightLogs = () => {
  return useQuery({
    queryKey: ['weight-logs'],
    queryFn: () => WeightAPI.getLogs()
  });
};

export const useCreateWeightLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: WeightAPI.createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
    }
  });
};
