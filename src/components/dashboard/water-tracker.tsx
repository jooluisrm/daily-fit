"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplet, Settings, Plus, CheckCircle2, Sparkles, Clock } from "lucide-react"
import { useWaterData, useAddWater, useUpdateWaterSettings } from "@/src/hooks/use-water"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

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

  let lastLogText = ""
  if (data?.logs && data.logs.length > 0) {
    const sortedLogs = [...data.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const lastLogDate = new Date(sortedLogs[0].date)
    const now = new Date()
    
    const diffMs = now.getTime() - lastLogDate.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) {
      lastLogText = "agora mesmo"
    } else if (diffMinutes < 60) {
      lastLogText = `há ${diffMinutes} min`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const remainingMinutes = diffMinutes % 60
      if (remainingMinutes === 0) {
        lastLogText = `há ${hours}h`
      } else {
        lastLogText = `há ${hours}h e ${remainingMinutes}min`
      }
    }
  }

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
      <Card className={`relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950 flex flex-col h-full transition-all group hover:border-zinc-700/50 hover:scale-[1.02] shadow-sm ${isCompleted ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-zinc-800/50'}`}>
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
        <CardHeader className="pb-2 flex flex-row items-start justify-between relative z-10">
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
            {/* SVG Circular Progress with Framer Motion */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#27272a" strokeWidth="8" fill="transparent" />
                <motion.circle 
                  cx="50" cy="50" r="42" 
                  stroke={isCompleted ? '#10b981' : '#3b82f6'} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="264"
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * percentage) / 100 }}
                  transition={{ type: 'spring', bounce: 0.1, duration: 1.2 }}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div 
                      key="completed"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-1" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="progress"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <motion.span 
                        className="text-3xl font-bold text-white tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {total}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className={`text-xs mt-1 ${isCompleted ? 'text-emerald-500/70 font-medium' : 'text-zinc-400'}`}>
                  {isCompleted ? 'Sucesso!' : `/ ${goal} ml`}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Meta Inteligente</span>
              </div>
              {lastLogText && (
                <span className="text-xs text-zinc-500 flex items-center gap-1" title="Última vez que bebeu água hoje">
                  <Clock className="w-3 h-3" />
                  {lastLogText}
                </span>
              )}
            </div>

            {isCompleted && (
              <p className="text-sm text-zinc-400 mt-4 text-center">
                Você bebeu <span className="text-white font-medium">{total}ml</span>.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {quickAdds.slice(0, 2).map((amount, i) => (
              <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className={`w-full h-14 text-base font-medium transition-all shadow-sm ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300' : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'}`}
                  onClick={() => handleAddWater(amount)}
                  disabled={isAdding}
                >
                  <Plus className="w-5 h-5 mr-1" />
                  {amount}ml
                </Button>
              </motion.div>
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
