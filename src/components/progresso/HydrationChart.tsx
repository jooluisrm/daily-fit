"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ProgressAPI } from "@/src/services/api/progress.api"

export function HydrationChart({ timeRange }: { timeRange: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['progress-water', timeRange],
    queryFn: () => ProgressAPI.getWaterProgress(timeRange),
  })

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-full relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white">Hidratação Média</h3>
        <p className="text-sm text-zinc-400">Água consumida vs. Meta (Litros)</p>
      </div>
      
      <div className="flex-1 min-h-[300px] relative z-10">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-xl bg-zinc-900/50" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-zinc-500 text-sm">Nenhum consumo de água registrado.</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              amount: { label: "Consumido", color: "#0ea5e9" },
            }}
            className="h-full w-full animate-in fade-in duration-500"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={data[0]?.goal || 2000} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Meta', fill: '#10b981', fontSize: 12 }} />
                <Bar 
                  dataKey="amount" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount >= entry.goal ? "#10b981" : "#0ea5e9"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
