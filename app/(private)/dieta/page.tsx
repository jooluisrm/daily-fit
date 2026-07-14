"use client"

import { Construction, UtensilsCrossed } from "lucide-react"

export default function DietaPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-primary to-orange-500 rounded-full blur-md opacity-20 animate-pulse"></div>
        <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-full shadow-2xl">
          <UtensilsCrossed className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h1 className="mt-8 text-3xl font-bold text-white tracking-tight">Módulo de Dieta</h1>
      
      <div className="mt-4 flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full text-zinc-400">
        <Construction className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-400/80">Em Desenvolvimento</span>
      </div>

      <p className="mt-6 text-center text-zinc-400 max-w-sm leading-relaxed">
        Estamos preparando um sistema completo para você acompanhar suas calorias, macros e montar suas refeições diárias.
        <br/><br/>
        <span className="text-zinc-500">Fique ligado, teremos novidades em breve!</span>
      </p>
    </div>
  )
}
