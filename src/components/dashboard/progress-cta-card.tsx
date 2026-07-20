"use client"

import Link from "next/link"
import { TrendingUp, ArrowRight } from "lucide-react"

export function ProgressCtaCard() {
  return (
    <Link href="/progresso" className="block w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 hover:border-primary/60 shadow-sm relative overflow-hidden group transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-primary/20" />
        
        <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
          <div className="p-3 bg-primary/20 rounded-full text-primary group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">Acompanhe sua Evolução</h3>
            <p className="text-sm text-zinc-400 mt-1">Veja seus gráficos de treino, cardio e hidratação.</p>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-2 text-primary font-medium group-hover:text-primary transition-colors bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full w-full sm:w-auto justify-center">
          Ver Progresso
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
