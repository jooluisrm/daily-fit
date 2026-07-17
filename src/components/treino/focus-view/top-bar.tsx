import { Minimize2, CheckCircle2, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopBarProps {
  onClose: () => void
  activeExercises: any[]
  currentIndex: number
  checkIsSetCompleted: (exerciseIndex: number, setNum: number) => boolean
  setCurrentIndex: (idx: number) => void
  setCurrentSet: (setNum: number) => void
  setIsViewingHistory: (viewing: boolean) => void
  setIsSummaryModalOpen: (open: boolean) => void
  progressPercent: number
  isHistoryMode: boolean
}

export function TopBar({
  onClose,
  activeExercises,
  currentIndex,
  checkIsSetCompleted,
  setCurrentIndex,
  setCurrentSet,
  setIsViewingHistory,
  setIsSummaryModalOpen,
  progressPercent,
  isHistoryMode
}: TopBarProps) {
  return (
    <div className="relative z-50 flex justify-between items-center w-full px-4 mb-2">
      {/* Minimize Button */}
      <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full h-12 w-12 shrink-0">
        <Minimize2 className="w-5 h-5" />
      </Button>

      {/* Exercises Timeline */}
      <div className="flex gap-2 items-center bg-zinc-900/60 backdrop-blur-md p-1.5 rounded-full border border-zinc-800/80 overflow-x-auto max-w-full no-scrollbar mx-2">
        {activeExercises.map((ex, idx) => {
          const isPast = idx < currentIndex
          const isCurrent = idx === currentIndex

          return (
            <div
              key={ex.id}
              onClick={() => {
                let targetSet = 1;
                let allCompleted = true;
                for (let s = 1; s <= ex.sets; s++) {
                  if (!checkIsSetCompleted(idx, s)) {
                    targetSet = s;
                    allCompleted = false;
                    break;
                  }
                }
                if (allCompleted) {
                  targetSet = ex.sets;
                }
                setCurrentIndex(idx);
                setCurrentSet(targetSet);
                setIsViewingHistory(allCompleted);
              }}
              className={cn(
                "relative rounded-full flex-shrink-0 transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer",
                isCurrent ? "w-12 h-12 ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 opacity-100 shadow-[0_0_15px_rgba(var(--primary),0.4)] z-10" : "w-10 h-10 opacity-50 grayscale hover:opacity-80 bg-zinc-800"
              )}
            >
              {ex.exercise.imageUrl ? (
                <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Dumbbell className={isCurrent ? (isHistoryMode ? "w-6 h-6 text-amber-500" : "w-6 h-6 text-primary") : "w-5 h-5 text-zinc-500"} />
                </div>
              )}
              {isPast && (
                <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Circular Progress Button */}
      <button 
        onClick={() => setIsSummaryModalOpen(true)}
        className="relative w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 transition-all hover:bg-zinc-800 active:scale-95 shrink-0"
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-zinc-800/50" />
          <circle 
            cx="24" cy="24" r="20" 
            stroke="currentColor" 
            strokeWidth="3" 
            fill="none" 
            className={cn(
              "transition-all duration-1000 ease-out", 
              progressPercent < 34 ? "text-red-500" : progressPercent < 67 ? "text-amber-500" : "text-emerald-500"
            )} 
            strokeDasharray="126" 
            strokeDashoffset={126 - (126 * progressPercent) / 100} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="relative z-10 flex items-center justify-center">
          {progressPercent >= 100 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <span className="text-[11px] font-bold text-white">{Math.round(progressPercent)}%</span>
          )}
        </div>
      </button>
    </div>
  )
}
