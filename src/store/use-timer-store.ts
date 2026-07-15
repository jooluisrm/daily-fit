import { create } from 'zustand'

interface TimerState {
  isResting: boolean
  restTimeLeft: number
  targetTime: number | null
  workoutId: string | null
  
  startTimer: (seconds: number, workoutId: string) => void
  stopTimer: () => void
  tick: () => void
  addTime: (seconds: number) => void
}

export const useTimerStore = create<TimerState>((set) => ({
  isResting: false,
  restTimeLeft: 0,
  targetTime: null,
  workoutId: null,

  startTimer: (seconds, workoutId) => set({
    isResting: true,
    restTimeLeft: seconds,
    targetTime: Date.now() + seconds * 1000,
    workoutId
  }),

  stopTimer: () => set({
    isResting: false,
    restTimeLeft: 0,
    targetTime: null,
    workoutId: null
  }),

  tick: () => set((state) => {
    if (!state.isResting || !state.targetTime) return state
    
    // Calcula o tempo real baseado no relógio do sistema,
    // garantindo que não pause se o celular bloquear a tela (PWA background throttling)
    const now = Date.now()
    const remaining = Math.max(0, Math.round((state.targetTime - now) / 1000))
    
    if (remaining === state.restTimeLeft) {
      return state // Evita re-renders desnecessários
    }
    
    return { restTimeLeft: remaining }
  }),

  addTime: (seconds) => set((state) => {
    if (!state.isResting || !state.targetTime) return state
    const newTargetTime = state.targetTime + seconds * 1000
    const now = Date.now()
    const remaining = Math.max(0, Math.round((newTargetTime - now) / 1000))
    return { 
      targetTime: newTargetTime,
      restTimeLeft: remaining
    }
  })
}))
