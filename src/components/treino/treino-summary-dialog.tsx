import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Activity, CheckCircle2, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

interface TreinoSummaryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  progressPercent: number
  activeExercises: any[]
  currentIndex: number
  currentSet: number
  isViewingHistory: boolean
  checkIsSetCompleted: (exerciseIndex: number, setNum: number) => boolean
  onNavigate: (index: number, set: number, isFullyDone: boolean) => void
}

export function TreinoSummaryDialog({
  isOpen,
  onOpenChange,
  progressPercent,
  activeExercises,
  currentIndex,
  currentSet,
  isViewingHistory,
  checkIsSetCompleted,
  onNavigate
}: TreinoSummaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl p-6 shadow-2xl max-w-md w-[95%] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Resumo do Treino
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Progresso atual: <strong className="text-white">{Math.round(progressPercent)}% concluído</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3 custom-scrollbar">
          {activeExercises.map((ex, idx) => {
            const isCurrent = idx === currentIndex
            let doneSets = 0
            const setsStatus = Array.from({ length: ex.sets }).map((_, i) => {
              const isDone = checkIsSetCompleted(idx, i + 1)
              if (isDone) doneSets++
              return isDone
            })

            const isFullyDone = doneSets === ex.sets

            return (
              <button
                key={ex.id}
                onClick={() => {
                  const firstPending = setsStatus.findIndex(s => !s)
                  const targetSet = firstPending === -1 ? ex.sets : firstPending + 1
                  
                  onNavigate(idx, targetSet, isFullyDone)
                }}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-3 group",
                  isCurrent ? "bg-primary/10 border-primary ring-1 ring-primary" : 
                  isFullyDone ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" : 
                  "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ex.exercise.imageUrl ? (
                      <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-12 h-12 rounded-xl object-cover bg-zinc-800" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-zinc-500" />
                      </div>
                    )}
                    <div>
                      <h4 className={cn("font-bold text-base transition-colors", isFullyDone ? "text-emerald-400 group-hover:text-emerald-300" : isCurrent ? "text-primary group-hover:text-primary" : "text-zinc-200 group-hover:text-white")}>
                        {ex.exercise.name}
                      </h4>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">{ex.sets} séries</p>
                    </div>
                  </div>
                  {isFullyDone && (
                    <div className="bg-emerald-500/20 p-2 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1.5 ml-[60px]">
                  {setsStatus.map((isDone, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 h-1.5 rounded-full transition-colors",
                        isDone ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : 
                        (isCurrent && i === currentSet - 1) ? "bg-primary/50 animate-pulse" : "bg-zinc-800"
                      )} 
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <DialogFooter className="mt-4 pt-4 border-t border-zinc-900">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-14 text-base font-bold border border-zinc-800"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
