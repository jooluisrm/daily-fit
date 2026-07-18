import { Minimize2, CheckCircle2, Dumbbell, AlertTriangle, Trophy, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface TopBarProps {
  onClose: () => void
  steps: any[]
  currentIndex: number
  checkIsSetCompleted: (exerciseIndex: number, setNum: number) => boolean
  setCurrentIndex: (idx: number) => void
  setCurrentSet: (setNum: number) => void
  setIsViewingHistory: (viewing: boolean) => void
  setIsSummaryModalOpen: (open: boolean) => void
  progressPercent: number
  isHistoryMode: boolean
  isRestFinished: boolean
}

export function TopBar({
  onClose,
  steps,
  currentIndex,
  checkIsSetCompleted,
  setCurrentIndex,
  setCurrentSet,
  setIsViewingHistory,
  setIsSummaryModalOpen,
  progressPercent,
  isHistoryMode,
  isRestFinished
}: TopBarProps) {
  const numExercises = steps.filter(s => s.type === 'EXERCISE').length
  const isPostWorkout = currentIndex >= numExercises

  return (
    <div className="relative z-50 flex justify-between items-center w-full px-4 mb-2">
      {/* Minimize Button */}
      <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full h-12 w-12 shrink-0">
        <Minimize2 className="w-5 h-5" />
      </Button>

      {/* Exercises Timeline */}
      <div className="flex gap-2 items-center bg-zinc-900/60 backdrop-blur-md p-1.5 rounded-full border border-zinc-800/80 overflow-x-auto max-w-full no-scrollbar mx-2">
        <AnimatePresence mode="popLayout">
          {/* Merged Exercises Bubble (Only visible in Post Workout) */}
          {isPostWorkout && (
            <motion.div
              layout
              key="merged-exercises"
              initial={{ opacity: 0, scale: 0.5, width: 0, marginRight: 0 }}
              animate={{ opacity: 1, scale: 1, width: 40, marginRight: 8 }}
              exit={{ opacity: 0, scale: 0.5, width: 0, marginRight: 0 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
              onClick={() => {
                setCurrentIndex(numExercises - 1)
              }}
              className="relative rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer bg-zinc-800 h-10 opacity-50 hover:opacity-80 transition-colors"
            >
              <div className="absolute inset-0 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )}

          {steps.map((step, idx) => {
            const isPast = idx < currentIndex
            const isCurrent = idx === currentIndex

            if (step.type === 'EXERCISE') {
              if (isPostWorkout) return null // Hide individual exercises in post workout

              const ex = step.ex
              return (
                <motion.div
                  layout
                  key={ex.id}
                  initial={{ opacity: 0, scale: 0.8, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: isCurrent ? 48 : 40 }}
                  exit={{ opacity: 0, scale: 0.5, width: 0, padding: 0, margin: 0 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
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
                    "relative rounded-full flex-shrink-0 transition-colors duration-300 flex items-center justify-center overflow-hidden cursor-pointer",
                    isCurrent ? "h-12 ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 opacity-100 shadow-[0_0_15px_rgba(var(--primary),0.4)] z-10" : "h-10 opacity-50 grayscale hover:opacity-80 bg-zinc-800"
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
                    <div className="absolute inset-0 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              )
            }

            // Post Workout Steps (Pending, Completed, Cardio)
            if (!isPostWorkout) return null // Hide them while training!

            let Icon = CheckCircle2
            let iconColor = "text-zinc-500"
            let ringColor = "ring-zinc-500"
            
            if (step.type === 'PENDING') {
              Icon = AlertTriangle
              if (isCurrent) { iconColor = "text-amber-500"; ringColor = "ring-amber-500" }
            } else if (step.type === 'COMPLETED') {
              Icon = Trophy
              if (isCurrent) { iconColor = "text-primary"; ringColor = "ring-primary" }
            } else if (step.type === 'CARDIO') {
              Icon = Activity
              if (isCurrent) { iconColor = "text-primary"; ringColor = "ring-primary" }
            }

            return (
              <motion.div
                layout
                key={step.type}
                initial={{ opacity: 0, scale: 0.5, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, scale: 1, width: isCurrent ? 48 : 40, marginLeft: 8 }}
                exit={{ opacity: 0, scale: 0.5, width: 0, marginLeft: 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                onClick={() => {
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "relative rounded-full flex-shrink-0 transition-colors duration-300 flex items-center justify-center overflow-hidden cursor-pointer bg-zinc-800",
                  isCurrent ? `h-12 ring-2 ${ringColor} ring-offset-2 ring-offset-zinc-950 opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.1)] z-10` : "h-10 opacity-50 hover:opacity-80"
                )}
              >
                <Icon className={cn("w-5 h-5", isCurrent && iconColor)} />
                {isPast && (
                  <div className="absolute inset-0 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
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
              isRestFinished ? "text-emerald-500" : progressPercent < 34 ? "text-red-500" : progressPercent < 67 ? "text-amber-500" : "text-emerald-500"
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
