"use client"

import Link from "next/link"
import { TrendingUp, History, Zap } from "lucide-react"

export function ProgressCtaCard() {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm relative overflow-hidden transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
        <div className="p-3 bg-zinc-800/80 rounded-xl text-zinc-400">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-bold text-white">Acesso Rápido</h3>
          <p className="text-sm text-zinc-400 mt-1">Navegue rapidamente pelas telas.</p>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
        <Link 
          href="/treino/historico"
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 text-zinc-300 font-medium bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-xl transition-colors border border-zinc-700/50"
        >
          <History className="w-4 h-4" />
          Histórico
        </Link>
        <Link 
          href="/progresso"
          className="group flex flex-1 sm:flex-none items-center justify-center gap-2 text-primary font-medium bg-primary/10 hover:bg-primary/20 px-5 py-2.5 rounded-xl transition-colors border border-primary/20 hover:border-primary/40"
        >
          <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Ver Progresso
        </Link>
      </div>
    </div>
  )
}
