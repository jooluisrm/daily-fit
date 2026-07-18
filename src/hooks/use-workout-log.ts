import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkoutLogAPI } from '../services/api/workout-log.api';

const getLocalDayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  // Use en-CA for guaranteed YYYY-MM-DD format in local time
  const dateStr = new Date().toLocaleDateString('en-CA'); 
  
  return { 
    startIso: start.toISOString(), 
    endIso: end.toISOString(),
    dateStr
  };
};

export const useTodayWorkoutStatus = (workoutId: string | undefined) => {
  const { startIso, endIso, dateStr } = getLocalDayBounds();
  return useQuery({
    queryKey: ['workout-status', workoutId, dateStr],
    queryFn: () => WorkoutLogAPI.getTodayStatus(workoutId!, startIso, endIso),
    enabled: !!workoutId,
  });
};

export const useTodayAllWorkoutLogs = () => {
  const { startIso, endIso, dateStr } = getLocalDayBounds();
  return useQuery({
    queryKey: ['today-all-workout-logs', dateStr],
    queryFn: () => WorkoutLogAPI.getTodayAllLogs(startIso, endIso),
  });
};

export const useStartWorkout = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();
  const { startIso, endIso } = getLocalDayBounds();

  return useMutation({
    mutationFn: () => WorkoutLogAPI.startWorkout(workoutId!, startIso, endIso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-status', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['today-all-workout-logs'] });
    },
  });
};

export const useUpdateWorkoutStatus = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();
  const { startIso, endIso } = getLocalDayBounds();

  return useMutation({
    mutationFn: ({ status, hasCardio }: { status: string, hasCardio?: boolean }) => 
      WorkoutLogAPI.updateWorkoutStatus(workoutId!, status, hasCardio, startIso, endIso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-status', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['today-all-workout-logs'] });
    },
  });
};

export const useToggleWorkoutStatus = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();
  const { startIso, endIso } = getLocalDayBounds();

  return useMutation({
    mutationFn: (isCompleted: boolean) => 
      WorkoutLogAPI.toggleWorkoutStatus(workoutId!, isCompleted, startIso, endIso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-status', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['today-all-workout-logs'] });
    },
  });
};
