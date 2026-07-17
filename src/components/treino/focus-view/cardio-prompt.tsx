import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CardioPromptProps {
  setPhase: (phase: 'EXERCISES' | 'PENDING_PROMPT' | 'CARDIO_PROMPT' | 'CARDIO_ACTIVE') => void
  isUpdatingStatus: boolean
  handleSkipCardio: () => void
}

export function CardioPrompt({
  setPhase,
  isUpdatingStatus,
  handleSkipCardio
}: CardioPromptProps) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
        <div className="h-full bg-primary w-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center relative overflow-y-auto no-scrollbar">
        {/* Fundo com gradiente suave usando a cor primária */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-zinc-950/50 to-zinc-950 opacity-80 z-0"></div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          {/* Ícone com glow */}
          <div className="w-24 h-24 mb-8 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-[0_0_40px_rgba(var(--primary),0.15)] flex items-center justify-center backdrop-blur-xl">
            <Activity className="w-12 h-12 text-primary" />
          </div>

          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Musculação <span className="text-primary">Concluída!</span> 💪</h2>
          <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
            Você completou sua ficha de musculação. Deseja adicionar uma sessão de cardio ou finalizar o treino por hoje?
          </p>

          <div className="flex flex-col gap-4 w-full">
            <Button
              size="lg"
              onClick={() => setPhase('CARDIO_ACTIVE')}
              disabled={isUpdatingStatus}
              className="w-full h-auto py-5 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02]"
            >
              <span className="text-xl font-black">Adicionar Cardio</span>
              <span className="text-sm font-medium text-white/70">Esteira, Bike, Escada...</span>
            </Button>

            <Button
              size="lg"
              onClick={handleSkipCardio}
              disabled={isUpdatingStatus}
              variant="outline"
              className="w-full h-auto py-5 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
            >
              <span className="text-lg font-bold">Encerrar Treino (Sem Cardio)</span>
              <span className="text-sm font-medium text-zinc-500">Salvar e voltar ao menu</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
