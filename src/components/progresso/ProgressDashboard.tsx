"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Dumbbell } from "lucide-react"
import { WorkoutChart } from "./WorkoutChart"
import { CardioChart } from "./CardioChart"
import { HydrationChart } from "./HydrationChart"

export function ProgressDashboard() {
  const [timeRange, setTimeRange] = useState("30d")

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <Link href="/progresso/treino" className="flex items-center justify-center gap-2 w-full p-4 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-primary/50 rounded-2xl transition-all text-zinc-300 hover:text-primary font-medium group">
        <Dumbbell className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        Analisar Treinos Específicos
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
        <div>
          <h1 className="text-2xl font-bold text-white">Seu Progresso</h1>
          <p className="text-sm text-zinc-400">Acompanhe sua evolução ao longo do tempo</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <WorkoutChart timeRange={timeRange} />
        </div>
        <CardioChart timeRange={timeRange} />
        <div className="lg:col-span-2">
          <HydrationChart timeRange={timeRange} />
        </div>
      </div>
    </div>
  )
}
