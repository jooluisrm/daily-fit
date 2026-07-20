"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ProgressAPI } from "@/src/services/api/progress.api"

export function WorkoutChart({ timeRange }: { timeRange: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['progress-workout', timeRange],
    queryFn: () => ProgressAPI.getWorkoutProgress(timeRange),
  })

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-full relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white">Volume de Treino</h3>
        <p className="text-sm text-zinc-400">Total de carga levantada (kg)</p>
      </div>
      
      <div className="flex-1 min-h-[300px] relative z-10">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-xl bg-zinc-900/50" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-zinc-500 text-sm">Nenhum treino registrado neste período.</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              volume: { label: "Volume Total (kg)", color: "#10b981" },
            }}
            className="h-full w-full animate-in fade-in duration-500"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  tickFormatter={(value) => `${value > 0 ? (value / 1000).toFixed(1) : 0}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
