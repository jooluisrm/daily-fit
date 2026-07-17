import { Dumbbell, ChevronRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PendingPromptProps {
  pendingExercisesList: any[]
  setCurrentIndex: (idx: number) => void
  setCurrentSet: (setNum: number) => void
  setPhase: (phase: 'EXERCISES' | 'PENDING_PROMPT' | 'CARDIO_PROMPT' | 'CARDIO_ACTIVE') => void
  setIsViewingHistory: (viewing: boolean) => void
}

export function PendingPrompt({
  pendingExercisesList,
  setCurrentIndex,
  setCurrentSet,
  setPhase,
  setIsViewingHistory
}: PendingPromptProps) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
        <div className="h-full bg-amber-500 w-full" />
      </div>
      <div className="flex-1 flex flex-col items-center py-12 px-6 overflow-y-auto relative no-scrollbar">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50 z-0"></div>

        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 relative z-10" />
        <h2 className="text-3xl font-black text-white mb-2 relative z-10 text-center tracking-tight">Você pulou exercícios! 👀</h2>
        <p className="text-zinc-400 mb-8 max-w-md relative z-10 text-center text-lg">
          Tem certeza que deseja finalizar a musculação? Você deixou as seguintes séries para trás:
        </p>

        <div className="w-full max-w-md space-y-3 relative z-10 mb-8">
          {pendingExercisesList.map(item => {
            const { ex, index: exIndex } = item
            return (
              <div
                key={ex.id}
                onClick={() => {
                  setCurrentIndex(exIndex)
                  setCurrentSet(item.pendingSets[0])
                  setPhase('EXERCISES')
                  setIsViewingHistory(false)
                }}
                className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-lg group"
              >
                {ex.exercise.imageUrl ? (
                  <img src={ex.exercise.imageUrl} alt={ex.exercise.name} className="w-16 h-16 rounded-xl object-cover bg-zinc-800" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Dumbbell className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-base truncate pr-4 group-hover:text-amber-400 transition-colors">{ex.exercise.name}</h4>
                  <div className="flex items-center gap-1.5 mt-2">
                    {Array.from({ length: ex.sets }).map((_, i) => {
                      const s = i + 1
                      const isSetCompleted = !item.pendingSets.includes(s)
                      return (
                        <div
                          key={s}
                          className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            isSetCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-700"
                          )}
                        />
                      )
                    })}
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              </div>
            )
          })}
        </div>

        <div className="w-full max-w-md relative z-10 flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => setPhase('CARDIO_PROMPT')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white shadow-md py-6 text-base font-bold rounded-xl"
          >
            Ignorar Tudo e Ir pro Cardio
          </Button>
        </div>
      </div>
    </div>
  )
}
