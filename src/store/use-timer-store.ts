import { create } from 'zustand'

interface TimerState {
  isResting: boolean
  restTimeLeft: number
  workoutId: string | null
  
  startTimer: (seconds: number, workoutId: string) => void
  stopTimer: () => void
  tick: () => void
  addTime: (seconds: number) => void
}

export const useTimerStore = create<TimerState>((set) => ({
  isResting: false,
  restTimeLeft: 0,
  workoutId: null,

  startTimer: (seconds, workoutId) => set({
    isResting: true,
    restTimeLeft: seconds,
    workoutId
  }),

  stopTimer: () => set({
    isResting: false,
    restTimeLeft: 0,
    workoutId: null
  }),

  tick: () => set((state) => {
    if (!state.isResting || state.restTimeLeft <= 0) return state
    return { restTimeLeft: state.restTimeLeft - 1 }
  }),

  addTime: (seconds) => set((state) => {
    if (!state.isResting) return state
    return { restTimeLeft: Math.max(0, state.restTimeLeft + seconds) }
  })
}))
