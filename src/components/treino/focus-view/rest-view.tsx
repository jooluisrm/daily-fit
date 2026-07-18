import { CheckCircle2, History, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatTime } from "./utils/workout-utils"

interface RestViewProps {
  addTime: (time: number) => void
  restTimeLeft: number
  restTimeGoal: number
  isHistoryMode: boolean
  historyLog: any | null
  handleRestFinished: () => void
  autoAdvanceTimeLeft: number
  isPerSide: boolean
}

export function RestView({
  addTime,
  restTimeLeft,
  restTimeGoal,
  isHistoryMode,
  historyLog,
  handleRestFinished,
  autoAdvanceTimeLeft,
  isPerSide
}: RestViewProps) {
  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => addTime(-15)} 
          className={cn(
            "w-14 h-14 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-lg shrink-0 transition-opacity duration-300",
            restTimeLeft === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <span className="text-sm font-bold">-15s</span>
        </Button>

        <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-900/50 backdrop-blur-md shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-zinc-800" />
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className={cn("transition-all duration-1000 ease-linear", restTimeLeft === 0 ? "text-emerald-500" : (isHistoryMode ? "text-amber-500" : "text-primary"))} strokeDasharray="553" strokeDashoffset={restTimeLeft === 0 ? 0 : 553 - (553 * Math.min(restTimeLeft, restTimeGoal)) / restTimeGoal} strokeLinecap="round" transform="rotate(-90 96 96)" />
          </svg>
          {restTimeLeft === 0 ? (
            <CheckCircle2 className="w-20 h-20 text-emerald-500 animate-in zoom-in duration-500" />
          ) : (
            <>
              <span className="text-5xl font-mono font-bold text-white mb-2">{formatTime(restTimeLeft)}</span>
              <span className="text-zinc-400 text-sm uppercase tracking-widest font-semibold">Descanso</span>
            </>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => addTime(15)} 
          className={cn(
            "w-14 h-14 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-lg shrink-0 transition-opacity duration-300",
            restTimeLeft === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <span className="text-sm font-bold">+15s</span>
        </Button>
      </div>
      <div className={cn(
        "flex flex-col gap-2 mt-8 w-full max-w-xs items-center transition-all duration-300",
        restTimeLeft === 0 && "opacity-0 pointer-events-none h-0 mt-0 overflow-hidden"
      )}>
        {historyLog ? (
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 w-full flex flex-col items-center justify-center gap-1 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <History className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold">Treino Passado</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black text-white flex items-center">
                {isPerSide ? historyLog.weight / 2 : historyLog.weight}
                <span className="text-lg text-zinc-500 font-bold mx-1">kg</span> 
                <span className="text-zinc-600 mx-2">×</span> 
                {historyLog.repsDone}
                <span className="text-lg text-zinc-500 font-bold mx-1">reps</span>
              </div>
              {isPerSide && <span className="text-[10px] text-zinc-500 font-sans uppercase tracking-widest bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/50 mt-1">cada lado</span>}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 w-full flex flex-col items-center justify-center gap-2 shadow-sm backdrop-blur-md opacity-70">
            <History className="w-5 h-5 text-zinc-600" />
            <span className="text-sm font-medium text-zinc-500 text-center">Nenhum histórico para esta série</span>
          </div>
        )}
      </div>
      {restTimeLeft === 0 ? (
        <Button 
          onClick={handleRestFinished} 
          className="w-full h-16 mt-8 relative overflow-hidden group bg-emerald-600 text-white hover:bg-emerald-500 text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 border-2 border-transparent hover:border-emerald-400"
        >
          <div 
            className="absolute bottom-0 left-0 h-1.5 bg-white/40 transition-all duration-1000 ease-linear"
            style={{ width: `${(autoAdvanceTimeLeft / 10) * 100}%` }}
          />
          <span className="relative z-10 flex items-center justify-center w-full">
            <CheckCircle2 className="w-6 h-6 mr-3" />
            Continuar Treino
            <span className="ml-3 px-2.5 py-1 bg-black/20 rounded-lg text-sm font-mono tracking-widest">
              {autoAdvanceTimeLeft}s
            </span>
          </span>
        </Button>
      ) : (
        <Button variant="ghost" onClick={handleRestFinished} className="mt-6 text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all duration-300">
          <SkipForward className="w-4 h-4 mr-2" />Pular Descanso
        </Button>
      )}
    </div>
  )
}
