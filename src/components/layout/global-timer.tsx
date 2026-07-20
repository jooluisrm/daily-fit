"use client"
import { Timer, CheckCircle2, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

import { useEffect, useRef } from "react"
import { useTimerStore } from "@/src/store/use-timer-store"
import { useCardioTimerStore } from "@/src/store/use-cardio-timer-store"
import { playBeep } from "@/src/lib/audio"
import { sendPushNotification } from "@/src/lib/notifications"
import { usePathname, useRouter } from "next/navigation"

export function GlobalTimer() {
  const { isResting, restTimeLeft, tick } = useTimerStore()
  const { isCardioActive, cardioElapsedSeconds, cardioTargetSeconds, cardioType, tickCardio } = useCardioTimerStore()
  
  const pathname = usePathname()
  const router = useRouter()
  
  const hasBeeped = useRef(false)
  const cardioHasBeeped = useRef(false)
  const wakeLockRef = useRef<any>(null)

  const isAnyTimerActive = isResting || isCardioActive

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAnyTimerActive) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAnyTimerActive])

  useEffect(() => {
    if (isAnyTimerActive) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
    return () => { releaseWakeLock() }
  }, [isAnyTimerActive])

  // Rest Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isResting) {
      interval = setInterval(() => tick(), 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isResting, tick])

  // Cardio Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isCardioActive) {
      interval = setInterval(() => tickCardio(), 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isCardioActive, tickCardio])

  // Rest Timer Beep
  useEffect(() => {
    if (isResting && restTimeLeft === 0 && !hasBeeped.current) {
      playBeep()
      sendPushNotification('Descanso Finalizado!', 'Prepare-se para a próxima série.')
      hasBeeped.current = true
    } else if (restTimeLeft > 0) {
      hasBeeped.current = false
    }
  }, [isResting, restTimeLeft])

  // Cardio Timer Beep
  useEffect(() => {
    if (isCardioActive && cardioTargetSeconds > 0 && cardioElapsedSeconds >= cardioTargetSeconds && !cardioHasBeeped.current) {
      playBeep()
      sendPushNotification('Cardio Finalizado!', 'Você atingiu sua meta de tempo.')
      cardioHasBeeped.current = true
    } else if (isCardioActive && (cardioTargetSeconds === 0 || cardioElapsedSeconds < cardioTargetSeconds)) {
      cardioHasBeeped.current = false
    }
  }, [isCardioActive, cardioElapsedSeconds, cardioTargetSeconds])

  const savedMode = typeof window !== 'undefined' ? localStorage.getItem('daily-fit-view-mode') : 'list'
  
  const shouldHideRestUI = !isResting || (pathname === "/treino" && savedMode === 'focus')
  const shouldHideCardioUI = !isCardioActive || (pathname === "/treino" && savedMode === 'focus')

  const isRestFinished = restTimeLeft <= 0
  const isCardioFinished = cardioTargetSeconds > 0 && cardioElapsedSeconds >= cardioTargetSeconds

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClick = () => {
    localStorage.setItem('daily-fit-view-mode', 'focus')
    window.dispatchEvent(new Event('view-mode-changed'))
    router.push('/treino')
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-3">
      {!shouldHideCardioUI && (
        <div 
          onClick={handleClick}
          className={cn(
            "rounded-2xl shadow-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 animate-in slide-in-from-bottom-8",
            isCardioFinished 
              ? "bg-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
              : "bg-zinc-900 border border-primary text-white shadow-[0_0_30px_rgba(var(--primary),0.2)]"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isCardioFinished ? "bg-white/20" : "bg-primary/20 text-primary"
          )}>
            {isCardioFinished ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="font-bold text-lg leading-none">
              {formatTime(cardioElapsedSeconds)}
              {cardioTargetSeconds > 0 && <span className="text-sm font-normal ml-1 opacity-70">/ {formatTime(cardioTargetSeconds)}</span>}
            </div>
            <div className={cn("text-xs font-medium uppercase tracking-wider mt-1", isCardioFinished ? "text-emerald-100" : "text-zinc-400")}>
              {isCardioFinished ? "Cardio Finalizado" : cardioType}
            </div>
          </div>
        </div>
      )}

      {!shouldHideRestUI && (
        <div 
          onClick={handleClick}
          className={cn(
            "rounded-2xl shadow-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 animate-in slide-in-from-bottom-8",
            isRestFinished 
              ? "bg-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
              : "bg-zinc-900 border border-primary text-white shadow-[0_0_30px_rgba(var(--primary),0.2)]"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isRestFinished ? "bg-white/20" : "bg-primary/20 text-primary"
          )}>
            {isRestFinished ? <CheckCircle2 className="w-5 h-5" /> : <Timer className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="font-bold text-lg leading-none">
              {isRestFinished ? "Finalizado!" : formatTime(restTimeLeft)}
            </div>
            <div className={cn("text-xs font-medium uppercase tracking-wider mt-1", isRestFinished ? "text-emerald-100" : "text-zinc-400")}>
              {isRestFinished ? "Voltar ao treino" : "Descanso"}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
