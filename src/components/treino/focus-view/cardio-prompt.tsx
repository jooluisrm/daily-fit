import { Button } from "@/components/ui/button"

interface CardioPromptProps {
  setPhase: (phase: 'EXERCISES' | 'PENDING_PROMPT' | 'CARDIO_PROMPT' | 'CARDIO_ACTIVE') => void
  isUpdatingStatus: boolean
  handleSkipCardio: () => void
  todayCardio?: any
  handleFinishWithExistingCardio?: () => void
}

export function CardioPrompt({
  setPhase,
  isUpdatingStatus,
  handleSkipCardio,
  todayCardio,
  handleFinishWithExistingCardio
}: CardioPromptProps) {
  const hasCompletedCardio = todayCardio && (todayCardio.status === 'COMPLETED' || todayCardio.duration > 0)

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="flex-1 w-full flex flex-col items-center justify-center py-4 px-4 sm:px-6 text-center relative overflow-y-auto no-scrollbar">
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Musculação <span className="text-primary">Concluída!</span> 💪</h2>

          {hasCompletedCardio ? (
            <>
              <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                Você já registrou seu cardio de hoje:
              </p>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 w-full mb-8 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-300 font-bold">{todayCardio.type || 'Cardio'}</span>
                  <span className="text-emerald-500 font-black text-xl">{todayCardio.duration} min</span>
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest">
                  Intensidade: <span className="text-zinc-300">{todayCardio.intensity || 'moderado'}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
              Deseja adicionar uma sessão de cardio ou finalizar o treino por hoje?
            </p>
          )}

          <div className="flex flex-col gap-3 w-full mt-auto">
            {hasCompletedCardio ? (
              <>
                <Button
                  size="lg"
                  onClick={handleFinishWithExistingCardio}
                  disabled={isUpdatingStatus}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl flex items-center justify-center transition-all hover:scale-[1.02] text-lg font-bold"
                >
                  Finalizar Treino
                </Button>
                <Button
                  size="lg"
                  onClick={() => setPhase('CARDIO_ACTIVE')}
                  disabled={isUpdatingStatus}
                  variant="outline"
                  className="w-full h-14 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 rounded-xl flex items-center justify-center transition-all text-base font-semibold"
                >
                  Editar Cardio
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => setPhase('CARDIO_ACTIVE')}
                  disabled={isUpdatingStatus}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(var(--primary),0.3)] rounded-xl flex items-center justify-center transition-all hover:scale-[1.02] text-lg font-bold"
                >
                  Adicionar Cardio
                </Button>
                <Button
                  size="lg"
                  onClick={handleSkipCardio}
                  disabled={isUpdatingStatus}
                  variant="outline"
                  className="w-full h-14 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 rounded-xl flex items-center justify-center transition-all text-base font-semibold"
                >
                  Encerrar (Sem Cardio)
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
