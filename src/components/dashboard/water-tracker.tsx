"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplet, Settings, Plus, CheckCircle2, Sparkles } from "lucide-react"
import { useWaterData, useAddWater, useUpdateWaterSettings } from "@/src/hooks/use-water"
import { toast } from "sonner"

export function WaterTrackerCard() {
  const { data, isLoading } = useWaterData()
  const { mutate: addWater, isPending: isAdding } = useAddWater()
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateWaterSettings()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [quickAddsInput, setQuickAddsInput] = useState("")

  const total = data?.totalConsumed || 0
  const goal = data?.goal || 2000
  const quickAdds = data?.quickAdds || [250, 500]

  const percentage = Math.min(Math.round((total / goal) * 100), 100)
  const isCompleted = total >= goal && goal > 0

  const handleAddWater = (amount: number) => {
    addWater(amount, {
      onSuccess: () => toast.success(`+${amount}ml adicionados!`),
      onError: () => toast.error("Erro ao adicionar água")
    })
  }

  const handleOpenSettings = () => {
    setQuickAddsInput(quickAdds.join(", "))
    setIsSettingsOpen(true)
  }

  const handleSaveSettings = () => {
    const newQuickAdds = quickAddsInput
      .split(",")
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0)

    if (newQuickAdds.length === 0) {
      toast.error("Adicione pelo menos um atalho válido (ex: 250)")
      return
    }

    updateSettings({ goal, quickAdds: newQuickAdds }, {
      onSuccess: () => {
        toast.success("Configurações atualizadas!")
        setIsSettingsOpen(false)
      },
      onError: () => toast.error("Erro ao atualizar configurações")
    })
  }

  return (
    <>
      <Card className={`bg-zinc-900 h-full flex flex-col transition-colors duration-500 ${isCompleted ? 'border-emerald-500/50' : 'border-zinc-800'}`}>
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Droplet className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : 'text-blue-400'}`} />
            Hidratação
            {isCompleted && <span className="text-xs font-normal text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-1">Meta Batida</span>}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={handleOpenSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col justify-between">
          <div className="flex flex-col items-center justify-center py-4">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-zinc-800"
              style={{
                background: `conic-gradient(${isCompleted ? '#10b981' : '#60a5fa'} ${percentage}%, #27272a ${percentage}%)`
              }}
            >
              <div className="absolute inset-1 bg-zinc-900 rounded-full flex flex-col items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-1" />
                ) : (
                  <span className="text-2xl font-bold text-white">{total}</span>
                )}
                <span className={`text-xs ${isCompleted ? 'text-emerald-500/70 font-medium' : 'text-zinc-400'}`}>{isCompleted ? 'Sucesso!' : `/ ${goal} ml`}</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Meta Inteligente</span>
            </div>

            {isCompleted && (
              <p className="text-sm text-zinc-400 mt-4 text-center">
                Você bebeu <span className="text-white font-medium">{total}ml</span>.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {quickAdds.slice(0, 2).map((amount, i) => (
              <Button
                key={i}
                variant="outline"
                className={`h-12 ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300' : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300'}`}
                onClick={() => handleAddWater(amount)}
                disabled={isAdding}
              >
                <Plus className="w-4 h-4 mr-1" />
                {amount}ml
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Água</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Sua meta diária ({goal}ml) é calculada dinamicamente pelo app baseada no seu peso e treinos. Aqui você pode ajustar seus botões rápidos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quickAdds" className="text-zinc-300">Botões Rápidos (separados por vírgula)</Label>
              <Input
                id="quickAdds"
                value={quickAddsInput}
                onChange={(e) => setQuickAddsInput(e.target.value)}
                placeholder="Ex: 250, 500"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-xs text-zinc-500">Ex: 200, 600 (Aparecem até 2 botões)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="border-zinc-700">
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
