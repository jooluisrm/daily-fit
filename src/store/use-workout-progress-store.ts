import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkoutProgressState {
  workoutId: string | null;
  date: string | null;
  currentIndex: number;
  currentSet: number;
  setProgress: (workoutId: string, date: string, index: number, set: number) => void;
  clearProgress: () => void;
}

export const useWorkoutProgressStore = create<WorkoutProgressState>()(
  persist(
    (set) => ({
      workoutId: null,
      date: null,
      currentIndex: 0,
      currentSet: 1,

      setProgress: (workoutId, date, index, currentSet) => 
        set({ workoutId, date, currentIndex: index, currentSet }),

      clearProgress: () => 
        set({ workoutId: null, date: null, currentIndex: 0, currentSet: 1 }),
    }),
    {
      name: 'daily-fit-workout-progress', // name of the item in the storage (must be unique)
    }
  )
);
