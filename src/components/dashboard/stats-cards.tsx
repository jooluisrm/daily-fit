"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, Activity, Flame } from "lucide-react"

interface StatsCardsProps {
  totalWorkouts: number;
  totalVolume: number;
  totalCardioMinutes: number;
}

export function StatsCards({ totalWorkouts, totalVolume, totalCardioMinutes }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      <Card className="bg-zinc-900 border-zinc-800 flex flex-col justify-center">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium mb-1">Treinos na Semana</p>
            <p className="text-2xl font-bold text-white">{totalWorkouts}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 flex flex-col justify-center">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium mb-1">Volume Levantado</p>
            <p className="text-2xl font-bold text-white">{totalVolume.toLocaleString('pt-BR')} kg</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 flex flex-col justify-center">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium mb-1">Minutos de Cardio</p>
            <p className="text-2xl font-bold text-white">{totalCardioMinutes} min</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
