import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"

interface FinishCardioPromptProps {
  cardioIntensity: string
  setCardioIntensity: (int: string) => void
  handleFinishCardio: () => void
  isSavingCardio: boolean
  isUpdatingStatus: boolean
}

export function FinishCardioPrompt({
  cardioIntensity,
  setCardioIntensity,
  handleFinishCardio,
  isSavingCardio,
  isUpdatingStatus
}: FinishCardioPromptProps) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-y-auto no-scrollbar">

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Cardio <span className="text-primary">Concluído!</span></h2>
          <p className="text-zinc-400 mb-6 text-sm text-center">
            Qual foi a intensidade do seu cardio?
          </p>

          <div className="w-full space-y-6 bg-zinc-900/60 p-4 sm:p-5 rounded-3xl border border-zinc-800 shadow-md backdrop-blur-xl">
            <div className="space-y-3">
              <Label className="text-zinc-300 uppercase tracking-widest text-[10px] font-bold text-center block">Intensidade</Label>
              <div className="flex flex-col gap-3">
                {['leve', 'moderado', 'intenso'].map((int) => (
                  <Button
                    key={int}
                    variant="ghost"
                    onClick={() => setCardioIntensity(int)}
                    className={`w-full h-14 text-base font-bold rounded-xl transition-all border ${cardioIntensity === int ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-[1.02]" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                  >
                    {int.charAt(0).toUpperCase() + int.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleFinishCardio}
                disabled={isSavingCardio || isUpdatingStatus}
                className="w-full h-14 text-base font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all hover:scale-[1.02]"
              >
                {(isSavingCardio || isUpdatingStatus) ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                Finalizar Treino
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
