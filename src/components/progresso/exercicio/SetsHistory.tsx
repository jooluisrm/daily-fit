"use client"

import { Dumbbell } from "lucide-react"

type SessionData = {
  date: string;
  sets: { reps: number; weight: number }[];
};

export function SetsHistory({ sessions, weightType = "TOTAL" }: { sessions: SessionData[], weightType?: string }) {
  const isPerSide = weightType === "PER_SIDE";

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white">Histórico de Séries</h3>
        <p className="text-sm text-zinc-400">Detalhes de carga e repetições das últimas sessões</p>
      </div>
      
      <div className="flex flex-col gap-4 relative z-10">
        {sessions.map((session, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
            <div className="font-medium text-primary min-w-[120px]">{session.date}</div>
            
            <div className="flex flex-wrap gap-2 flex-1">
              {session.sets.map((set, j) => (
                <div key={j} className="flex flex-col items-center justify-center bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 min-w-[70px]">
                  <span className="text-xs text-zinc-500 mb-1">Série {j + 1}</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-white">
                    {isPerSide ? set.weight / 2 : set.weight}
                    <span className="text-xs font-normal text-zinc-400">{isPerSide ? "kg c/l" : "kg"}</span>
                    <span className="text-zinc-500 font-normal mx-0.5">x</span> 
                    {set.reps}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
