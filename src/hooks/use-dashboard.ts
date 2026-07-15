import { useSuspenseQuery } from '@tanstack/react-query';
import { DashboardAPI } from '../services/api/dashboard.api';

export const useDashboardStats = () => {
  return useSuspenseQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => DashboardAPI.getStats()
  });
};
