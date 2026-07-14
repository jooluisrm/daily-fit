"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, CalendarDays, Save, Activity, Loader2, Dumbbell, Trash2, Undo2, ArrowLeftRight } from "lucide-react"
import { ExerciseCard } from "@/src/components/treino/exercise-card"
import { useWorkouts } from "@/src/hooks/use-workout"
import { useWorkoutExercises } from "@/src/hooks/use-exercise"
import { useTodayCardio, useLogCardio } from "@/src/hooks/use-cardio"
import { useTodayWorkoutStatus, useToggleWorkoutStatus } from "@/src/hooks/use-workout-log"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

const DAYS_MAP = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

export function TreinoToday() {
  const [cardioIntensity, setCardioIntensity] = useState<string>("moderado")
  const [cardioTime, setCardioTime] = useState<string>("")
  const [swappedWorkoutId, setSwappedWorkoutId] = useState<string | null>(null)

  const { data: workouts, isLoading: isLoadingWorkouts } = useWorkouts()

  // Pegar o dia da semana atual (0 = Domingo, 6 = Sábado)
  const todayIndex = new Date().getDay()
  const defaultTodayWorkout = workouts?.find(w => w.isActive && w.daysOfWeek.includes(todayIndex))
  const todayWorkout = swappedWorkoutId 
    ? workouts?.find(w => w.id === swappedWorkoutId) 
    : defaultTodayWorkout

  const { data: exercises, isLoading: isLoadingExercises } = useWorkoutExercises(todayWorkout?.id || "")
  
  const { data: todayCardio } = useTodayCardio()
  const { mutateAsync: logCardio, isPending: isSavingCardio } = useLogCardio()

  const { data: workoutStatus, isLoading: isLoadingStatus } = useTodayWorkoutStatus(todayWorkout?.id)
  const { mutateAsync: toggleStatus, isPending: isTogglingStatus } = useToggleWorkoutStatus(todayWorkout?.id)

  const isCompleted = !!workoutStatus

  useEffect(() => {
    if (todayCardio) {
      setCardioIntensity(todayCardio.intensity)
      setCardioTime(String(todayCardio.duration))
    } else {
      setCardioIntensity("moderado")
      setCardioTime("")
    }
  }, [todayCardio])

  // Recupera o swap do localStorage se for do dia atual
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
  }, [])

  const handleSwap = (workoutId: string) => {
    setSwappedWorkoutId(workoutId)
    localStorage.setItem('daily-fit-swap', JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      workoutId
    }))
    toast.success("Treino alterado para hoje!")
  }

  const handleRemoveSwap = () => {
    setSwappedWorkoutId(null)
    localStorage.removeItem('daily-fit-swap')
    toast.success("Treino original restaurado.")
  }

  const handleSaveCardio = async () => {
    if (!cardioTime) return
    try {
      await logCardio({
        intensity: cardioIntensity,
        duration: Number(cardioTime),
        workoutId: todayWorkout?.id
      })
      toast.success(todayCardio ? "Cardio atualizado com sucesso!" : "Cardio salvo com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar cardio.")
    }
  }

  const handleRemoveCardio = async () => {
    try {
      await logCardio({ intensity: "leve", duration: 0, workoutId: todayWorkout?.id })
      toast.success("Cardio de hoje removido.")
      setCardioTime("")
    } catch (error) {
      toast.error("Erro ao remover cardio.")
    }
  }

  const handleToggleFinish = async () => {
    try {
      await toggleStatus(!isCompleted)
      if (!isCompleted) {
        toast.success("Parabéns! Treino finalizado com sucesso! 🎉")
      } else {
        toast.success("Treino reaberto para edições.")
      }
    } catch (error) {
      toast.error("Erro ao alterar status do treino.")
    }
  }

  if (isLoadingWorkouts) {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header do Treino */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-primary font-medium">
            <CalendarDays className="w-5 h-5" />
            <span>{DAYS_MAP[todayIndex]}</span>
          </div>
          {workouts && workouts.length > 0 && !isCompleted && (
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
              {isCompleted ? "🎉 Treino Realizado" : todayWorkout.name}
            </h1>
            {isCompleted && (
              <p className="text-emerald-400 font-medium">
                {exercises?.length || 0} exercícios feitos | Cardio: {todayCardio ? `Realizado (${todayCardio.duration} min)` : "Não realizado"}
              </p>
            )}
          </div>
          {isCompleted && (
            <Button 
              variant="outline" 
              onClick={handleToggleFinish}
              disabled={isTogglingStatus}
              className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              {isTogglingStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Undo2 className="w-4 h-4 mr-2" />}
              Desfazer Finalização
            </Button>
          )}
        </div>
      </div>

      {/* Lista de Exercícios */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">
          Exercícios {exercises ? `(${exercises.filter(ex => ex.isActive).length})` : ""}
        </h2>

        {isLoadingExercises ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : !exercises || exercises.filter(ex => ex.isActive).length === 0 ? (
          <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Dumbbell className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-zinc-400">Nenhum exercício cadastrado ou todos estão desativados nesta ficha.</p>
          </div>
        ) : (
          exercises.filter(ex => ex.isActive).map((workoutExercise) => (
            <ExerciseCard key={workoutExercise.id} workoutExercise={workoutExercise} isCompleted={isCompleted} />
          ))
        )}
      </div>

      {/* Sessão de Cardio */}
      <div className="pt-8 pb-4 border-t border-zinc-800/50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Cardio</h2>
            <p className="text-sm text-zinc-400">Registre sua atividade cardiovascular hoje.</p>
          </div>
        </div>

        <div className="space-y-6 bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
          <div className="space-y-3">
            <Label className="text-zinc-300">Intensidade</Label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                disabled={isCompleted}
                onClick={() => setCardioIntensity("leve")}
                className={`flex-1 h-11 text-sm font-medium transition-all border ${cardioIntensity === "leve" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"} disabled:opacity-50`}
              >
                Leve
              </Button>
              <Button
                variant="ghost"
                disabled={isCompleted}
                onClick={() => setCardioIntensity("moderado")}
                className={`flex-1 h-11 text-sm font-medium transition-all border ${cardioIntensity === "moderado" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"} disabled:opacity-50`}
              >
                Moderado
              </Button>
              <Button
                variant="ghost"
                disabled={isCompleted}
                onClick={() => setCardioIntensity("intenso")}
                className={`flex-1 h-11 text-sm font-medium transition-all border ${cardioIntensity === "intenso" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"} disabled:opacity-50`}
              >
                Intenso
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="cardio-time" className="text-zinc-300">Duração (minutos)</Label>
            <Input
              id="cardio-time"
              type="number"
              placeholder="Ex: 20"
              value={cardioTime}
              onChange={(e) => setCardioTime(e.target.value)}
              disabled={isCompleted}
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button 
              onClick={handleSaveCardio}
              disabled={!cardioTime || isSavingCardio || isCompleted}
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            >
              {isSavingCardio ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {todayCardio ? "Atualizar Cardio" : "Salvar Cardio"}
            </Button>
            <Button 
              onClick={handleRemoveCardio}
              disabled={isSavingCardio || !todayCardio || isCompleted}
              variant="ghost" 
              className="w-full h-12 text-base font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Não fiz cardio hoje
            </Button>
          </div>
        </div>

        {!isCompleted && (
          <Button 
            onClick={handleToggleFinish}
            disabled={isTogglingStatus}
            className="w-full md:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isTogglingStatus ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Finalizar Treino
          </Button>
        )}
      </div>
    </div>
  )
}
