"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type ChartData = { date: string, volume: number }[];

export function VolumeChart({ data }: { data: ChartData }) {

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-[350px] relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white">Volume Total do Exercício</h3>
        <p className="text-sm text-zinc-400">Peso x Repetições x Séries (kg)</p>
      </div>
      <div className="flex-1">
        <ChartContainer config={{ volume: { label: "Volume (kg)", color: "#10b981" } }} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fill="url(#colorVolume)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
