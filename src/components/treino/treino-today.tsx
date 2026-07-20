"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, CalendarDays, Save, Activity, Loader2, Dumbbell, Trash2, Undo2, ArrowLeftRight, PlayCircle, Trophy, Timer, ArrowUp, ArrowDown, Minus, Star, Plus, Share2 } from "lucide-react"
import { ExerciseCard } from "@/src/components/treino/exercise-card"
import { useWorkouts } from "@/src/hooks/use-workout"
import { useWorkoutExercises } from "@/src/hooks/use-exercise"
import { useTodayCardio, useLogCardio } from "@/src/hooks/use-cardio"
import { useCardioTimerStore } from "@/src/store/use-cardio-timer-store"
import { useTimerStore } from "@/src/store/use-timer-store"
import { useTodayWorkoutStatus, useStartWorkout, useUpdateWorkoutStatus, useTodayAllWorkoutLogs } from "@/src/hooks/use-workout-log"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RestTimer } from "./rest-timer"
import { TreinoFocusView } from "./treino-focus-view"
import { List, Focus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const DAYS_MAP = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

export function TreinoToday() {
  const [cardioIntensity, setCardioIntensity] = useState<string>("moderado")
  const [cardioTime, setCardioTime] = useState<string>("")
  const [swappedWorkoutId, setSwappedWorkoutId] = useState<string | null>(null)
  const [selectedCompletedTabId, setSelectedCompletedTabId] = useState<string | null>(null)

  // Timer State
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [restTimerKey, setRestTimerKey] = useState(0)

  // Local state for transitions
  const [showCardioPrompt, setShowCardioPrompt] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'focus'>('focus')

  const { data: workouts, isLoading: isLoadingWorkouts } = useWorkouts()

  const todayIndex = new Date().getDay()
  const defaultTodayWorkout = workouts?.find(w => w.isActive && w.daysOfWeek.includes(todayIndex))
  const { data: allTodayLogs, isLoading: isLoadingAllLogs } = useTodayAllWorkoutLogs()

  const inProgressLog = allTodayLogs?.find(l => l.status === 'IN_PROGRESS' || l.status === 'CARDIO')
  const completedLogs = allTodayLogs?.filter(l => l.status === 'COMPLETED') || []

  // Se há treino em progresso, forçar ele.
  // Senão, respeitar o swap.
  // Senão, respeitar o treino agendado pro dia.
  // Senão (em dias de descanso), se tiver concluído algum treino hoje, mostrar ele.
  const effectiveWorkoutId = inProgressLog
    ? inProgressLog.workoutId
    : (swappedWorkoutId || defaultTodayWorkout?.id || (completedLogs && completedLogs.length > 0 ? completedLogs[completedLogs.length - 1].workoutId : undefined))

  const todayWorkout = workouts?.find(w => w.id === effectiveWorkoutId)

  const { data: exercises, isLoading: isLoadingExercises } = useWorkoutExercises(todayWorkout?.id || "")

  const { data: todayCardio } = useTodayCardio()
  const { mutateAsync: logCardio, isPending: isSavingCardio } = useLogCardio()

  const { data: workoutStatus, isLoading: isLoadingStatus } = useTodayWorkoutStatus(todayWorkout?.id)
  const { mutateAsync: startWorkout, isPending: isStarting } = useStartWorkout(todayWorkout?.id)
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateWorkoutStatus(todayWorkout?.id)

  const currentState = workoutStatus?.status

  const { startCardioTimer, isCardioActive } = useCardioTimerStore()

  useEffect(() => {
    if (todayCardio) {
      setCardioIntensity(todayCardio.intensity || 'moderado')
      setCardioTime(String(todayCardio.duration))

      if (todayCardio.status === 'IN_PROGRESS' && todayCardio.startTime && !isCardioActive) {
        const existingStartTime = new Date(todayCardio.startTime).getTime()
        startCardioTimer(todayCardio.targetDuration ? todayCardio.targetDuration * 60 : 0, todayCardio.type || 'Esteira', existingStartTime)
      }
    }
  }, [todayCardio, isCardioActive, startCardioTimer])

  useEffect(() => {
    const swapData = localStorage.getItem('daily-fit-swap')
    if (swapData) {
      try {
        const { date, workoutId } = JSON.parse(swapData)
        // Usa a data local no formato PT-BR para ignorar o UTC
        const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        if (date === todayStr) {
          setSwappedWorkoutId(workoutId)
        }
      } catch (e) { }
    }
    const savedViewMode = localStorage.getItem('daily-fit-view-mode')
    if (savedViewMode === 'list' || savedViewMode === 'focus') {
      setViewMode(savedViewMode)
    }

    const handleViewModeChange = () => {
      const mode = localStorage.getItem('daily-fit-view-mode')
      if (mode === 'list' || mode === 'focus') {
        setViewMode(mode)
      }
    }
    window.addEventListener('view-mode-changed', handleViewModeChange)
    return () => window.removeEventListener('view-mode-changed', handleViewModeChange)
  }, [])

  useEffect(() => {
    if (currentState === 'COMPLETED') {
      useCardioTimerStore.getState().stopCardioTimer()
      useTimerStore.getState().stopTimer()
    }
  }, [currentState])

  const handleSwap = (workoutId: string) => {
    setSwappedWorkoutId(workoutId)
    const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    localStorage.setItem('daily-fit-swap', JSON.stringify({
      date: todayStr,
      workoutId
    }))
  }

  const handleRemoveSwap = () => {
    setSwappedWorkoutId(null)
    localStorage.removeItem('daily-fit-swap')
  }

  const handleStartWorkout = async () => {
    try {
      await startWorkout()
    } catch (error: any) {
      console.error("Erro ao iniciar treino.", error)
    }
  }

  const handleSetComplete = () => {
    setRestTimerKey(prev => prev + 1)
    setShowRestTimer(true)
  }

  const handleFinishMuscleTraining = async () => {
    if (todayCardio) {
      try {
        await updateStatus({ status: 'COMPLETED', hasCardio: true })
      } catch (error) {
        console.error("Erro ao atualizar status.", error)
      }
    } else {
      setShowCardioPrompt(true)
    }
  }

  const handleCardioDecision = async (wantsCardio: boolean) => {
    setShowCardioPrompt(false)
    try {
      if (wantsCardio) {
        await updateStatus({ status: 'CARDIO', hasCardio: true })
      } else {
        await updateStatus({ status: 'COMPLETED', hasCardio: false })
      }
    } catch (error) {
      console.error("Erro ao atualizar status.", error)
    }
  }

  const handleFinishCardio = async () => {
    if (!cardioTime) {
      return
    }
    try {
      await logCardio({
        intensity: cardioIntensity,
        duration: Number(cardioTime),
        workoutId: todayWorkout?.id,
        workoutLogId: workoutStatus?.id,
        type: "Esteira",
      })
      await updateStatus({ status: 'COMPLETED', hasCardio: true })
    } catch (error) {
      console.error("Erro ao finalizar cardio.", error)
    }
  }

  const handleUndoFinish = async () => {
    try {
      await updateStatus({ status: 'IN_PROGRESS', hasCardio: !!todayCardio })
    } catch (error) {
      console.error("Erro ao desfazer finalização.", error)
    }
  }

  const toggleViewMode = (mode: 'list' | 'focus') => {
    setViewMode(mode)
    localStorage.setItem('daily-fit-view-mode', mode)
  }

  if (isLoadingWorkouts || isLoadingStatus) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!todayWorkout) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center relative">
        {workouts && workouts.length > 0 && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="bg-transparent border-zinc-800 text-zinc-400 hover:text-white">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Fazer um treino extra
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200">
                {workouts.filter(w => w.isActive).map(w => (
                  <DropdownMenuItem key={w.id} onClick={() => handleSwap(w.id)} className="cursor-pointer hover:bg-zinc-900">
                    <Dumbbell className="w-4 h-4 mr-2" /> {w.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-4">
          <CalendarDays className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Descanso Hoje!</h3>
        <p className="text-zinc-400 max-w-sm mb-6">
          Você não tem nenhuma rotina de exercícios agendada para {DAYS_MAP[todayIndex].toLowerCase()}. Aproveite para recuperar o corpo!
        </p>
      </div>
    )
  }

  // Header Render (Shared)
  const renderHeader = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary font-medium">
          <CalendarDays className="w-5 h-5" />
          <span>{DAYS_MAP[todayIndex]}</span>
        </div>
        {workouts && workouts.length > 0 && currentState !== 'COMPLETED' && currentState !== 'IN_PROGRESS' && currentState !== 'CARDIO' && (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white" title="Trocar treino de hoje">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Trocar Treino
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-zinc-800 text-zinc-200">
              <div className="px-2 py-1.5 text-sm font-semibold text-zinc-400">Escolha o treino p/ Hoje</div>
              <div className="h-px bg-zinc-800 my-1" />
              {swappedWorkoutId && defaultTodayWorkout && (
                <DropdownMenuItem onClick={handleRemoveSwap} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 text-primary">
                  <Undo2 className="w-4 h-4 mr-2" /> Voltar ao Original ({defaultTodayWorkout.name})
                </DropdownMenuItem>
              )}
              {workouts.filter(w => w.id !== todayWorkout?.id && w.isActive).map(w => (
                <DropdownMenuItem key={w.id} onClick={() => handleSwap(w.id)} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900">
                  <Dumbbell className="w-4 h-4 mr-2" /> {w.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {currentState === 'COMPLETED' ? "🎉 Treino Finalizado!" : todayWorkout.name}
          </h1>
          {currentState === 'COMPLETED' && (
            <p className="text-emerald-400 font-medium">
              {exercises?.length || 0} exercícios | Cardio: {workoutStatus?.hasCardio ? (todayCardio ? `${todayCardio.duration} min` : "Sim") : "Não feito"}
            </p>
          )}
        </div>
        {currentState === 'COMPLETED' && (
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 md:mt-0">
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button
                  variant="outline"
                  disabled={isUpdatingStatus}
                  className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white w-full sm:w-auto"
                >
                  {isUpdatingStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Undo2 className="w-4 h-4 mr-2" />}
                  Desfazer Finalização
                </Button>
              } />
              <AlertDialogContent className="bg-zinc-950 border border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Desfazer Finalização?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Isso irá reabrir este treino e você poderá continuar adicionando séries ou modificando exercícios. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-zinc-800 text-white hover:bg-zinc-900 hover:text-white">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUndoFinish} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Sim, desfazer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:text-primary w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Iniciar Outro Treino
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-zinc-800 text-zinc-200">
                <div className="px-2 py-1.5 text-sm font-semibold text-zinc-400">Escolha um treino</div>
                <div className="h-px bg-zinc-800 my-1" />
                {workouts?.filter(w => w.isActive && !completedLogs?.find((l: any) => l.workoutId === w.id)).map(w => (
                  <DropdownMenuItem key={w.id} onClick={() => handleSwap(w.id)} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900">
                    <Dumbbell className="w-4 h-4 mr-2" /> {w.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )

  // VIEW: NOT STARTED
  if (!currentState) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {renderHeader()}
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800 rounded-2xl bg-zinc-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50"></div>
          <Dumbbell className="w-16 h-16 text-primary mb-6 relative z-10 animate-bounce" />
          <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Pronto para treinar?</h2>
          <p className="text-zinc-400 mb-8 max-w-md relative z-10 text-lg">Inicie sua sessão para registrar suas cargas e gerenciar o tempo de descanso.</p>
          <Button
            size="lg"
            onClick={handleStartWorkout}
            disabled={isStarting}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xl px-12 py-8 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:scale-105 transition-transform relative z-10"
          >
            {isStarting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <PlayCircle className="w-8 h-8 mr-3" />}
            Iniciar Sessão
          </Button>
        </div>
      </div>
    )
  }

  // VIEW: CARDIO PROMPT
  if (showCardioPrompt) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {renderHeader()}
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800 rounded-2xl bg-zinc-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-50"></div>
          <Activity className="w-16 h-16 text-emerald-500 mb-6 relative z-10" />
          <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Musculação Concluída! 💪</h2>
          <p className="text-zinc-400 mb-8 max-w-md relative z-10 text-lg">Deseja fazer cardio agora para finalizar o dia?</p>

          <div className="flex gap-4 relative z-10 w-full max-w-md">
            <Button
              size="lg"
              onClick={() => handleCardioDecision(false)}
              disabled={isUpdatingStatus}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white py-6"
            >
              Pular Cardio
            </Button>
            <Button
              size="lg"
              onClick={() => handleCardioDecision(true)}
              disabled={isUpdatingStatus}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] py-6"
            >
              Fazer Cardio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // VIEW: CARDIO ACTIVE
  if (currentState === 'CARDIO') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {renderHeader()}
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-emerald-500/30 rounded-2xl bg-zinc-900/50 relative overflow-hidden">
          <Activity className="w-12 h-12 text-emerald-500 mb-4 relative z-10" />
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Sessão de Cardio</h2>
          <p className="text-zinc-400 mb-8 max-w-md relative z-10 text-center">Bora suar! Registre sua atividade e finalize o treino.</p>

          <div className="w-full max-w-md space-y-6 bg-zinc-950 p-6 rounded-xl border border-zinc-800 relative z-10">
            <div className="space-y-3">
              <Label className="text-zinc-300">Intensidade</Label>
              <div className="flex gap-2">
                {['leve', 'moderado', 'intenso'].map((int) => (
                  <Button
                    key={int}
                    variant="ghost"
                    onClick={() => setCardioIntensity(int)}
                    className={`flex-1 h-11 text-sm font-medium transition-all border ${cardioIntensity === int ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                  >
                    {int.charAt(0).toUpperCase() + int.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="cardio-time" className="text-zinc-300">Tempo realizado (minutos)</Label>
              <Input
                id="cardio-time"
                type="number"
                placeholder="Ex: 20"
                value={cardioTime}
                onChange={(e) => setCardioTime(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500 h-12"
              />
            </div>

            <Button
              onClick={handleFinishCardio}
              disabled={!cardioTime || isSavingCardio || isUpdatingStatus}
              className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {(isSavingCardio || isUpdatingStatus) ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Trophy className="w-5 h-5 mr-2" />}
              Salvar e Finalizar Treino
            </Button>

            <Button
              onClick={() => handleCardioDecision(false)}
              disabled={isSavingCardio || isUpdatingStatus}
              variant="ghost"
              className="w-full text-zinc-500 hover:text-zinc-300"
            >
              Pular Cardio (Finalizar agora)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // PROCESS COMPLETED EXERCISES
  const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const processedExercises = exercises?.filter(ex => ex.isActive).map(ex => {
    const allLogs = ex.logs || []
    const todayLogs = allLogs.filter((l: any) => {
      return new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) === todayStr
    })

    const pastLogs = allLogs.filter((l: any) => {
      return new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) !== todayStr
    })

    // Find the most recent date in pastLogs
    let lastDateStr = ''
    if (pastLogs.length > 0) {
      const sortedPastDates = [...new Set(pastLogs.map((l: any) => new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })))].sort((a: any, b: any) => {
        const [dayA, monthA, yearA] = a.split('/')
        const [dayB, monthB, yearB] = b.split('/')
        return new Date(Number(yearB), Number(monthB) - 1, Number(dayB)).getTime() - new Date(Number(yearA), Number(monthA) - 1, Number(dayA)).getTime()
      })
      lastDateStr = sortedPastDates[0] as string
    }

    const previousLogs = pastLogs.filter((l: any) => {
      return new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) === lastDateStr
    })

    // Calculate metrics
    const todayVolume = todayLogs.reduce((acc: number, log: any) => acc + (log.weight * log.repsDone), 0)
    const previousVolume = previousLogs.reduce((acc: number, log: any) => acc + (log.weight * log.repsDone), 0)

    let todayMaxWeight = todayLogs.length > 0 ? Math.max(...todayLogs.map((l: any) => l.weight)) : 0
    let previousMaxWeight = previousLogs.length > 0 ? Math.max(...previousLogs.map((l: any) => l.weight)) : 0
    const isPerSide = ex.weightType === 'PER_SIDE'

    if (isPerSide) {
      todayMaxWeight = todayMaxWeight / 2
      previousMaxWeight = previousMaxWeight / 2
    }

    return {
      ...ex,
      wasDoneToday: todayLogs.length > 0,
      todayLogs,
      previousLogs,
      todayVolume,
      previousVolume,
      todayMaxWeight,
      previousMaxWeight,
      isPerSide,
      hasPreviousHistory: previousLogs.length > 0
    }
  }) || []

  const doneExercises = processedExercises.filter(ex => ex.wasDoneToday)
  const skippedExercises = processedExercises.filter(ex => !ex.wasDoneToday)

  // VIEW: COMPLETED
  if (currentState === 'COMPLETED') {
    let workoutDurationMins = 0
    let cardioDurationMins = 0
    let exerciseDurationMins = 0

    if (workoutStatus?.startTime && workoutStatus?.endTime) {
      const diffMs = new Date(workoutStatus.endTime).getTime() - new Date(workoutStatus.startTime).getTime()
      workoutDurationMins = Math.max(1, Math.round(diffMs / 60000))
      cardioDurationMins = (workoutStatus.hasCardio && todayCardio) ? todayCardio.duration : 0
      exerciseDurationMins = Math.max(0, workoutDurationMins - cardioDurationMins)
    }

    const totalTodayVolume = processedExercises.reduce((acc, ex) => acc + ex.todayVolume, 0)
    const totalPreviousVolume = processedExercises.reduce((acc, ex) => acc + ex.previousVolume, 0)

    let totalVolumeStatus = 'equal'
    if (totalPreviousVolume === 0 && totalTodayVolume > 0) totalVolumeStatus = 'new'
    else if (totalTodayVolume > totalPreviousVolume) totalVolumeStatus = 'up'
    else if (totalTodayVolume < totalPreviousVolume) totalVolumeStatus = 'down'

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    }

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
    }

    const totalDuration = exerciseDurationMins + cardioDurationMins;
    const exercisePercent = totalDuration > 0 ? (exerciseDurationMins / totalDuration) * 100 : 0;
    const cardioPercent = totalDuration > 0 ? (cardioDurationMins / totalDuration) * 100 : 0;

    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24">
        {completedLogs.length > 1 && (
          <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto w-full sm:w-auto no-scrollbar">
            {completedLogs.map((log: any) => (
              <button
                key={log.id}
                onClick={() => setSwappedWorkoutId(log.workoutId)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${todayWorkout?.id === log.workoutId
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {log.workout?.name || "Treino"}
              </button>
            ))}
          </div>
        )}

        {renderHeader()}

        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative w-full overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/60 shadow-2xl backdrop-blur-xl mt-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-primary/10 opacity-60"></div>

          <div className="relative z-10 flex flex-col items-center p-8 sm:p-12 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="w-24 h-24 mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] border border-yellow-500/30"
            >
              <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            </motion.div>

            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
              Treino Concluído!
            </h2>
            <p className="text-zinc-400 max-w-md text-base sm:text-lg mb-8">
              Você dominou esse treino. O corpo que você quer, construído dia após dia.
            </p>

            <Button
              variant="outline"
              className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium shadow-sm transition-all active:scale-95"
              onClick={() => alert("Compartilhar com redes sociais - Em breve!")}
            >
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar Conquista
            </Button>
          </div>

          {/* QUICK STATS */}
          <div className="relative z-10 border-t border-zinc-800/80 bg-black/40 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-black text-white mb-1 drop-shadow-md">{doneExercises.length}</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-widest text-center">Exercícios</span>
              </div>

              <div className="w-16 h-px sm:w-px sm:h-16 bg-zinc-800/80"></div>

              <div className="flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-black text-white mb-1 drop-shadow-md">{workoutDurationMins > 0 ? `${workoutDurationMins}m` : '-'}</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-widest text-center">Tempo</span>
              </div>

              <div className="w-16 h-px sm:w-px sm:h-16 bg-zinc-800/80"></div>

              <div className="flex flex-col items-center">
                <div className="flex items-start gap-1">
                  <span className="text-5xl sm:text-6xl font-black text-white mb-1 drop-shadow-md">{totalTodayVolume}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-widest text-center">Volume</span>
                  {totalVolumeStatus === 'up' && <ArrowUp className="w-4 h-4 text-emerald-500" />}
                  {totalVolumeStatus === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            </div>

            {/* BARRA DE PROGRESSO VISUAL */}
            {workoutDurationMins > 0 && (
              <div className="max-w-2xl mx-auto mt-8 space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-primary">{exerciseDurationMins}m Musculação</span>
                  {cardioDurationMins > 0 && <span className="text-emerald-500">{cardioDurationMins}m Cardio</span>}
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden flex shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exercisePercent}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-primary"
                  />
                  {cardioPercent > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cardioPercent}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-emerald-500"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* DESEMPENHO DE HOJE */}
        {doneExercises.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 mt-12"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 px-1">
              <Activity className="w-6 h-6 text-emerald-500" />
              Desempenho de Hoje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doneExercises.map(ex => {
                let volumeStatus = 'equal'
                if (!ex.hasPreviousHistory) volumeStatus = 'new'
                else if (ex.todayVolume > ex.previousVolume) volumeStatus = 'up'
                else if (ex.todayVolume < ex.previousVolume) volumeStatus = 'down'

                let weightStatus = 'equal'
                if (!ex.hasPreviousHistory) weightStatus = 'new'
                else if (ex.todayMaxWeight > ex.previousMaxWeight) weightStatus = 'up'
                else if (ex.todayMaxWeight < ex.previousMaxWeight) weightStatus = 'down'

                return (
                  <motion.div
                    variants={itemVariants}
                    key={ex.id}
                    className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-2xl flex flex-col gap-5 shadow-lg backdrop-blur-sm hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {ex.exercise.imageUrl ? (
                        <div className="relative">
                          <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-14 h-14 rounded-xl object-cover bg-zinc-900 border border-zinc-800" />
                          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-zinc-950 shadow-sm">
                            {ex.todayLogs.length}s
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Dumbbell className="w-7 h-7 text-zinc-600" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-zinc-950 shadow-sm">
                            {ex.todayLogs.length}s
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg leading-tight">{ex.exercise.name}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Carga Máxima */}
                      <div className="flex flex-col gap-1 bg-black/40 rounded-xl p-3 border border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Carga Máxima {ex.isPerSide ? "(Cada Lado)" : ""}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xl font-bold text-white">{ex.todayMaxWeight}kg</span>
                          {weightStatus === 'new' && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center"><Star className="w-3 h-3 mr-1" />NOVO</span>}
                          {weightStatus === 'up' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">+{ex.todayMaxWeight - ex.previousMaxWeight}kg <ArrowUp className="w-3 h-3 ml-0.5" /></span>}
                          {weightStatus === 'down' && <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">{ex.todayMaxWeight - ex.previousMaxWeight}kg <ArrowDown className="w-3 h-3 ml-0.5" /></span>}
                          {weightStatus === 'equal' && <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">MANTEVE</span>}
                        </div>
                      </div>

                      {/* Volume Total */}
                      <div className="flex flex-col gap-1 bg-black/40 rounded-xl p-3 border border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Volume Total</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xl font-bold text-white">{ex.todayVolume}</span>
                          {volumeStatus === 'new' && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center"><Star className="w-3 h-3 mr-1" />NOVO</span>}
                          {volumeStatus === 'up' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">+{ex.todayVolume - ex.previousVolume} <ArrowUp className="w-3 h-3 ml-0.5" /></span>}
                          {volumeStatus === 'down' && <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">{ex.todayVolume - ex.previousVolume} <ArrowDown className="w-3 h-3 ml-0.5" /></span>}
                          {volumeStatus === 'equal' && <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">MANTEVE</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* EXERCÍCIOS PULADOS */}
        {skippedExercises.length > 0 && (
          <div className="mt-12">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4 px-2">
              <Trash2 className="w-4 h-4" />
              Exercícios Pulados
            </h3>
            <div className="flex flex-wrap gap-2 opacity-50">
              {skippedExercises.map(ex => (
                <div key={ex.id} className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-2 grayscale text-xs font-medium text-zinc-400 line-through">
                  {ex.exercise.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    )
  }

  // VIEW: IN_PROGRESS
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-24">
      {renderHeader()}

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Exercícios {exercises ? `(${exercises.filter(ex => ex.isActive).length})` : ""}
          </h2>
          <div className="flex bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80 shadow-inner gap-1">
            <button
              onClick={() => toggleViewMode('focus')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'focus'
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              title="Modo Foco"
            >
              <Focus className={`w-4 h-4 ${viewMode === 'focus' ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`} />
              Foco
            </button>
            <button
              onClick={() => toggleViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              title="Modo Lista"
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>
        </div>

        {isLoadingExercises ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : !exercises || exercises.filter(ex => ex.isActive).length === 0 ? (
          <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Dumbbell className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-zinc-400">Nenhum exercício cadastrado ou todos estão desativados nesta ficha.</p>
          </div>
        ) : viewMode === 'focus' ? (
          <TreinoFocusView
            workoutId={todayWorkout.id}
            exercises={exercises}
            onFinishAll={() => toggleViewMode('list')}
            onClose={() => toggleViewMode('list')}
          />
        ) : (
          exercises.filter(ex => ex.isActive).map((workoutExercise, index) => (
            <ExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              index={index}
              isCompleted={false}
              onSetComplete={handleSetComplete}
            />
          ))
        )}
      </div>

      {viewMode === 'list' && (
        <div className="pt-8 border-t border-zinc-800/50">
          <Button
            onClick={handleFinishMuscleTraining}
            className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 text-white"
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Finalizar Musculação
          </Button>
        </div>
      )}

      {viewMode === 'list' && showRestTimer && (
        <RestTimer
          key={restTimerKey}
          initialSeconds={120} // We can pull this from user profile later, hardcoding 2 min for now
          onClose={() => setShowRestTimer(false)}
        />
      )}
    </div>
  )
}
