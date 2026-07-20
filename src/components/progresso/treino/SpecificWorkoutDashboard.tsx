"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ProgressAPI } from "@/src/services/api/progress.api"
import { Skeleton } from "@/components/ui/skeleton"
import { ExerciseProgressList } from "./ExerciseProgressList"

export function SpecificWorkoutDashboard({ workoutId }: { workoutId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['specific-workout', workoutId],
    queryFn: () => ProgressAPI.getSpecificWorkoutProgress(workoutId),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full pb-8 animate-in fade-in duration-500">
        <Skeleton className="h-4 w-32 bg-zinc-800/50" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 bg-zinc-800/50" />
          <Skeleton className="h-4 w-96 max-w-full bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] rounded-2xl bg-zinc-900/50" />
          <Skeleton className="h-[350px] rounded-2xl bg-zinc-900/50" />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-6 w-48 bg-zinc-800/50 mb-2" />
          <Skeleton className="h-20 rounded-xl bg-zinc-900/50" />
          <Skeleton className="h-20 rounded-xl bg-zinc-900/50" />
          <Skeleton className="h-20 rounded-xl bg-zinc-900/50" />
        </div>
      </div>
    )
  }

  const workoutName = data?.workoutName || "Treino"
  const sessions = data?.sessions || []

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <Link href="/progresso/treino" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Seleção de Treino
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white">{workoutName}</h1>
        <p className="text-sm text-zinc-400">Análise geral deste treino ao longo das últimas sessões.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800/50 text-center flex flex-col items-center gap-2">
          <p className="text-zinc-400">Você ainda não concluiu este treino nenhuma vez.</p>
          <p className="text-zinc-500 text-sm">Assim que finalizar a primeira sessão, os gráficos de progresso aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          {/* Volume Chart */}
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-[350px] relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="mb-6 relative z-10">
              <h3 className="text-lg font-bold text-white">Volume por Sessão</h3>
              <p className="text-sm text-zinc-400">Carga total levantada (kg)</p>
            </div>
            <div className="flex-1">
              <ChartContainer config={{ volume: { label: "Volume (kg)", color: "#10b981" } }} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} tickFormatter={(value) => `${value > 0 ? (value / 1000).toFixed(1) : 0}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Duration Chart */}
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-[350px] relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
            <div className="mb-6 relative z-10">
              <h3 className="text-lg font-bold text-white">Duração do Treino</h3>
              <p className="text-sm text-zinc-400">Tempo gasto (minutos)</p>
            </div>
            <div className="flex-1">
              <ChartContainer config={{ duration: { label: "Minutos", color: "#8b5cf6" } }} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="duration" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl font-bold text-white mb-4">Exercícios deste Treino</h2>
        <ExerciseProgressList workoutId={workoutId} />
      </div>
    </div>
  )
}
