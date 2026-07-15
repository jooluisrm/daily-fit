"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Timer, Save, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useUpdateProfile } from "@/src/hooks/use-user"
import { toast } from "sonner"

export function PerfilTreino() {
  const { data: session, update } = useSession()
  const user = session?.user as any

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()

  // Input value in minutes
  const [restTimeMinutes, setRestTimeMinutes] = useState<number | "">("")

  // Update states when session loads
  useEffect(() => {
    if (user && user.restTimeGoal !== undefined) {
      setRestTimeMinutes(user.restTimeGoal / 60)
    }
  }, [user])

  const handleSave = async () => {
    if (!restTimeMinutes || Number(restTimeMinutes) <= 0) {
      toast.error("Insira um tempo de descanso válido.")
      return
    }

    try {
      const restTimeSeconds = Math.round(Number(restTimeMinutes) * 60)

      await updateProfile({
        restTimeGoal: restTimeSeconds
      })

      // Update the NextAuth JWT in memory
      await update({
        restTimeGoal: restTimeSeconds
      })

      toast.success("Configurações de treino salvas com sucesso!")
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar as configurações.")
      console.error(error)
    }
  }

  const isSaveDisabled = 
    isPending || 
    !restTimeMinutes || 
    (Math.round(Number(restTimeMinutes) * 60) === (user?.restTimeGoal || 90))

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Configurações de Treino</h3>
            <p className="text-zinc-400 text-sm">Personalize suas preferências para as sessões de treino.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Tempo de Descanso entre Séries (minutos)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Ex: 1.5"
                value={restTimeMinutes}
                onChange={(e) => setRestTimeMinutes(e.target.value ? Number(e.target.value) : "")}
                className="bg-zinc-950 border-zinc-800 text-white pl-10 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
              />
              <Timer className="absolute left-3.5 top-3.5 w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-xs text-zinc-500">
              Isso define o cronômetro automático que aparece logo após você registrar uma série.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaveDisabled}
          className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
