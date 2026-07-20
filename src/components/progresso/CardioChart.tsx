"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ProgressAPI } from "@/src/services/api/progress.api"

export function CardioChart({ timeRange }: { timeRange: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['progress-cardio', timeRange],
    queryFn: () => ProgressAPI.getCardioProgress(timeRange),
  })

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-full relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white">Minutos de Cardio</h3>
        <p className="text-sm text-zinc-400">Total de tempo em atividade (min)</p>
      </div>
      
      <div className="flex-1 min-h-[300px] relative z-10">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-xl bg-zinc-900/50" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-zinc-500 text-sm">Nenhum cardio registrado neste período.</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              esteira: { label: "Esteira", color: "#f43f5e" },
              bike: { label: "Bike", color: "#8b5cf6" },
              escada: { label: "Escada", color: "#f59e0b" },
            }}
            className="h-full w-full animate-in fade-in duration-500"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEsteira" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBike" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEscada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="escada" stackId="1" stroke="#f59e0b" fill="url(#colorEscada)" />
                <Area type="monotone" dataKey="bike" stackId="1" stroke="#8b5cf6" fill="url(#colorBike)" />
                <Area type="monotone" dataKey="esteira" stackId="1" stroke="#f43f5e" fill="url(#colorEsteira)" />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
