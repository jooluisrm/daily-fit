"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dumbbell, Save, CheckCircle2, ChevronLeft, ChevronRight, Activity, SkipForward, Loader2, AlertTriangle, Play, FastForward, Minimize2, Trophy, History, Plus, Minus, NotebookIcon, Lock, Unlock } from "lucide-react"
import { useLogExercise } from "@/src/hooks/use-exercise"
import { useLogCardio } from "@/src/hooks/use-cardio"
import { useUpdateWorkoutStatus } from "@/src/hooks/use-workout-log"
import { useTimerStore } from "@/src/store/use-timer-store"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TreinoHistoryDialog } from "./treino-history-dialog"
import { TreinoSummaryDialog } from "./treino-summary-dialog"
import { useSession } from "next-auth/react"
import { requestNotificationPermission } from "@/src/lib/notifications"
import { useWorkoutProgressStore } from "@/src/store/use-workout-progress-store"

interface TreinoFocusViewProps {
  workoutId: string
  exercises: any[]
  onFinishAll: () => void
  onClose: () => void
}

export function TreinoFocusView({ workoutId, exercises, onFinishAll, onClose }: TreinoFocusViewProps) {
  const { data: session } = useSession()
  const user = session?.user as any
  const restTimeGoal = user?.restTimeGoal || 90

  const activeExercises = useMemo(() => exercises.filter((ex) => ex.isActive), [exercises])

  const { setProgress } = useWorkoutProgressStore()
  const todayStr = useMemo(() => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }), [])

  const [hasInitialized, setHasInitialized] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)

  // Initialize from localStorage directly to bypass any Zustand hydration delays
  useEffect(() => {
    if (!hasInitialized) {
      try {
        const raw = localStorage.getItem('daily-fit-workout-progress')
        if (raw) {
          const parsed = JSON.parse(raw)
          const state = parsed.state
          if (state && state.workoutId === workoutId && state.date === todayStr) {
            setCurrentIndex(state.currentIndex || 0)
            setCurrentSet(state.currentSet || 1)
          }
        }
      } catch (e) {
        console.error("Failed to parse workout progress", e)
      }
      setHasInitialized(true)
    }
  }, [workoutId, todayStr, hasInitialized])

  // Sync back to store
  useEffect(() => {
    if (hasInitialized) {
      setProgress(workoutId, todayStr, currentIndex, currentSet)
    }
  }, [currentIndex, currentSet, workoutId, todayStr, setProgress, hasInitialized])



  const [weightInput, setWeightInput] = useState("")
  const [repsInput, setRepsInput] = useState("")

  // Cardio Integration States
  const [phase, setPhase] = useState<'EXERCISES' | 'PENDING_PROMPT' | 'CARDIO_PROMPT' | 'CARDIO_ACTIVE'>('EXERCISES')
  const [cardioType, setCardioType] = useState('Esteira')
  const [cardioIntensity, setCardioIntensity] = useState('moderado')
  const [cardioTime, setCardioTime] = useState('')

  const [isViewingHistory, setIsViewingHistory] = useState(false)
  const [autoAdvanceTimeLeft, setAutoAdvanceTimeLeft] = useState(10)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [isSwipeLocked, setIsSwipeLocked] = useState(false)
  const [shakeLock, setShakeLock] = useState(false)

  const { isResting, restTimeLeft, startTimer, stopTimer, addTime } = useTimerStore()

  const { mutateAsync: logExercise, isPending: isSaving } = useLogExercise(workoutId)
  const { mutateAsync: logCardio, isPending: isSavingCardio } = useLogCardio()
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateWorkoutStatus(workoutId)

  const checkIsSetCompleted = (exerciseIndex: number, setNum: number) => {
    const ex = activeExercises[exerciseIndex]
    if (!ex) return false
    return ex.logs?.some((log: any) => {
      const logDate = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDate === todayStr && log.setNumber === setNum
    }) || false
  }

  const findNextPendingSet = (startIndex: number, startSet: number) => {
    // 1. Search forward from current position
    for (let i = startIndex; i < activeExercises.length; i++) {
      const ex = activeExercises[i]
      const startS = (i === startIndex) ? startSet : 1
      for (let s = startS; s <= ex.sets; s++) {
        if (!checkIsSetCompleted(i, s)) {
          return { index: i, set: s }
        }
      }
    }

    // 2. Wrap around from the beginning
    for (let i = 0; i < startIndex; i++) {
      const ex = activeExercises[i]
      for (let s = 1; s <= ex.sets; s++) {
        if (!checkIsSetCompleted(i, s)) {
          return { index: i, set: s }
        }
      }
    }

    // 3. Check remaining sets in the starting exercise (before startSet)
    if (activeExercises[startIndex]) {
      for (let s = 1; s < startSet; s++) {
        if (!checkIsSetCompleted(startIndex, s)) {
          return { index: startIndex, set: s }
        }
      }
    }

    return null
  }

  const pendingExercisesList = useMemo(() => {
    return activeExercises.map((ex, index) => {
      const pendingSets: number[] = []
      for (let s = 1; s <= ex.sets; s++) {
        if (!checkIsSetCompleted(index, s)) {
          pendingSets.push(s)
        }
      }
      return { ex, index, pendingSets }
    }).filter(item => item.pendingSets.length > 0)
  }, [activeExercises, todayStr]) // todayStr is stable, but we should rely on activeExercises changes (logs)

  const goToPendingSet = () => {
    if (activeExercises.length === 0) return

    // Se já estivermos em uma série pendente e não for modo histórico, não precisa fazer nada.
    if (!isViewingHistory && !checkIsSetCompleted(currentIndex, currentSet)) {
      return
    }

    const next = findNextPendingSet(currentIndex, currentSet)
    if (next) {
      setCurrentIndex(next.index)
      setCurrentSet(next.set)
      setIsViewingHistory(false)
    } else {
      // Se tudo estiver concluído, vai para a última série e ativa o histórico
      setCurrentIndex(activeExercises.length - 1)
      setCurrentSet(activeExercises[activeExercises.length - 1].sets)
      setIsViewingHistory(true)
    }
  }

  // Auto-advance if the currently viewed set becomes completed (e.g., from background cache sync)
  // Mas NÃO fazemos isso se o usuário estiver explicitamente vendo o histórico!
  useEffect(() => {
    if (hasInitialized && activeExercises.length > 0) {
      if (!isViewingHistory && checkIsSetCompleted(currentIndex, currentSet)) {
        goToPendingSet()
      }
    }
  }, [activeExercises, currentIndex, currentSet, isViewingHistory, hasInitialized])

  // Removed duplicate useEffect

  const currentExercise = activeExercises[currentIndex]

  // Derived data for history pill
  const historyLog = useMemo(() => {
    if (!currentExercise) return null
    const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const logs = currentExercise.logs?.filter((l: any) => {
      if (l.setNumber !== currentSet) return false
      const logDateStr = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDateStr !== todayStr
    }) || []

    logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return logs.length > 0 ? logs[0] : null
  }, [currentExercise, currentSet])

  // Derived data for full history modal
  const fullHistory = useMemo(() => {
    if (!currentExercise || !currentExercise.logs) return []

    const logs = currentExercise.logs.filter((l: any) => {
      const logDateStr = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDateStr !== todayStr
    })

    const grouped: Record<string, any[]> = {}
    logs.forEach((l: any) => {
      const dateStr = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      if (!grouped[dateStr]) grouped[dateStr] = []
      grouped[dateStr].push(l)
    })

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/')
      const [dayB, monthB, yearB] = b.split('/')
      return new Date(Number(yearB), Number(monthB) - 1, Number(dayB)).getTime() - new Date(Number(yearA), Number(monthA) - 1, Number(dayA)).getTime()
    })

    return sortedDates.map(date => ({
      date,
      logs: grouped[date].sort((a: any, b: any) => a.setNumber - b.setNumber)
    }))
  }, [currentExercise])

  // Update inputs when current exercise or set changes
  useEffect(() => {
    if (!currentExercise) return

    // 1. Has log for TODAY for current set? (Editing mode)
    const todayLog = currentExercise.logs?.find((l: any) => {
      const logDate = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return l.setNumber === currentSet && logDate === todayStr
    })

    if (todayLog) {
      setWeightInput(String(todayLog.weight))
      setRepsInput(String(todayLog.repsDone))
      return
    }

    // 2. Is currentSet > 1? Pre-fill with previous set from TODAY
    if (currentSet > 1) {
      const prevSetTodayLog = currentExercise.logs?.find((l: any) => {
        const logDate = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        return l.setNumber === currentSet - 1 && logDate === todayStr
      })

      if (prevSetTodayLog) {
        setWeightInput(String(prevSetTodayLog.weight))
        setRepsInput(String(prevSetTodayLog.repsDone))
        return
      }
    }

    // 3. Fallback to latest log for this set (from any day)
    const setLogs = currentExercise.logs?.filter((l: any) => l.setNumber === currentSet) || []
    const sortedSetLogs = [...setLogs].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedSetLogs.length > 0) {
      setWeightInput(String(sortedSetLogs[0].weight))
      setRepsInput(String(sortedSetLogs[0].repsDone))
    } else {
      setWeightInput("")
      setRepsInput("")
    }
  }, [currentIndex, currentSet, currentExercise])

  useEffect(() => {
    if (!isResting || restTimeLeft > 0) {
      setAutoAdvanceTimeLeft(10)
    }
  }, [isResting, restTimeLeft])

  // Auto-advance 10 seconds after rest finishes (if not manually dismissed)
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isResting && restTimeLeft <= 0) {
      if (autoAdvanceTimeLeft > 0) {
        timeout = setTimeout(() => {
          setAutoAdvanceTimeLeft(prev => prev - 1)
        }, 1000)
      } else {
        handleRestFinished()
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isResting, restTimeLeft, autoAdvanceTimeLeft])

  const handleRestFinished = () => {
    stopTimer()
    goToPendingSet()
  }

  const advanceToNextSet = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1)
    } else {
      if (currentIndex < activeExercises.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setCurrentSet(1)
      } else {
        if (pendingExercisesList.length > 0) {
          setPhase('PENDING_PROMPT')
        } else {
          setPhase('CARDIO_PROMPT')
        }
      }
    }
  }

  const handleSkipCardio = async () => {
    try {
      await updateStatus({ status: 'COMPLETED', hasCardio: false })
      onFinishAll()
    } catch (error) {
      console.error("Erro ao finalizar treino.", error)
    }
  }

  const handleFinishCardio = async () => {
    try {
      await logCardio({
        workoutId,
        type: cardioType,
        intensity: cardioIntensity,
        duration: Number(cardioTime)
      })
      await updateStatus({ status: 'COMPLETED', hasCardio: true })
      onFinishAll()
    } catch (error) {
      console.error("Erro ao salvar cardio.", error)
    }
  }

  const handleSave = async () => {
    if (!currentExercise || !weightInput || !repsInput) return

    try {
      await logExercise({
        workoutExerciseId: currentExercise.id,
        setNumber: currentSet,
        weight: Number(weightInput),
        repsDone: Number(repsInput)
      })

      // Se for a última série do último exercício, finaliza direto. Se não, descanso.
      if (currentSet === currentExercise.sets && currentIndex === activeExercises.length - 1) {
        // Verifica se sobraram outros exercícios pendentes (ignorando a série que acabamos de salvar)
        const otherPending = pendingExercisesList.filter(p => {
          if (p.index === currentIndex && p.pendingSets.length === 1 && p.pendingSets[0] === currentSet) return false;
          return true;
        })
        if (otherPending.length > 0) {
          setPhase('PENDING_PROMPT')
        } else {
          setPhase('CARDIO_PROMPT')
        }
      } else {
        // Solicita permissão de notificação (o navegador só pergunta se ainda não tiver)
        requestNotificationPermission()
        startTimer(restTimeGoal, workoutId) // Usa o tempo de descanso configurado pelo usuário
      }
    } catch (error) {
      console.error("Erro ao salvar série.", error)
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return
    const distance = touchStartX - touchEndX
    const minSwipeDistance = 50

    if (isSwipeLocked) {
      if (Math.abs(distance) > minSwipeDistance) {
        setShakeLock(true)
        setTimeout(() => setShakeLock(false), 400)
      }
      return
    }
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      advanceToNextSet()
    }
    if (isRightSwipe) {
      let nextI = currentIndex
      let nextS = currentSet
      if (currentSet > 1) { 
        nextS = currentSet - 1 
      } else if (currentIndex > 0) { 
        nextI = currentIndex - 1
        nextS = activeExercises[currentIndex - 1].sets 
      } else { 
        return 
      }
      if (checkIsSetCompleted(nextI, nextS)) { 
        setCurrentIndex(nextI); setCurrentSet(nextS); setIsViewingHistory(true) 
      } else { 
        setCurrentIndex(nextI); setCurrentSet(nextS); setIsViewingHistory(false) 
      }
    }
  }

  if (!currentExercise) return null

  let hasUncompletedPreviousSets = false
  if (!checkIsSetCompleted(currentIndex, currentSet)) {
    for (let s = 1; s < currentSet; s++) {
      if (!checkIsSetCompleted(currentIndex, s)) {
        hasUncompletedPreviousSets = true
        break
      }
    }
  }

  // Calculate progress
  let totalSets = 0
  let completedSets = 0

  activeExercises.forEach(ex => {
    totalSets += ex.sets
    for (let s = 1; s <= ex.sets; s++) {
      const isDone = ex.logs?.some((log: any) => {
        const logDate = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        return logDate === todayStr && log.setNumber === s
      })
      if (isDone) completedSets++
    }
  })

  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (phase === 'PENDING_PROMPT') {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
          <div className="h-full bg-amber-500 w-full" />
        </div>
        <div className="flex-1 flex flex-col items-center py-12 px-6 overflow-y-auto relative no-scrollbar">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50 z-0"></div>

          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 relative z-10" />
          <h2 className="text-3xl font-black text-white mb-2 relative z-10 text-center tracking-tight">Você pulou exercícios! 👀</h2>
          <p className="text-zinc-400 mb-8 max-w-md relative z-10 text-center text-lg">
            Tem certeza que deseja finalizar a musculação? Você deixou as seguintes séries para trás:
          </p>

          <div className="w-full max-w-md space-y-3 relative z-10 mb-8">
            {pendingExercisesList.map(item => {
              const { ex, index: exIndex } = item
              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    setCurrentIndex(exIndex)
                    setCurrentSet(item.pendingSets[0])
                    setPhase('EXERCISES')
                    setIsViewingHistory(false)
                  }}
                  className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-lg group"
                >
                  {ex.exercise.imageUrl ? (
                    <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-16 h-16 rounded-xl object-cover bg-zinc-800" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Dumbbell className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-base truncate pr-4 group-hover:text-amber-400 transition-colors">{ex.exercise.name}</h4>
                    <div className="flex items-center gap-1.5 mt-2">
                      {Array.from({ length: ex.sets }).map((_, i) => {
                        const s = i + 1
                        const isSetCompleted = !item.pendingSets.includes(s)
                        return (
                          <div
                            key={s}
                            className={cn(
                              "w-2.5 h-2.5 rounded-full",
                              isSetCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-700"
                            )}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                </div>
              )
            })}
          </div>

          <div className="w-full max-w-md relative z-10 flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => setPhase('CARDIO_PROMPT')}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white shadow-md py-6 text-base font-bold rounded-xl"
            >
              Ignorar Tudo e Ir pro Cardio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'CARDIO_PROMPT') {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
          <div className="h-full bg-primary w-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center relative overflow-y-auto no-scrollbar">
          {/* Fundo com gradiente suave usando a cor primária */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-zinc-950/50 to-zinc-950 opacity-80 z-0"></div>

          <div className="relative z-10 w-full max-w-md flex flex-col items-center">
            {/* Ícone com glow */}
            <div className="w-24 h-24 mb-8 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-[0_0_40px_rgba(var(--primary),0.15)] flex items-center justify-center backdrop-blur-xl">
              <Activity className="w-12 h-12 text-primary" />
            </div>

            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Musculação <span className="text-primary">Concluída!</span> 💪</h2>
            <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
              Você completou sua ficha de musculação. Deseja adicionar uma sessão de cardio ou finalizar o treino por hoje?
            </p>

            <div className="flex flex-col gap-4 w-full">
              <Button
                size="lg"
                onClick={() => setPhase('CARDIO_ACTIVE')}
                disabled={isUpdatingStatus}
                className="w-full h-auto py-5 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02]"
              >
                <span className="text-xl font-black">Adicionar Cardio</span>
                <span className="text-sm font-medium text-white/70">Esteira, Bike, Escada...</span>
              </Button>

              <Button
                size="lg"
                onClick={handleSkipCardio}
                disabled={isUpdatingStatus}
                variant="outline"
                className="w-full h-auto py-5 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
              >
                <span className="text-lg font-bold">Encerrar Treino (Sem Cardio)</span>
                <span className="text-sm font-medium text-zinc-500">Salvar e voltar ao menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'CARDIO_ACTIVE') {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
          <div className="h-full bg-primary w-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto no-scrollbar">
          {/* Fundo com gradiente suave usando a cor primária */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-zinc-950/50 to-zinc-950 opacity-80 z-0"></div>

          <div className="relative z-10 w-full max-w-md flex flex-col items-center">
            {/* Ícone com glow */}
            <div className="w-20 h-20 mb-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-[0_0_30px_rgba(var(--primary),0.15)] flex items-center justify-center backdrop-blur-xl">
              <Activity className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Sessão de <span className="text-primary">Cardio</span></h2>
            <p className="text-zinc-400 mb-8 max-w-md text-center text-lg leading-relaxed">
              Bora suar! Registre sua atividade e finalize com chave de ouro.
            </p>

            <div className="w-full space-y-8 bg-zinc-900/60 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-xl">
              <div className="space-y-4">
                <Label className="text-zinc-300 uppercase tracking-widest text-xs font-bold">Tipo de Aparelho</Label>
                <div className="flex gap-2">
                  {['Esteira', 'Bike', 'Escada'].map((type) => (
                    <Button
                      key={type}
                      variant="ghost"
                      onClick={() => setCardioType(type)}
                      className={`flex-1 h-14 text-sm font-semibold rounded-xl transition-all border ${cardioType === type ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-300 uppercase tracking-widest text-xs font-bold">Intensidade</Label>
                <div className="flex gap-2">
                  {['leve', 'moderado', 'intenso'].map((int) => (
                    <Button
                      key={int}
                      variant="ghost"
                      onClick={() => setCardioIntensity(int)}
                      className={`flex-1 h-14 text-sm font-semibold rounded-xl transition-all border ${cardioIntensity === int ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                    >
                      {int.charAt(0).toUpperCase() + int.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="cardio-time" className="text-zinc-300 uppercase tracking-widest text-xs font-bold">Tempo (minutos)</Label>
                <Input
                  id="cardio-time"
                  type="number"
                  placeholder="0"
                  value={cardioTime}
                  onChange={(e) => setCardioTime(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-16 text-2xl text-center font-black rounded-2xl shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  onClick={handleFinishCardio}
                  disabled={!cardioTime || isSavingCardio || isUpdatingStatus}
                  className="w-full h-16 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all hover:scale-[1.02]"
                >
                  {(isSavingCardio || isUpdatingStatus) ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Trophy className="w-6 h-6 mr-3" />}
                  Salvar e Finalizar Treino
                </Button>

                <Button
                  onClick={handleSkipCardio}
                  disabled={isSavingCardio || isUpdatingStatus}
                  variant="ghost"
                  className="w-full text-zinc-500 hover:text-zinc-300 h-12 rounded-xl border border-transparent hover:border-zinc-800"
                >
                  Cancelar e Encerrar Treino
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isHistoryMode = checkIsSetCompleted(currentIndex, currentSet)

  let hasUnsavedChanges = false
  if (isHistoryMode && currentExercise) {
    const currentLog = currentExercise.logs?.find((log: any) => {
      const logDate = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDate === todayStr && log.setNumber === currentSet
    })
    if (currentLog) {
      if (String(currentLog.weight) !== String(weightInput) || String(currentLog.repsDone) !== String(repsInput)) {
        hasUnsavedChanges = true
      }
    }
  }

  return (
    <div className={cn(
      "fixed inset-0 z-[60] flex flex-col bg-zinc-950 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300",
      isHistoryMode ? "ring-inset ring-2 ring-amber-500/20" : ""
    )}>
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
        <div
          className={cn("h-full transition-all duration-500 ease-out", isHistoryMode ? "bg-amber-600" : "bg-primary")}
          style={{ width: `${progressPercent}%` }}
        />
      </div>


      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col relative z-10 overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {currentExercise.exercise.imageUrl ? (
            <>
              <img
                src={currentExercise.exercise.imageUrl}
                alt={currentExercise.exercise.name}
                className="w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center opacity-10">
              <Dumbbell className="w-64 h-64 text-zinc-800" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 z-10 flex flex-col justify-between px-6 sm:px-12 py-6">
          {/* Top Bar (Minimize, Timeline, Progress) */}
          <div className="relative z-50 flex justify-between items-center w-full px-4 mb-2">
            
            {/* Minimize Button */}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full h-12 w-12 shrink-0">
              <Minimize2 className="w-5 h-5" />
            </Button>

            {/* Exercises Timeline */}
            <div className="flex gap-2 items-center bg-zinc-900/60 backdrop-blur-md p-1.5 rounded-full border border-zinc-800/80 overflow-x-auto max-w-full no-scrollbar mx-2">
                {activeExercises.map((ex, idx) => {
                  const isPast = idx < currentIndex
                  const isCurrent = idx === currentIndex

                  return (
                    <div
                      key={ex.id}
                      onClick={() => {
                        let targetSet = 1;
                        let allCompleted = true;
                        for (let s = 1; s <= ex.sets; s++) {
                          if (!checkIsSetCompleted(idx, s)) {
                            targetSet = s;
                            allCompleted = false;
                            break;
                          }
                        }
                        if (allCompleted) {
                          targetSet = ex.sets;
                        }
                        setCurrentIndex(idx);
                        setCurrentSet(targetSet);
                        setIsViewingHistory(allCompleted);
                      }}
                      className={cn(
                        "relative rounded-full flex-shrink-0 transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer",
                        isCurrent ? "w-12 h-12 ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 opacity-100 shadow-[0_0_15px_rgba(var(--primary),0.4)] z-10" : "w-10 h-10 opacity-50 grayscale hover:opacity-80 bg-zinc-800"
                      )}
                    >
                      {ex.exercise.imageUrl ? (
                        <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Dumbbell className={isCurrent ? (isHistoryMode ? "w-6 h-6 text-amber-500" : "w-6 h-6 text-primary") : "w-5 h-5 text-zinc-500"} />
                        </div>
                      )}
                      {isPast && (
                        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            
            {/* Circular Progress Button */}
            <button 
              onClick={() => setIsSummaryModalOpen(true)}
              className="relative w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 transition-all hover:bg-zinc-800 active:scale-95 shrink-0"
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-zinc-800/50" />
                <circle 
                  cx="24" cy="24" r="20" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  fill="none" 
                  className={cn(
                    "transition-all duration-1000 ease-out", 
                    progressPercent < 34 ? "text-red-500" : progressPercent < 67 ? "text-amber-500" : "text-emerald-500"
                  )} 
                  strokeDasharray="126" 
                  strokeDashoffset={126 - (126 * progressPercent) / 100} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="relative z-10 flex items-center justify-center">
                {progressPercent >= 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span className="text-[11px] font-bold text-white">{Math.round(progressPercent)}%</span>
                )}
              </div>
            </button>
          </div>

          {/* Middle Content */}
          <div className="flex flex-col justify-center flex-1 my-2">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 drop-shadow-xl tracking-tight">
              {currentExercise.exercise.name}
            </h2>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
              {Array.from({ length: currentExercise.sets }).map((_, idx) => {
                const setNum = idx + 1
                const isCompleted = checkIsSetCompleted(currentIndex, setNum)
                const isCurrent = setNum === currentSet

                return (
                  <div
                    key={setNum}
                    onClick={() => {
                      setCurrentSet(setNum)
                      setIsViewingHistory(isCompleted)
                    }}
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer",
                      isCompleted && !isCurrent ? (isHistoryMode ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]") : (!isCurrent ? "bg-zinc-900/80 text-zinc-500 backdrop-blur-md" : ""),
                      isCurrent ? (isHistoryMode ? "bg-amber-600 text-white ring-4 ring-amber-500/30 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.8)]" : "border-2 border-primary text-primary bg-primary/10 scale-110") : "border border-zinc-800"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : setNum}
                  </div>
                )
              })}
            </div>
          </div>



          {!isResting ? (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
              <div className="text-sm text-zinc-500 bg-zinc-900/50 px-4 py-2 mb-4 rounded-lg border border-zinc-800/50">
                Meta: <strong className="text-zinc-300">{currentExercise.reps} reps</strong>
              </div>
              <div className="flex gap-4 sm:gap-6 w-full max-w-sm">
                <div className="flex-1 space-y-2">
                  <Label className="text-zinc-400 text-center block text-sm uppercase tracking-wider">Carga (kg)</Label>
                  <div className={cn("flex items-center bg-zinc-900/40 rounded-2xl border border-zinc-800 p-1 transition-colors", isHistoryMode ? "focus-within:border-amber-500/50" : "focus-within:border-primary/50", hasUncompletedPreviousSets && "opacity-50 grayscale pointer-events-none")}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setWeightInput(prev => String(Math.max(0, Number(prev || 0) - 1)))}
                      className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
                      disabled={hasUncompletedPreviousSets}
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <Input
                      type="number"
                      value={weightInput}
                      onChange={e => setWeightInput(e.target.value)}
                      disabled={hasUncompletedPreviousSets}
                      className="h-14 flex-1 text-center text-2xl font-bold bg-transparent border-0 text-white shadow-none focus-visible:ring-0 px-0 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-100"
                      placeholder="0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setWeightInput(prev => String(Number(prev || 0) + 1))}
                      className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
                      disabled={hasUncompletedPreviousSets}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-zinc-400 text-center block text-sm uppercase tracking-wider">Repetições</Label>
                  <div className={cn("flex items-center bg-zinc-900/40 rounded-2xl border border-zinc-800 p-1 transition-colors", isHistoryMode ? "focus-within:border-amber-500/50" : "focus-within:border-primary/50", hasUncompletedPreviousSets && "opacity-50 grayscale pointer-events-none")}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRepsInput(prev => String(Math.max(0, Number(prev || 0) - 1)))}
                      className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
                      disabled={hasUncompletedPreviousSets}
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <Input
                      type="number"
                      value={repsInput}
                      onChange={e => setRepsInput(e.target.value)}
                      disabled={hasUncompletedPreviousSets}
                      className="h-14 flex-1 text-center text-2xl font-bold bg-transparent border-0 text-white shadow-none focus-visible:ring-0 px-0 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-100"
                      placeholder="0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRepsInput(prev => String(Number(prev || 0) + 1))}
                      className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
                      disabled={hasUncompletedPreviousSets}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-800/50 transition-colors flex items-center gap-2 group"
                >
                  <NotebookIcon className="w-4 h-4" /> Histórico
                </button>

                {historyLog && (
                  <button
                    onClick={() => {
                      setWeightInput(String(historyLog.weight))
                      setRepsInput(String(historyLog.repsDone))
                    }}
                    className="text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-800/50 transition-colors flex items-center gap-2 group"
                  >
                    <History className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    Último: <strong className="text-zinc-300">{historyLog.weight}kg x {historyLog.repsDone}</strong>
                  </button>
                )}

              </div>

              <div className="w-full max-w-sm mt-10 space-y-3">
              {hasUncompletedPreviousSets ? (
                <Button
                  onClick={() => {
                    for (let s = 1; s < currentSet; s++) {
                      if (!checkIsSetCompleted(currentIndex, s)) {
                        setCurrentSet(s)
                        break
                      }
                    }
                  }}
                  className="w-full h-16 text-[14px] uppercase tracking-[0.1em] font-black rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-[0_10px_30px_-10px_rgba(217,119,6,0.6)]"
                >
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  Série anterior pendente
                </Button>
              ) : isHistoryMode ? (
                hasUnsavedChanges ? (
                  <Button
                    onClick={handleSave}
                    disabled={!weightInput || !repsInput || isSaving}
                    className="w-full h-16 text-[15px] uppercase tracking-[0.2em] font-black rounded-2xl transition-all duration-300 relative overflow-hidden group bg-zinc-900 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
                      Atualizar Série
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={goToPendingSet}
                    className="w-full h-16 text-[15px] uppercase tracking-[0.1em] font-black rounded-2xl bg-zinc-900 border-2 border-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 shadow-none transition-all duration-300"
                  >
                    <span className="flex items-center justify-center">
                      <SkipForward className="w-5 h-5 mr-3" />
                      Voltar ao fluxo
                    </span>
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={!weightInput || !repsInput || isSaving}
                  className="w-full h-16 text-[15px] uppercase tracking-[0.2em] font-black rounded-2xl transition-all duration-300 relative overflow-hidden group bg-primary text-primary-foreground hover:brightness-110 shadow-[0_10px_40px_-10px_rgba(var(--primary),0.8)] hover:shadow-[0_15px_50px_-10px_rgba(var(--primary),0.9)] hover:-translate-y-1 border border-primary/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-12 group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10 flex items-center justify-center">
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
                    Salvar Série
                  </span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => addTime(-15)} 
                className={cn(
                  "w-14 h-14 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-lg shrink-0 transition-opacity duration-300",
                  restTimeLeft === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                <span className="text-sm font-bold">-15s</span>
              </Button>

              <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-900/50 backdrop-blur-md shrink-0">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-zinc-800" />
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className={cn("transition-all duration-1000 ease-linear", restTimeLeft === 0 ? "text-emerald-500" : (isHistoryMode ? "text-amber-500" : "text-primary"))} strokeDasharray="553" strokeDashoffset={restTimeLeft === 0 ? 0 : 553 - (553 * Math.min(restTimeLeft, restTimeGoal)) / restTimeGoal} strokeLinecap="round" transform="rotate(-90 96 96)" />
                </svg>
                {restTimeLeft === 0 ? (
                  <CheckCircle2 className="w-20 h-20 text-emerald-500 animate-in zoom-in duration-500" />
                ) : (
                  <>
                    <span className="text-5xl font-mono font-bold text-white mb-2">{formatTime(restTimeLeft)}</span>
                    <span className="text-zinc-400 text-sm uppercase tracking-widest font-semibold">Descanso</span>
                  </>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => addTime(15)} 
                className={cn(
                  "w-14 h-14 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-lg shrink-0 transition-opacity duration-300",
                  restTimeLeft === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                <span className="text-sm font-bold">+15s</span>
              </Button>
            </div>
            <div className={cn(
              "flex flex-col gap-2 mt-8 w-full max-w-xs items-center transition-all duration-300",
              restTimeLeft === 0 && "opacity-0 pointer-events-none h-0 mt-0 overflow-hidden"
            )}>
              {historyLog ? (
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 w-full flex flex-col items-center justify-center gap-1 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <History className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Treino Passado</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {historyLog.weight}<span className="text-lg text-zinc-500 font-bold mx-1">kg</span> 
                    <span className="text-zinc-600 mx-2">×</span> 
                    {historyLog.repsDone}<span className="text-lg text-zinc-500 font-bold mx-1">reps</span>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 w-full flex flex-col items-center justify-center gap-2 shadow-sm backdrop-blur-md opacity-70">
                  <History className="w-5 h-5 text-zinc-600" />
                  <span className="text-sm font-medium text-zinc-500 text-center">Nenhum histórico para esta série</span>
                </div>
              )}
            </div>
            {restTimeLeft === 0 ? (
              <Button 
                onClick={handleRestFinished} 
                className="w-full h-16 mt-8 relative overflow-hidden group bg-emerald-600 text-white hover:bg-emerald-500 text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 border-2 border-transparent hover:border-emerald-400"
              >
                <div 
                  className="absolute bottom-0 left-0 h-1.5 bg-white/40 transition-all duration-1000 ease-linear"
                  style={{ width: `${(autoAdvanceTimeLeft / 10) * 100}%` }}
                />
                <span className="relative z-10 flex items-center justify-center w-full">
                  <CheckCircle2 className="w-6 h-6 mr-3" />
                  Continuar Treino
                  <span className="ml-3 px-2.5 py-1 bg-black/20 rounded-lg text-sm font-mono tracking-widest">
                    {autoAdvanceTimeLeft}s
                  </span>
                </span>
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleRestFinished} className="mt-6 text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all duration-300">
                <SkipForward className="w-4 h-4 mr-2" />Pular Descanso
              </Button>
            )}
          </div>
        )}
        </div>

        {/* Swipe Indicator & Lock (Integrated into main content) */}
        <div className="mt-auto flex justify-center items-center gap-8 pb-8">
          <div className="flex flex-col items-center justify-center opacity-50">
            <ChevronLeft className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
          
          <style>{`
            @keyframes shakeLock {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-4px) rotate(-4deg); }
              40% { transform: translateX(4px) rotate(4deg); }
              60% { transform: translateX(-4px) rotate(-4deg); }
              80% { transform: translateX(4px) rotate(4deg); }
            }
          `}</style>
          <Button 
            variant="secondary" 
            onClick={() => setIsSwipeLocked(!isSwipeLocked)}
            className={cn(
              "rounded-full w-14 h-14 border-2 flex items-center justify-center transition-all shadow-lg",
              isSwipeLocked 
                ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20" 
                : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20",
              shakeLock ? "animate-[shakeLock_0.4s_ease-in-out]" : ""
            )}
          >
            {isSwipeLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
          </Button>

          <div className="flex flex-col items-center justify-center opacity-50">
            <ChevronRight className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
        </div>

      </div>
    </div>

    <TreinoHistoryDialog
        isOpen={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        exerciseName={currentExercise?.exercise?.name}
        fullHistory={fullHistory}
      />

      <TreinoSummaryDialog
        isOpen={isSummaryModalOpen}
        onOpenChange={setIsSummaryModalOpen}
        progressPercent={progressPercent}
        activeExercises={activeExercises}
        currentIndex={currentIndex}
        currentSet={currentSet}
        isViewingHistory={isViewingHistory}
        checkIsSetCompleted={checkIsSetCompleted}
        onNavigate={(idx, targetSet, isFullyDone) => {
          setCurrentIndex(idx)
          setCurrentSet(targetSet)
          if (isFullyDone) setIsViewingHistory(true)
          else setIsViewingHistory(false)
          setIsSummaryModalOpen(false)
        }}
      />
    </div >
  )
}
