"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, Activity, Flame, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface StatsCardsProps {
  totalWorkouts: number;
  totalVolume: number;
  totalCardioMinutes: number;
  volumeByWorkout?: Record<string, number>;
  activeWorkouts?: { id: string; name: string }[];
}

export function StatsCards({ totalWorkouts, totalVolume, totalCardioMinutes, volumeByWorkout = {}, activeWorkouts = [] }: StatsCardsProps) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("all")
  const displayedVolume = selectedWorkoutId === "all" ? totalVolume : (volumeByWorkout[selectedWorkoutId] || 0)
  const selectedWorkoutName = selectedWorkoutId === "all" ? "Todos" : activeWorkouts.find(w => w.id === selectedWorkoutId)?.name || "Todos"

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
          <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1 w-full min-w-0">
            <div className="mb-1">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-300 font-medium outline-none transition-colors">
                  Volume: <span className="text-zinc-300 max-w-[80px] sm:max-w-[120px] truncate">{selectedWorkoutName}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-zinc-950 border-zinc-800 text-zinc-300 min-w-[140px]">
                  <DropdownMenuItem onClick={() => setSelectedWorkoutId("all")} className="text-xs cursor-pointer focus:bg-zinc-900 focus:text-white">
                    Todos os treinos
                  </DropdownMenuItem>
                  {activeWorkouts.map(w => (
                    <DropdownMenuItem key={w.id} onClick={() => setSelectedWorkoutId(w.id)} className="text-xs cursor-pointer focus:bg-zinc-900 focus:text-white">
                      {w.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-2xl font-bold text-white truncate">{displayedVolume.toLocaleString('pt-BR')} kg</p>
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
