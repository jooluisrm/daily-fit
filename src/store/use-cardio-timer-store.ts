import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CardioTimerState {
  isCardioActive: boolean
  cardioStartTime: number | null
  cardioElapsedSeconds: number
  cardioTargetSeconds: number
  cardioType: string
  
  startCardioTimer: (targetSeconds: number, type: string, existingStartTime?: number) => void
  stopCardioTimer: () => void
  tickCardio: () => void
}

export const useCardioTimerStore = create<CardioTimerState>()(
  persist(
    (set) => ({
      isCardioActive: false,
      cardioStartTime: null,
      cardioElapsedSeconds: 0,
      cardioTargetSeconds: 0,
      cardioType: 'Cardio',

      startCardioTimer: (targetSeconds, type, existingStartTime) => set({
        isCardioActive: true,
        cardioStartTime: existingStartTime || Date.now(),
        cardioTargetSeconds: targetSeconds,
        cardioElapsedSeconds: existingStartTime ? Math.floor((Date.now() - existingStartTime) / 1000) : 0,
        cardioType: type
      }),

      stopCardioTimer: () => set({
        isCardioActive: false,
        cardioStartTime: null,
        cardioElapsedSeconds: 0,
        cardioTargetSeconds: 0,
        cardioType: 'Cardio'
      }),

      tickCardio: () => set((state) => {
        if (!state.isCardioActive || !state.cardioStartTime) return state
        
        // Calcula o tempo real baseado no relógio do sistema,
        // garantindo que não atrase se o celular bloquear a tela (PWA background throttling)
        const now = Date.now()
        const elapsed = Math.floor((now - state.cardioStartTime) / 1000)
        
        if (elapsed === state.cardioElapsedSeconds) {
          return state // Evita re-renders desnecessários
        }
        
        return { cardioElapsedSeconds: elapsed }
      })
    }),
    {
      name: 'daily-fit-cardio-timer',
    }
  )
)
