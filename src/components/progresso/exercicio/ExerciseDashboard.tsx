"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { useQuery } from "@tanstack/react-query"
import { ExerciseAPI, ExerciseLog } from "@/src/services/api/exercise.api"
import { Skeleton } from "@/components/ui/skeleton"
import { OneRMChart } from "./OneRMChart"
import { MaxWeightChart } from "./MaxWeightChart"
import { VolumeChart } from "./VolumeChart"
import { SetsHistory } from "./SetsHistory"

export function ExerciseDashboard({ workoutId, exerciseId }: { workoutId: string, exerciseId: string }) {
  const [timeRange, setTimeRange] = useState("30d")

  const { data: workoutExercises = [], isLoading } = useQuery({
    queryKey: ['workout-exercises', workoutId],
    queryFn: () => ExerciseAPI.getWorkoutExercises(workoutId),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full pb-8 animate-in fade-in duration-500">
        <Skeleton className="h-4 w-32 bg-zinc-800/50" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
          <div className="w-full">
            <Skeleton className="h-8 w-64 bg-zinc-800/50 mb-2" />
            <Skeleton className="h-4 w-96 max-w-full bg-zinc-800/50" />
          </div>
          <Skeleton className="h-10 w-full sm:w-[250px] bg-zinc-800/50 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] rounded-2xl bg-zinc-900/50" />
          <Skeleton className="h-[350px] rounded-2xl bg-zinc-900/50" />
          <div className="lg:col-span-2">
            <Skeleton className="h-[350px] rounded-2xl bg-zinc-900/50" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[350px] rounded-2xl bg-zinc-900/50" />
          </div>
        </div>
      </div>
    )
  }

  // Find the correct workout exercise link (comparing with the base exerciseId)
  const targetExercise = workoutExercises.find(we => we.exerciseId === exerciseId);
  const exerciseName = targetExercise?.exercise?.name || "Exercício Específico";

  // Data Processing
  const chartData: { date: string, volume: number, maxWeight: number, oneRM: number }[] = [];
  const sessionsHistory: { date: string, sets: { reps: number, weight: number }[] }[] = [];

  if (targetExercise?.logs && targetExercise.logs.length > 0) {
    const limitDate = new Date();
    if (timeRange === "7d") limitDate.setDate(limitDate.getDate() - 7);
    else if (timeRange === "30d") limitDate.setDate(limitDate.getDate() - 30);
    else if (timeRange === "1y") limitDate.setFullYear(limitDate.getFullYear() - 1);
    limitDate.setHours(0, 0, 0, 0);

    // Logs are descending from API, let's process them keeping order
    // But for charts we want chronological (ascending), so we'll reverse at the end
    const logsByDate = new Map<string, { dateObj: Date, logs: ExerciseLog[] }>();

    targetExercise.logs.forEach(log => {
      const d = new Date(log.date);
      if (d >= limitDate) {
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (!logsByDate.has(dateStr)) {
          logsByDate.set(dateStr, { dateObj: d, logs: [] });
        }
        logsByDate.get(dateStr)!.logs.push(log);
      }
    });

    // Build the array
    const grouped = Array.from(logsByDate.entries());

    // Sort ascending by date for charts
    grouped.sort((a, b) => a[1].dateObj.getTime() - b[1].dateObj.getTime());

    grouped.forEach(([dateStr, { logs }]) => {
      let volume = 0;
      let maxWeight = 0;
      let oneRM = 0;

      const sets = [...logs].sort((a, b) => a.setNumber - b.setNumber).map(l => ({
        reps: l.repsDone,
        weight: l.weight
      }));

      const isPerSide = targetExercise?.weightType === "PER_SIDE";

      logs.forEach(l => {
        // O volume é sempre o total movido no dia, então usamos l.weight inteiro
        volume += (l.weight * l.repsDone);

        // Para Max Weight e 1RM, verificamos se o exercício pede exibição por lado
        const weightToConsider = isPerSide ? l.weight / 2 : l.weight;

        if (weightToConsider > maxWeight) maxWeight = weightToConsider;

        // Epley Formula usando a métrica considerada
        const estimated1RM = weightToConsider * (1 + l.repsDone / 30);
        if (estimated1RM > oneRM) oneRM = estimated1RM;
      });

      chartData.push({
        date: dateStr,
        volume,
        maxWeight,
        oneRM: Math.round(oneRM)
      });

      // Sessions History needs descending order (latest first), so we push here and reverse the whole array later, or unshift
      sessionsHistory.unshift({
        date: dateStr,
        sets
      });
    });
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <Link href={`/progresso/treino/${workoutId}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Treino
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
        <div>
          <h1 className="text-2xl font-bold text-white">{exerciseName}</h1>
          <p className="text-sm text-zinc-400">Análise profunda de desempenho e progressão de carga.</p>
        </div>
        <div className="flex bg-zinc-950/50 p-1 rounded-lg border border-zinc-800/80 w-full sm:w-auto">
          {[
            { id: "7d", label: "7 Dias" },
            { id: "30d", label: "30 Dias" },
            { id: "1y", label: "Ano" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800/50 text-center flex flex-col items-center gap-2">
          <p className="text-zinc-400">Sem dados suficientes para análise neste período.</p>
          <p className="text-zinc-500 text-sm">Registre suas séries para ver a mágica acontecer!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          <OneRMChart data={chartData} weightType={targetExercise?.weightType} />
          <MaxWeightChart data={chartData} weightType={targetExercise?.weightType} />
          <div className="lg:col-span-2">
            <VolumeChart data={chartData} />
          </div>
          <div className="lg:col-span-2">
            <SetsHistory sessions={sessionsHistory} weightType={targetExercise?.weightType} />
          </div>
        </div>
      )}
    </div>
  )
}
