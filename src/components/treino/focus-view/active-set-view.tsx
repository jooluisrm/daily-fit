import { Minus, Plus, NotebookIcon, History, AlertTriangle, Loader2, Save, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ActiveSetViewProps {
  currentExercise: any
  currentIndex: number
  currentSet: number
  checkIsSetCompleted: (exerciseIndex: number, setNum: number) => boolean
  setCurrentSet: (setNum: number) => void
  setIsViewingHistory: (viewing: boolean) => void
  isHistoryMode: boolean
  hasUncompletedPreviousSets: boolean
  weightInput: string
  setWeightInput: (val: string | ((prev: string) => string)) => void
  repsInput: string
  setRepsInput: (val: string | ((prev: string) => string)) => void
  setIsHistoryModalOpen: (open: boolean) => void
  historyLog: any | null
  hasUnsavedChanges: boolean
  handleSave: () => void
  isSaving: boolean
  goToPendingSet: () => void
  isPerSide: boolean
}

export function ActiveSetView({
  currentExercise,
  currentIndex,
  currentSet,
  checkIsSetCompleted,
  setCurrentSet,
  setIsViewingHistory,
  isHistoryMode,
  hasUncompletedPreviousSets,
  weightInput,
  setWeightInput,
  repsInput,
  setRepsInput,
  setIsHistoryModalOpen,
  historyLog,
  hasUnsavedChanges,
  handleSave,
  isSaving,
  goToPendingSet,
  isPerSide
}: ActiveSetViewProps) {
  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
      <div className="text-sm text-zinc-500 bg-zinc-900/50 px-4 py-2 mb-4 rounded-lg border border-zinc-800/50">
        Meta: <strong className="text-zinc-300">{currentExercise.reps} reps</strong>
      </div>
      <div className="flex gap-4 sm:gap-6 w-full max-w-sm">
        <div className="flex-1 space-y-2">
          <Label className={cn("text-center block text-sm uppercase tracking-wider", isPerSide ? "text-primary" : "text-zinc-400")}>
            {isPerSide ? "Carga (Cada Lado)" : "Carga (kg)"}
          </Label>
          <div className={cn(
            "flex items-center rounded-2xl p-1 transition-colors border",
            isPerSide ? "bg-primary/5 border-primary/30 focus-within:border-primary/60 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "bg-zinc-900/40 border-zinc-800",
            !isPerSide && isHistoryMode ? "focus-within:border-amber-500/50" : "",
            !isPerSide && !isHistoryMode ? "focus-within:border-primary/50" : "",
            hasUncompletedPreviousSets && "opacity-50 grayscale pointer-events-none"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeightInput(prev => String(Math.max(0, Number(prev || 0) - 1)))}
              className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
              disabled={hasUncompletedPreviousSets}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <Input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              disabled={hasUncompletedPreviousSets}
              className="h-14 flex-1 text-center text-2xl font-bold bg-transparent border-0 text-white shadow-none focus-visible:ring-0 px-0 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-100"
              placeholder="0"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeightInput(prev => String(Number(prev || 0) + 1))}
              className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
              disabled={hasUncompletedPreviousSets}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <Label className="text-zinc-400 text-center block text-sm uppercase tracking-wider">Repetições</Label>
          <div className={cn("flex items-center bg-zinc-900/40 rounded-2xl border border-zinc-800 p-1 transition-colors", isHistoryMode ? "focus-within:border-amber-500/50" : "focus-within:border-primary/50", hasUncompletedPreviousSets && "opacity-50 grayscale pointer-events-none")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRepsInput(prev => String(Math.max(0, Number(prev || 0) - 1)))}
              className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
              disabled={hasUncompletedPreviousSets}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <Input
              type="number"
              value={repsInput}
              onChange={e => setRepsInput(e.target.value)}
              disabled={hasUncompletedPreviousSets}
              className="h-14 flex-1 text-center text-2xl font-bold bg-transparent border-0 text-white shadow-none focus-visible:ring-0 px-0 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-100"
              placeholder="0"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRepsInput(prev => String(Number(prev || 0) + 1))}
              className="h-14 w-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
              disabled={hasUncompletedPreviousSets}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setIsHistoryModalOpen(true)}
          className="text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-800/50 transition-colors flex items-center gap-2 group"
        >
          <NotebookIcon className="w-4 h-4" /> Histórico
        </button>

        {historyLog && (
          <button
            onClick={() => {
              setWeightInput(String(isPerSide ? historyLog.weight / 2 : historyLog.weight))
              setRepsInput(String(historyLog.repsDone))
            }}
            className="text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-800/50 transition-colors flex items-center gap-2 group"
          >
            <History className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            Último: <strong className="text-zinc-300">{isPerSide ? historyLog.weight / 2 : historyLog.weight}kg x {historyLog.repsDone}</strong>
          </button>
        )}

      </div>

      <div className="w-full max-w-sm mt-10 space-y-3">
      {hasUncompletedPreviousSets ? (
        <Button
          onClick={() => {
            for (let s = 1; s < currentSet; s++) {
              if (!checkIsSetCompleted(currentIndex, s)) {
                setCurrentSet(s)
                break
              }
            }
          }}
          className="w-full h-16 text-[14px] uppercase tracking-[0.1em] font-black rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-[0_10px_30px_-10px_rgba(217,119,6,0.6)]"
        >
          <AlertTriangle className="w-5 h-5 mr-3" />
          Série anterior pendente
        </Button>
      ) : isHistoryMode ? (
        hasUnsavedChanges ? (
          <Button
            onClick={handleSave}
            disabled={!weightInput || !repsInput || isSaving}
            className="w-full h-16 text-[15px] uppercase tracking-[0.2em] font-black rounded-2xl transition-all duration-300 relative overflow-hidden group bg-zinc-900 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
              Atualizar Série
            </span>
          </Button>
        ) : (
          <Button
            onClick={goToPendingSet}
            className="w-full h-16 text-[15px] uppercase tracking-[0.1em] font-black rounded-2xl bg-zinc-900 border-2 border-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 shadow-none transition-all duration-300"
          >
            <span className="flex items-center justify-center">
              <SkipForward className="w-5 h-5 mr-3" />
              Voltar ao fluxo
            </span>
          </Button>
        )
      ) : (
        <Button
          onClick={handleSave}
          disabled={!weightInput || !repsInput || isSaving}
          className="w-full h-16 text-[15px] uppercase tracking-[0.2em] font-black rounded-2xl transition-all duration-300 relative overflow-hidden group bg-primary text-primary-foreground hover:brightness-110 shadow-[0_10px_40px_-10px_rgba(var(--primary),0.8)] hover:shadow-[0_15px_50px_-10px_rgba(var(--primary),0.9)] hover:-translate-y-1 border border-primary/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-12 group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
          <span className="relative z-10 flex items-center justify-center">
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
            Salvar Série
          </span>
        </Button>
      )}
      </div>
    </div>
  )
}
