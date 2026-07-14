"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Activity, CheckCircle2, Coffee } from "lucide-react"
import Link from "next/link"
import { useWorkouts } from "@/src/hooks/use-workout"
import { useTodayWorkoutStatus } from "@/src/hooks/use-workout-log"
import { useWorkoutExercises } from "@/src/hooks/use-exercise"

export function TodayWorkoutCard({ selectedDate }: { selectedDate: Date }) {
  const { data: workouts } = useWorkouts()

  const selectedDayIndex = selectedDate.getDay()
  const todayWorkout = workouts?.find(w => w.isActive && w.daysOfWeek.includes(selectedDayIndex))
  const { data: exercises } = useWorkoutExercises(todayWorkout?.id || "")

  const dateString = selectedDate.toISOString()
  const { data: workoutLog } = useTodayWorkoutStatus(todayWorkout?.id, dateString)

  const isToday = new Date().toDateString() === selectedDate.toDateString()
  const isCompleted = !!workoutLog

  const firstExerciseImg = exercises?.find(ex => ex.isActive)?.exercise?.imageUrl

  return (
    <Card className={`relative overflow-hidden bg-zinc-900 border-zinc-800 h-full transition-all ${isCompleted ? 'border-emerald-500/30 bg-emerald-950/10' : ''}`}>
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
            {isToday ? "Treino de Hoje" : `Treino de ${["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][selectedDayIndex]}`}
          </div>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Realizado
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {todayWorkout ? todayWorkout.name : "Dia de descanso. Aproveite para recuperar!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col flex-1">
        {todayWorkout && exercises && (
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-1.5 text-sm text-zinc-300 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 px-2.5 py-1.5 rounded-md font-medium shadow-sm">
              <Activity className="w-4 h-4 text-primary" />
              {exercises.length} exercícios programados
            </div>
          </div>
        )}
        <Link href={todayWorkout ? `/treino` : "/treino?tab=list"} className="block mt-auto">
          <Button className="w-full text-base font-medium h-11" variant={todayWorkout ? (isCompleted ? "outline" : "default") : "secondary"}>
            {todayWorkout ? (isCompleted ? "Ver Treino" : "Ir para Treino") : "Ver Todos os Treinos"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
