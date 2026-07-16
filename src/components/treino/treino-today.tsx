"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, CalendarDays, Save, Activity, Loader2, Dumbbell, Trash2, Undo2, ArrowLeftRight, PlayCircle, Trophy, Timer, ArrowUp, ArrowDown, Minus, Star, Plus } from "lucide-react"
import { ExerciseCard } from "@/src/components/treino/exercise-card"
import { useWorkouts } from "@/src/hooks/use-workout"
import { useWorkoutExercises } from "@/src/hooks/use-exercise"
import { useTodayCardio, useLogCardio } from "@/src/hooks/use-cardio"
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

  // If there's an in-progress log, force it as todayWorkout
  // Otherwise respect the swap or default
  const effectiveWorkoutId = inProgressLog 
    ? inProgressLog.workoutId 
    : (swappedWorkoutId || defaultTodayWorkout?.id)

  const todayWorkout = workouts?.find(w => w.id === effectiveWorkoutId)

  const { data: exercises, isLoading: isLoadingExercises } = useWorkoutExercises(todayWorkout?.id || "")
  
  const { data: todayCardio } = useTodayCardio()
  const { mutateAsync: logCardio, isPending: isSavingCardio } = useLogCardio()

  const { data: workoutStatus, isLoading: isLoadingStatus } = useTodayWorkoutStatus(todayWorkout?.id)
  const { mutateAsync: startWorkout, isPending: isStarting } = useStartWorkout(todayWorkout?.id)
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateWorkoutStatus(todayWorkout?.id)

  const currentState = workoutStatus?.status

  useEffect(() => {
    if (todayCardio) {
      setCardioIntensity(todayCardio.intensity)
      setCardioTime(String(todayCardio.duration))
    }
  }, [todayCardio])

  useEffect(() => {
    const swapData = localStorage.getItem('daily-fit-swap')
    if (swapData) {
      try {
        const { date, workoutId } = JSON.parse(swapData)
        if (date === new Date().toISOString().split('T')[0]) {
          setSwappedWorkoutId(workoutId)
        }
      } catch (e) {}
    }
    const savedViewMode = localStorage.getItem('daily-fit-view-mode')
    if (savedViewMode === 'list' || savedViewMode === 'focus') {
      setViewMode(savedViewMode)
    }
  }, [])

  const handleSwap = (workoutId: string) => {
    setSwappedWorkoutId(workoutId)
    localStorage.setItem('daily-fit-swap', JSON.stringify({
      date: new Date().toISOString().split('T')[0],
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

  const handleFinishMuscleTraining = () => {
    setShowCardioPrompt(true)
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
      await updateStatus({ status: 'IN_PROGRESS', hasCardio: false })
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
        return new Date(Number(yearB), Number(monthB)-1, Number(dayB)).getTime() - new Date(Number(yearA), Number(monthA)-1, Number(dayA)).getTime()
      })
      lastDateStr = sortedPastDates[0] as string
    }

    const previousLogs = pastLogs.filter((l: any) => {
      return new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) === lastDateStr
    })

    // Calculate metrics
    const todayVolume = todayLogs.reduce((acc: number, log: any) => acc + (log.weight * log.repsDone), 0)
    const previousVolume = previousLogs.reduce((acc: number, log: any) => acc + (log.weight * log.repsDone), 0)
    
    const todayMaxWeight = todayLogs.length > 0 ? Math.max(...todayLogs.map((l: any) => l.weight)) : 0
    const previousMaxWeight = previousLogs.length > 0 ? Math.max(...previousLogs.map((l: any) => l.weight)) : 0

    return {
      ...ex,
      wasDoneToday: todayLogs.length > 0,
      todayLogs,
      previousLogs,
      todayVolume,
      previousVolume,
      todayMaxWeight,
      previousMaxWeight,
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

    return (
      <div className="space-y-8 animate-in fade-in duration-300 pb-24">
        {completedLogs.length > 1 && (
          <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto w-full sm:w-auto">
            {completedLogs.map((log: any) => (
              <button
                key={log.id}
                onClick={() => setSwappedWorkoutId(log.workoutId)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  todayWorkout?.id === log.workoutId 
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
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-zinc-800 rounded-2xl bg-zinc-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50"></div>
          <Trophy className="w-16 h-16 text-yellow-500 mb-4 relative z-10" />
          <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Treino Concluído! 🏆</h2>
          <p className="text-zinc-400 mb-6 max-w-md relative z-10 text-base">Excelente trabalho! Aqui está o resumo do seu desempenho hoje.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10 mb-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
              <Dumbbell className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{doneExercises.length}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Exercícios Feitos</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
              <Timer className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{workoutDurationMins > 0 ? `${workoutDurationMins}m` : '-'}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Tempo Total</div>
            </div>
          </div>

          <div className="flex gap-2 w-full max-w-md relative z-10">
            <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between px-4">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Musculação</span>
              <span className="font-bold text-white">{workoutDurationMins > 0 ? `${exerciseDurationMins}m` : '-'}</span>
            </div>
            <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between px-4">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Cardio</span>
              <span className="font-bold text-emerald-500">{cardioDurationMins > 0 ? `${cardioDurationMins}m` : '-'}</span>
            </div>
          </div>
        </div>

        {doneExercises.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Desempenho de Hoje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {doneExercises.map(ex => {
                let volumeStatus = 'equal' // equal, up, down, new
                if (!ex.hasPreviousHistory) volumeStatus = 'new'
                else if (ex.todayVolume > ex.previousVolume) volumeStatus = 'up'
                else if (ex.todayVolume < ex.previousVolume) volumeStatus = 'down'

                let weightStatus = 'equal'
                if (!ex.hasPreviousHistory) weightStatus = 'new'
                else if (ex.todayMaxWeight > ex.previousMaxWeight) weightStatus = 'up'
                else if (ex.todayMaxWeight < ex.previousMaxWeight) weightStatus = 'down'

                return (
                  <div key={ex.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      {ex.exercise.imageUrl ? (
                        <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <Dumbbell className="w-6 h-6 text-zinc-500" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">{ex.exercise.name}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{ex.todayLogs.length} séries feitas</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Carga Máxima */}
                      <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800/80">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 flex justify-between">
                          <span>Carga Máxima</span>
                          {weightStatus !== 'new' && <span className="text-zinc-600 font-medium">Ant: {ex.previousMaxWeight}kg</span>}
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="font-mono text-base font-bold text-zinc-200">{ex.todayMaxWeight}kg</span>
                          <div className="flex items-center">
                            {weightStatus === 'new' && <Star className="w-4 h-4 text-yellow-500 mb-0.5" />}
                            {weightStatus === 'up' && <ArrowUp className="w-4 h-4 text-emerald-500 mb-0.5" />}
                            {weightStatus === 'down' && <ArrowDown className="w-4 h-4 text-red-500 mb-0.5" />}
                            {weightStatus === 'equal' && <Minus className="w-4 h-4 text-zinc-500 mb-0.5" />}
                          </div>
                        </div>
                      </div>
                      
                      {/* Volume Total */}
                      <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800/80">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 flex justify-between">
                          <span>Volume Total</span>
                          {volumeStatus !== 'new' && <span className="text-zinc-600 font-medium">Ant: {ex.previousVolume}</span>}
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="font-mono text-base font-bold text-zinc-200">{ex.todayVolume}</span>
                          <div className="flex items-center">
                            {volumeStatus === 'new' && <Star className="w-4 h-4 text-yellow-500 mb-0.5" />}
                            {volumeStatus === 'up' && <ArrowUp className="w-4 h-4 text-emerald-500 mb-0.5" />}
                            {volumeStatus === 'down' && <ArrowDown className="w-4 h-4 text-red-500 mb-0.5" />}
                            {volumeStatus === 'equal' && <Minus className="w-4 h-4 text-zinc-500 mb-0.5" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {skippedExercises.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-800/50">
            <h3 className="text-xl font-bold text-zinc-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-zinc-500" />
              Exercícios Pulados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-60">
              {skippedExercises.map(ex => (
                <div key={ex.id} className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl flex items-center gap-3 grayscale">
                  {ex.exercise.imageUrl ? (
                    <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-800/50" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-zinc-600" />
                    </div>
                  )}
                  <h4 className="font-medium text-zinc-400 text-sm line-through">{ex.exercise.name}</h4>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'focus' 
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'list' 
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
