"use client"

import { useEffect } from "react"
import { useTimerStore } from "@/src/store/use-timer-store"
import { usePathname, useRouter } from "next/navigation"
import { Timer, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function GlobalTimer() {
  const { isResting, restTimeLeft, tick, stopTimer } = useTimerStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isResting) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isResting, tick])

  // Se não estiver descansando, não exibe nada
  if (!isResting) return null

  // Se o usuário estiver na tela de treino, o cronômetro grande do Modo Foco já vai estar cuidando disso
  // (Ocultamos o mini-player para não duplicar visualmente na mesma tela)
  if (pathname === "/treino") {
    // No entanto, é importante saber se o usuário está de fato no modo foco.
    // Como a preferência é do localStorage, vamos checar lá e apenas ocultar se estiver no foco.
    // Mas para simplificar: se ele tá na tela de treino, o mini player pode não aparecer pra não poluir.
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('daily-fit-view-mode') : 'list'
    if (savedMode === 'focus') {
      return null
    }
  }

  const isFinished = restTimeLeft <= 0

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClick = () => {
    // Garantir que vá para o modo foco
    localStorage.setItem('daily-fit-view-mode', 'focus')
    router.push('/treino')
  }

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "fixed bottom-20 md:bottom-6 right-4 z-50 rounded-2xl shadow-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 animate-in slide-in-from-bottom-8",
        isFinished 
          ? "bg-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
          : "bg-zinc-900 border border-primary text-white shadow-[0_0_30px_rgba(var(--primary),0.2)]"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center",
        isFinished ? "bg-white/20" : "bg-primary/20 text-primary"
      )}>
        {isFinished ? <CheckCircle2 className="w-5 h-5" /> : <Timer className="w-5 h-5 animate-pulse" />}
      </div>
      <div>
        <div className="font-bold text-lg leading-none">
          {isFinished ? "Finalizado!" : formatTime(restTimeLeft)}
        </div>
        <div className={cn("text-xs font-medium uppercase tracking-wider mt-1", isFinished ? "text-emerald-100" : "text-zinc-400")}>
          {isFinished ? "Voltar ao treino" : "Descanso"}
        </div>
      </div>
    </div>
  )
}
