import { useState, useEffect } from "react"
import { Play, Square, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCardioTimerStore } from "@/src/store/use-cardio-timer-store"

interface CardioActiveProps {
  cardioType: string
  setCardioType: (type: string) => void
  cardioTime: string
  setCardioTime: (time: string) => void
  onFinishCardioTimer: (elapsedMinutes: number) => void
  handleSkipCardio: () => void
  todayCardio: any
  onStartCardio: () => void
  isStartingCardio: boolean
  
  cardioIntensity?: string
  setCardioIntensity?: (int: string) => void
  handleFinishCardioWithSave?: (elapsedMinutes: number) => void
  isSavingCardio?: boolean
  isUpdatingStatus?: boolean
}

export function CardioActive({
  cardioType,
  setCardioType,
  cardioTime,
  setCardioTime,
  onFinishCardioTimer,
  handleSkipCardio,
  todayCardio,
  onStartCardio,
  isStartingCardio,
  
  cardioIntensity = 'moderado',
  setCardioIntensity,
  handleFinishCardioWithSave,
  isSavingCardio = false,
  isUpdatingStatus = false
}: CardioActiveProps) {
  const { 
    isCardioActive: isRunning, 
    cardioElapsedSeconds: elapsedSeconds, 
    cardioTargetSeconds,
    cardioType: globalCardioType,
    startCardioTimer,
    stopCardioTimer
  } = useCardioTimerStore()

  const [showIntensity, setShowIntensity] = useState(false)

  const targetSeconds = isRunning ? cardioTargetSeconds : Number(cardioTime) * 60
  const displayCardioType = isRunning ? globalCardioType : cardioType

  useEffect(() => {
    if (todayCardio && todayCardio.status === 'IN_PROGRESS') {
      if (todayCardio.type) setCardioType(todayCardio.type)
      if (todayCardio.targetDuration) setCardioTime(String(todayCardio.targetDuration))
    }
  }, [todayCardio, setCardioType, setCardioTime])

  const handleStart = () => {
    onStartCardio()
    startCardioTimer(targetSeconds, cardioType)
  }

  const handleStopClick = () => {
    setShowIntensity(true)
  }

  const handleFinalFinish = () => {
    const elapsedMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60))
    stopCardioTimer()
    if (handleFinishCardioWithSave) {
      handleFinishCardioWithSave(elapsedMinutes)
    } else {
      onFinishCardioTimer(elapsedMinutes)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isTargetReached = isRunning && targetSeconds > 0 && elapsedSeconds >= targetSeconds

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">

      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-y-auto no-scrollbar">

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight">Sessão de <span className="text-primary">Cardio</span></h2>

          <div className="w-full space-y-6">
            
            {!isRunning ? (
              <>
                <div className="space-y-2">
                  <Label className="text-zinc-300 uppercase tracking-widest text-[10px] font-bold">Aparelho</Label>
                  <div className="flex gap-2">
                    {['Esteira', 'Bike', 'Escada'].map((type) => (
                      <Button
                        key={type}
                        variant="ghost"
                        onClick={() => setCardioType(type)}
                        className={`flex-1 h-12 text-sm font-semibold rounded-xl transition-all border ${cardioType === type ? "bg-primary text-white border-primary shadow-sm" : "bg-zinc-900/50 border-zinc-800 text-zinc-400"}`}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardio-time" className="text-zinc-300 uppercase tracking-widest text-[10px] font-bold">Tempo (minutos)</Label>
                  <Input
                    id="cardio-time"
                    type="number"
                    placeholder="Ex: 15"
                    value={cardioTime}
                    onChange={(e) => setCardioTime(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-14 text-xl text-center font-black rounded-xl shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    onClick={handleStart}
                    disabled={!cardioTime || Number(cardioTime) <= 0 || isStartingCardio}
                    className="w-full h-14 text-base font-bold shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 text-white rounded-xl transition-all hover:scale-[1.02]"
                  >
                    {isStartingCardio ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" fill="currentColor" />}
                    Iniciar Cardio
                  </Button>

                  <Button
                    onClick={handleSkipCardio}
                    variant="ghost"
                    className="w-full text-zinc-500 hover:text-zinc-300 h-10 text-sm rounded-lg border border-transparent"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 space-y-8 animate-in zoom-in duration-300">
                <div className="flex flex-col items-center">
                  <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">{displayCardioType}</span>
                  <div className={cn(
                    "w-48 h-48 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-900/50 backdrop-blur-md shrink-0 transition-colors duration-500",
                    isTargetReached && "bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  )}>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-zinc-800" />
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="88" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="none" 
                        className={cn("transition-all duration-1000 ease-linear", isTargetReached ? "text-emerald-500" : "text-primary")} 
                        strokeDasharray="553" 
                        strokeDashoffset={targetSeconds > 0 ? 553 - (553 * Math.min(elapsedSeconds, targetSeconds)) / targetSeconds : 553} 
                        strokeLinecap="round" 
                        transform="rotate(-90 96 96)" 
                      />
                    </svg>
                    <span className={cn("text-5xl font-mono font-bold tracking-tight relative z-10", isTargetReached ? "text-emerald-500" : "text-white")}>
                      {formatTime(elapsedSeconds)}
                    </span>
                    <span className="text-zinc-500 text-xs font-semibold uppercase mt-1 relative z-10">
                      / {formatTime(targetSeconds)}
                    </span>
                  </div>
                </div>
                
                {!showIntensity ? (
                  <Button
                    onClick={handleStopClick}
                    className={cn(
                      "w-full h-14 text-base font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]",
                      isTargetReached 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border-transparent" 
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    )}
                  >
                    <Square className="w-5 h-5 mr-2" fill="currentColor" />
                    Finalizar Cardio
                  </Button>
                ) : (
                  <div className="w-full space-y-4 animate-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 uppercase tracking-widest text-[10px] font-bold text-center block">Intensidade</Label>
                      <div className="flex gap-2">
                        {['leve', 'moderado', 'intenso'].map((int) => (
                          <Button
                            key={int}
                            variant="ghost"
                            onClick={() => setCardioIntensity?.(int)}
                            className={cn(
                              "flex-1 h-12 text-sm font-bold rounded-xl transition-all border",
                              cardioIntensity === int 
                                ? (isTargetReached 
                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]" 
                                    : "bg-primary text-white border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-[1.02]")
                                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                            )}
                          >
                            {int.charAt(0).toUpperCase() + int.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleFinalFinish}
                      disabled={isSavingCardio || isUpdatingStatus}
                      className={cn(
                        "w-full h-14 text-base font-black text-white rounded-xl transition-all hover:scale-[1.02]",
                        isTargetReached
                          ? "shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-600 hover:bg-emerald-500"
                          : "shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90"
                      )}
                    >
                      {(isSavingCardio || isUpdatingStatus) ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                      Finalizar Treino
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
