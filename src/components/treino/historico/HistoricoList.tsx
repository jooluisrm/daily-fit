"use client";

import { HistoricoCard } from "./HistoricoCard";
import { useWorkoutHistory } from "@/src/hooks/use-workout-log";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, startOfDay } from "date-fns";

export interface WorkoutHistoryData {
  id: string;
  workoutName: string;
  daysAgo: number;
  weightliftingTimeMinutes: number;
  hasCardio: boolean;
  cardioTimeMinutes: number;
  date: Date;
}

export function HistoricoList() {
  const { data: historyLogs, isLoading } = useWorkoutHistory();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[120px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />
        <Skeleton className="h-[120px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />
        <Skeleton className="h-[120px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />
      </div>
    );
  }

  if (!historyLogs || historyLogs.length === 0) {
    return (
      <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl">
        <p className="text-zinc-400">Nenhum treino encontrado no histórico.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {historyLogs.map((log: any) => {
        // Calculate minutes diff for weightlifting
        const start = new Date(log.startTime);
        const end = log.endTime ? new Date(log.endTime) : new Date();
        const weightliftingTimeMinutes = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000 / 60));
        
        // Calculate cardio time
        const cardioTimeMinutes = log.cardioLogs?.reduce((acc: number, cardio: any) => acc + (cardio.duration || 0), 0) || 0;
        
        // Calculate days ago safely considering timezones
        const date = new Date(log.date);
        const today = startOfDay(new Date());
        const logDay = startOfDay(date);
        const daysAgo = differenceInDays(today, logDay);

        const workout: WorkoutHistoryData = {
          id: log.id,
          workoutName: log.workout?.name || "Treino Desconhecido",
          daysAgo,
          weightliftingTimeMinutes,
          hasCardio: log.hasCardio,
          cardioTimeMinutes,
          date,
        };

        return <HistoricoCard key={log.id} workout={workout} />;
      })}
    </div>
  );
}
