"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Timer, Activity, Calendar } from "lucide-react";
import Link from "next/link";
import type { WorkoutHistoryData } from "./HistoricoList";

interface HistoricoCardProps {
  workout: WorkoutHistoryData;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  
  if (h > 0) {
    return `${h}h ${m}min`;
  }
  return `${m}min`;
}

export function HistoricoCard({ workout }: HistoricoCardProps) {
  const totalTimeMinutes = workout.weightliftingTimeMinutes + (workout.hasCardio ? workout.cardioTimeMinutes : 0);

  const daysAgoText = workout.daysAgo === 0 
    ? "Hoje" 
    : workout.daysAgo === 1 
      ? "Ontem" 
      : `Há ${workout.daysAgo} dias`;

  return (
    <Link href={`/treino/historico/${workout.id}`} className="block">
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:bg-zinc-900 transition-colors">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Header - Nome do Treino e Dias */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{daysAgoText}</span>
            <span className="text-zinc-600">•</span>
            <span>{workout.date.toLocaleDateString('pt-BR')}</span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-zinc-400" />
            {workout.workoutName}
          </h3>
        </div>

        {/* Informações de Tempo */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 mt-2 md:mt-0">
          {/* Musculação */}
          <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-800">
            <Dumbbell className="w-4 h-4 text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold leading-none mb-1">Musculação</span>
              <span className="text-sm font-medium text-zinc-200 leading-none">{formatTime(workout.weightliftingTimeMinutes)}</span>
            </div>
          </div>

          {/* Cardio */}
          {workout.hasCardio && (
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-800">
              <Activity className="w-4 h-4 text-red-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold leading-none mb-1">Cardio</span>
                <span className="text-sm font-medium text-zinc-200 leading-none">{formatTime(workout.cardioTimeMinutes)}</span>
              </div>
            </div>
          )}

          {/* Tempo Total */}
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
            <Timer className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] text-primary/70 uppercase font-semibold leading-none mb-1">Tempo Total</span>
              <span className="text-sm font-bold text-primary leading-none">{formatTime(totalTimeMinutes)}</span>
            </div>
          </div>
        </div>
        
      </CardContent>
      </Card>
    </Link>
  );
}
