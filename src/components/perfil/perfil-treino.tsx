"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Timer, Save, Loader2, RefreshCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useUpdateProfile } from "@/src/hooks/use-user"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useWorkouts, useSyncWorkoutExercises } from "@/src/hooks/use-workout"
import { toast } from "sonner"

export function PerfilTreino() {
  const { data: session, update } = useSession()
  const user = session?.user as any

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()

  const [restTimeFormatted, setRestTimeFormatted] = useState<string>("")
  const [defaultSets, setDefaultSets] = useState<string>("")
  const [defaultReps, setDefaultReps] = useState<string>("")
  
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("")
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const { data: workouts } = useWorkouts()
  const { mutateAsync: syncExercises, isPending: isSyncing } = useSyncWorkoutExercises(selectedWorkoutId)

  // Update states when session loads
  useEffect(() => {
    if (user && user.restTimeGoal !== undefined) {
      const totalSeconds = user.restTimeGoal
      const m = Math.floor(totalSeconds / 60)
      const s = totalSeconds % 60
      setRestTimeFormatted(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    if (user && user.defaultSets !== undefined) {
      setDefaultSets(String(user.defaultSets))
    }
    if (user && user.defaultReps !== undefined) {
      setDefaultReps(user.defaultReps)
    }
  }, [user])

  const handleRestTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 4) val = val.substring(0, 4)
    if (val.length > 2) {
      val = val.substring(0, 2) + ':' + val.substring(2)
    }
    setRestTimeFormatted(val)
  }

  const handleSave = async () => {
    if (!restTimeFormatted) {
      toast.error("Insira um tempo de descanso válido.")
      return
    }

    const [mStr, sStr] = restTimeFormatted.split(':')
    const m = parseInt(mStr || "0", 10)
    const s = parseInt(sStr || "0", 10)
    const restTimeSeconds = m * 60 + (s > 59 ? 59 : s) // cap seconds at 59

    if (restTimeSeconds <= 0) {
      toast.error("Insira um tempo de descanso válido.")
      return
    }

    try {

      await updateProfile({
        restTimeGoal: restTimeSeconds,
        defaultSets: defaultSets ? Number(defaultSets) : undefined,
        defaultReps: defaultReps || undefined
      })

      // Update the NextAuth JWT in memory
      await update({
        restTimeGoal: restTimeSeconds,
        defaultSets: defaultSets ? Number(defaultSets) : undefined,
        defaultReps: defaultReps || undefined
      })

      toast.success("Configurações de treino salvas com sucesso!")
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar as configurações.")
      console.error(error)
    }
  }

  const handleSync = async () => {
    if (!selectedWorkoutId) return;
    
    // Assegurar que temos valores válidos para sincronizar
    const setsToSync = Number(defaultSets) || user?.defaultSets || 4
    const repsToSync = defaultReps || user?.defaultReps || "10-12"

    try {
      await syncExercises({ sets: setsToSync, reps: repsToSync });
      toast.success("Todos os exercícios deste treino foram atualizados com sucesso!");
      setSelectedWorkoutId(""); // limpa a seleção
      setIsSyncDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao sincronizar os exercícios.");
    }
  }

  const isSaveDisabled = 
    isPending || 
    !restTimeFormatted || 
    (() => {
      const [mStr, sStr] = restTimeFormatted.split(':')
      const m = parseInt(mStr || "0", 10)
      const s = parseInt(sStr || "0", 10)
      const restTimeSeconds = m * 60 + (s > 59 ? 59 : s)
      return restTimeSeconds === (user?.restTimeGoal || 90) &&
             (defaultSets === "" || Number(defaultSets) === (user?.defaultSets || 4)) &&
             (defaultReps === "" || defaultReps === (user?.defaultReps || "10-12"))
    })()

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
            <Label className="text-zinc-300">Tempo de Descanso entre Séries (MM:SS)</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Ex: 01:30"
                value={restTimeFormatted}
                onChange={handleRestTimeChange}
                className="bg-zinc-950 border-zinc-800 text-white pl-10 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
              />
              <Timer className="absolute left-3.5 top-3.5 w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-xs text-zinc-500">
              Isso define o cronômetro automático que aparece logo após você registrar uma série.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
            <div className="space-y-2">
              <Label className="text-zinc-300">Séries Padrão</Label>
              <Input
                type="number"
                placeholder="Ex: 4"
                value={defaultSets}
                onChange={(e) => setDefaultSets(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Repetições Padrão</Label>
              <Input
                type="text"
                placeholder="Ex: 10-12"
                value={defaultReps}
                onChange={(e) => setDefaultReps(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
              />
            </div>
            <div className="col-span-2 space-y-4 pt-6 border-t border-zinc-800/50 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-medium text-zinc-300">Sincronização Rápida</h4>
              </div>
              <p className="text-xs text-zinc-500">
                Aplique as Séries e Repetições acima a todos os exercícios de um treino existente de uma só vez.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Select value={selectedWorkoutId} onValueChange={(val) => val && setSelectedWorkoutId(val)}>
                  <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-white h-12 rounded-xl focus:ring-1 focus:ring-primary/50">
                    <SelectValue placeholder="Selecione um treino...">
                      {workouts?.find(w => w.id === selectedWorkoutId)?.name || "Selecione um treino..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    {workouts && workouts.length > 0 ? (
                      workouts.map(w => (
                        <SelectItem key={w.id} value={w.id} className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
                          {w.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-zinc-500">Nenhum treino encontrado.</div>
                    )}
                  </SelectContent>
                </Select>

                <AlertDialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                  <AlertDialogTrigger render={
                    <Button 
                      disabled={!selectedWorkoutId || isSyncing}
                      className="h-12 px-8 font-medium shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all w-full sm:w-auto shrink-0"
                    >
                      {isSyncing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                      Sincronizar
                    </Button>
                  } />
                  <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Confirmar Sincronização</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Tem certeza que deseja substituir as séries e repetições de <strong>todos os exercícios</strong> deste treino para os valores padrão ({defaultSets || user?.defaultSets || 4} séries de {defaultReps || user?.defaultReps || "10-12"} repetições)?<br/><br/>
                        Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSync} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
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
