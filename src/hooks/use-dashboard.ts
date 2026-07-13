import { useQuery } from '@tanstack/react-query';
import { DashboardAPI } from '../services/api/dashboard.api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => DashboardAPI.getStats()
  });
};
