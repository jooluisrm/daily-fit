import { Activity, Trophy, Loader2 } from "lucide-react"
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
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 relative overflow-y-auto no-scrollbar">
        {/* Fundo com gradiente suave usando a cor primária */}
        

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          {/* Ícone menor */}
          <div className="w-14 h-14 mb-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(var(--primary),0.15)] flex items-center justify-center backdrop-blur-xl">
            <Activity className="w-7 h-7 text-primary" />
          </div>

          <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Sessão de <span className="text-primary">Cardio</span></h2>

          <div className="w-full space-y-5 bg-zinc-900/60 p-5 sm:p-6 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-xl">
            <div className="space-y-3">
              <Label className="text-zinc-300 uppercase tracking-widest text-xs font-bold">Tipo de Aparelho</Label>
              <div className="flex gap-2">
                {['Esteira', 'Bike', 'Escada'].map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    onClick={() => setCardioType(type)}
                    className={`flex-1 h-14 text-sm font-semibold rounded-xl transition-all border ${cardioType === type ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-300 uppercase tracking-widest text-xs font-bold">Intensidade</Label>
              <div className="flex gap-2">
                {['leve', 'moderado', 'intenso'].map((int) => (
                  <Button
                    key={int}
                    variant="ghost"
                    onClick={() => setCardioIntensity(int)}
                    className={`flex-1 h-14 text-sm font-semibold rounded-xl transition-all border ${cardioIntensity === int ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                  >
                    {int.charAt(0).toUpperCase() + int.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="cardio-time" className="text-zinc-300 uppercase tracking-widest text-xs font-bold">Tempo (minutos)</Label>
              <Input
                id="cardio-time"
                type="number"
                placeholder="0"
                value={cardioTime}
                onChange={(e) => setCardioTime(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-16 text-2xl text-center font-black rounded-2xl shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button
                onClick={handleFinishCardio}
                disabled={!cardioTime || isSavingCardio || isUpdatingStatus}
                className="w-full h-16 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all hover:scale-[1.02]"
              >
                {(isSavingCardio || isUpdatingStatus) ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Trophy className="w-6 h-6 mr-3" />}
                Salvar e Finalizar Treino
              </Button>

              <Button
                onClick={handleSkipCardio}
                disabled={isSavingCardio || isUpdatingStatus}
                variant="ghost"
                className="w-full text-zinc-500 hover:text-zinc-300 h-12 rounded-xl border border-transparent hover:border-zinc-800"
              >
                Cancelar e Encerrar Treino
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
