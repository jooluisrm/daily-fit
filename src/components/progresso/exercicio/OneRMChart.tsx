"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type ChartData = { date: string, oneRM: number }[];

export function OneRMChart({ data, weightType = "TOTAL" }: { data: ChartData, weightType?: string }) {
  const isPerSide = weightType === "PER_SIDE";
  const labelSuffix = isPerSide ? "(kg c/ lado)" : "(kg)";

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-[350px] relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white">Força Estimada (1RM)</h3>
        <p className="text-sm text-zinc-400">Carga máxima teórica para 1 repetição {labelSuffix}</p>
      </div>
      <div className="flex-1">
        <ChartContainer config={{ oneRM: { label: `1RM ${labelSuffix}`, color: "#f43f5e" } }} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="oneRM" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
