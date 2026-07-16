"use client"
import { Timer, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { useEffect, useState, useRef } from "react"
import { useTimerStore } from "@/src/store/use-timer-store"
import { playBeep } from "@/src/lib/audio"
import { sendPushNotification } from "@/src/lib/notifications"
import { usePathname, useRouter } from "next/navigation"
export function GlobalTimer() {
  const { isResting, restTimeLeft, tick, stopTimer } = useTimerStore()
  const pathname = usePathname()
  const router = useRouter()
  
  // Ref para controlar se já tocou o som nesta contagem
  const hasBeeped = useRef(false)
  const wakeLockRef = useRef<any>(null)

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
      }
    } catch (err) {
      console.warn('Wake Lock error:', err)
    }
  }

  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) {
      await wakeLockRef.current.release().catch(() => {})
      wakeLockRef.current = null
    }
  }

  // Re-solicitar o wake lock se o app voltar a ficar visível
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isResting) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isResting])

  // Controle do Wake Lock baseado no estado isResting
  useEffect(() => {
    if (isResting) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
    
    return () => {
      releaseWakeLock()
    }
  }, [isResting])

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



  // Efeito para tocar o som quando chegar a 0
  useEffect(() => {
    if (isResting && restTimeLeft === 0 && !hasBeeped.current) {
      playBeep()
      sendPushNotification('Descanso Finalizado!', 'Prepare-se para a próxima série.')
      hasBeeped.current = true
    } else if (restTimeLeft > 0) {
      hasBeeped.current = false
    }
  }, [isResting, restTimeLeft])

  let shouldHideUI = false;
  if (!isResting) {
    shouldHideUI = true;
  } else if (pathname === "/treino") {
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('daily-fit-view-mode') : 'list'
    if (savedMode === 'focus') {
      shouldHideUI = true;
    }
  }

  const isFinished = restTimeLeft <= 0

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClick = () => {
    localStorage.setItem('daily-fit-view-mode', 'focus')
    router.push('/treino')
  }

  return (
    <>
      
      {!shouldHideUI && (
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
      )}
    </>
  )
}
