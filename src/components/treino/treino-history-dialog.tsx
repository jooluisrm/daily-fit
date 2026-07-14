import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"

interface TreinoHistoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  exerciseName?: string
  fullHistory: {
    date: string
    logs: any[]
  }[]
}

export function TreinoHistoryDialog({ isOpen, onOpenChange, exerciseName, fullHistory }: TreinoHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl p-6 shadow-2xl max-w-md w-[95%] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-500" />
            Histórico
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Desempenho anterior em <strong className="text-zinc-200">{exerciseName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-2 space-y-5 custom-scrollbar">
          {fullHistory.length === 0 ? (
            <div className="text-center text-zinc-500 py-12 flex flex-col items-center">
              <History className="w-12 h-12 mb-4 opacity-20" />
              Nenhum histórico anterior encontrado para este exercício.
            </div>
          ) : (
            fullHistory.map((group) => (
              <div key={group.date} className="space-y-3">
                <h4 className="text-sm font-bold text-zinc-300 border-b border-zinc-800/80 pb-2">{group.date}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {group.logs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                      <span className="text-zinc-400 font-medium text-sm">Série {log.setNumber}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-zinc-200 text-base">{log.weight}kg</span>
                        <span className="text-zinc-600 text-sm">x</span>
                        <span className="font-mono font-bold text-zinc-200 text-base">{log.repsDone} reps</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-zinc-900">
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
