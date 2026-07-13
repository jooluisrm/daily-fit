"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Clock, Flame, Coffee, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useWorkouts } from "@/src/hooks/use-workout"
import { useTodayWorkoutStatus } from "@/src/hooks/use-workout-log"

export function TodayWorkoutCard({ selectedDate }: { selectedDate: Date }) {
  const { data: workouts } = useWorkouts()
  
  const selectedDayIndex = selectedDate.getDay()
  const todayWorkout = workouts?.find(w => w.isActive && w.daysOfWeek.includes(selectedDayIndex))

  const dateString = selectedDate.toISOString()
  const { data: workoutLog } = useTodayWorkoutStatus(todayWorkout?.id, dateString)

  const isToday = new Date().toDateString() === selectedDate.toDateString()
  const isCompleted = !!workoutLog

  return (
    <Card className={`bg-zinc-900 border-zinc-800 h-full transition-all ${isCompleted ? 'border-emerald-500/30 bg-emerald-950/10' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
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
      <CardContent>
        {todayWorkout && (
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-1 text-sm text-zinc-300 bg-zinc-800 px-2 py-1 rounded-md">
              <Clock className="w-4 h-4 text-zinc-400" />
              60 min
            </div>
            <div className="flex items-center gap-1 text-sm text-zinc-300 bg-zinc-800 px-2 py-1 rounded-md">
              <Flame className="w-4 h-4 text-zinc-400" />
              350 kcal
            </div>
          </div>
        )}
        <Link href={todayWorkout ? `/treino/${todayWorkout.id}` : "/treino"} className="block mt-auto">
          <Button className="w-full text-base font-medium" variant={todayWorkout ? (isCompleted ? "outline" : "default") : "secondary"}>
            {todayWorkout ? (isCompleted ? "Ver Treino" : "Iniciar Treino") : "Ver Todos os Treinos"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
