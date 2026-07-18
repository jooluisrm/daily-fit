"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Activity, CheckCircle2, Coffee, Timer } from "lucide-react"
import Link from "next/link"
import { useWorkouts } from "@/src/hooks/use-workout"
import { useTodayAllWorkoutLogs } from "@/src/hooks/use-workout-log"
import { useWorkoutExercises } from "@/src/hooks/use-exercise"

export function TodayWorkoutCard() {
  const { data: workouts } = useWorkouts()
  const today = new Date()

  const dateString = today.toISOString().split('T')[0]
  const { data: allLogs } = useTodayAllWorkoutLogs()

  const selectedDayIndex = today.getDay()
  let todayWorkout = workouts?.find(w => w.isActive && w.daysOfWeek.includes(selectedDayIndex))

  const activeLog = allLogs?.find((l: any) => l.status === 'IN_PROGRESS' || l.status === 'CARDIO')
  let isCompleted = false
  let isWorkoutActive = false

  if (activeLog) {
    const activeWorkout = workouts?.find(w => w.id === activeLog.workoutId)
    if (activeWorkout) {
      todayWorkout = activeWorkout
      isWorkoutActive = true
    }
  } else if (todayWorkout) {
    const completedLog = allLogs?.find((l: any) => l.workoutId === todayWorkout!.id && l.status === 'COMPLETED')
    if (completedLog) {
      isCompleted = true
    }
  }

  const { data: exercises } = useWorkoutExercises(todayWorkout?.id || "")

  let avgTime = 0
  if (todayWorkout && todayWorkout.workoutLogs) {
    let totalMins = 0
    let count = 0
    todayWorkout.workoutLogs.forEach((log: any) => {
      if (log.startTime && log.endTime) {
        const diff = new Date(log.endTime).getTime() - new Date(log.startTime).getTime()
        totalMins += Math.round(diff / 60000)
        count++
      }
    })
    avgTime = count > 0 ? Math.round(totalMins / count) : 0
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  const firstExerciseImg = exercises?.find(ex => ex.isActive)?.exercise?.imageUrl

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950 border-zinc-800/50 flex flex-col h-full transition-all group hover:border-zinc-700/50 hover:scale-[1.02] shadow-sm ${isCompleted ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : ''}`}>
      <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
      {firstExerciseImg && (
        <>
          <img
            src={firstExerciseImg}
            alt="Treino"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950/20 pointer-events-none" />
        </>
      )}

      <CardHeader className="relative z-10 pb-3">
        <CardTitle className="text-lg text-white flex items-center justify-between">
          <div className="flex items-center gap-2 pt-3">
            {todayWorkout ? (
              <Dumbbell className={`w-5 h-5 ${isCompleted ? 'text-emerald-500' : 'text-primary'}`} />
            ) : (
              <Coffee className="w-5 h-5 text-zinc-500" />
            )}
            Treino de Hoje
          </div>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Realizado
            </span>
          )}
          {isWorkoutActive && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
              <Activity className="w-3.5 h-3.5" />
              Em Andamento
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {todayWorkout ? todayWorkout.name : "Dia de descanso. Aproveite para recuperar!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col flex-1">
        {todayWorkout && exercises && (
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-1.5 text-sm text-zinc-300 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 px-2.5 py-1.5 rounded-md font-medium shadow-sm">
              <Activity className="w-4 h-4 text-primary" />
              {exercises.length} exercícios
            </div>
            {avgTime > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-zinc-300 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 px-2.5 py-1.5 rounded-md font-medium shadow-sm">
                <Timer className="w-4 h-4 text-primary" />
                ~ {formatDuration(avgTime)}
              </div>
            )}
          </div>
        )}
        <Link href={todayWorkout ? `/treino` : "/treino?tab=list"} className="block mt-auto">
          <Button className={`w-full text-base font-medium h-11 transition-all ${isWorkoutActive ? "animate-pulse shadow-[0_0_15px_rgba(var(--primary-color),0.3)]" : ""}`} variant={todayWorkout ? (isCompleted ? "outline" : "default") : "secondary"}>
            {todayWorkout ? (isWorkoutActive ? "Continuar Treino" : (isCompleted ? "Ver Treino" : "Ir para Treino")) : "Ver Todos os Treinos"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
