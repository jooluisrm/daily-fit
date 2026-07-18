import { Trophy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface CardioActiveProps {
  cardioType: string
  setCardioType: (type: string) => void
  cardioIntensity: string
  setCardioIntensity: (int: string) => void
  cardioTime: string
  setCardioTime: (time: string) => void
  handleFinishCardio: () => void
  handleSkipCardio: () => void
  isSavingCardio: boolean
  isUpdatingStatus: boolean
}

export function CardioActive({
  cardioType,
  setCardioType,
  cardioIntensity,
  setCardioIntensity,
  cardioTime,
  setCardioTime,
  handleFinishCardio,
  handleSkipCardio,
  isSavingCardio,
  isUpdatingStatus
}: CardioActiveProps) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-y-auto no-scrollbar">

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight">Sessão de <span className="text-primary">Cardio</span></h2>

          <div className="w-full space-y-4 bg-zinc-900/60 p-4 sm:p-5 rounded-3xl border border-zinc-800 shadow-md backdrop-blur-xl">
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
              <Label className="text-zinc-300 uppercase tracking-widest text-[10px] font-bold">Intensidade</Label>
              <div className="flex gap-2">
                {['leve', 'moderado', 'intenso'].map((int) => (
                  <Button
                    key={int}
                    variant="ghost"
                    onClick={() => setCardioIntensity(int)}
                    className={`flex-1 h-12 text-xs font-semibold rounded-xl transition-all border ${cardioIntensity === int ? "bg-primary text-white border-primary shadow-sm" : "bg-zinc-900/50 border-zinc-800 text-zinc-400"}`}
                  >
                    {int.charAt(0).toUpperCase() + int.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardio-time" className="text-zinc-300 uppercase tracking-widest text-[10px] font-bold">Tempo (minutos)</Label>
              <Input
                id="cardio-time"
                type="number"
                placeholder="0"
                value={cardioTime}
                onChange={(e) => setCardioTime(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-14 text-xl text-center font-black rounded-xl shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="pt-2 space-y-2">
              <Button
                onClick={handleFinishCardio}
                disabled={!cardioTime || isSavingCardio || isUpdatingStatus}
                className="w-full h-14 text-base font-bold shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 text-white rounded-xl transition-all hover:scale-[1.02]"
              >
                {(isSavingCardio || isUpdatingStatus) ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Trophy className="w-5 h-5 mr-2" />}
                Salvar Treino
              </Button>

              <Button
                onClick={handleSkipCardio}
                disabled={isSavingCardio || isUpdatingStatus}
                variant="ghost"
                className="w-full text-zinc-500 hover:text-zinc-300 h-10 text-sm rounded-lg border border-transparent"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
