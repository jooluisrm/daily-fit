"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Scale, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWeightLogs, useCreateWeightLog } from "@/src/hooks/use-weight"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export function WeightChart() {
  const { update } = useSession()
  const { data: logs, isLoading } = useWeightLogs()
  const { mutate: createLog, isPending } = useCreateWeightLog()
  
  const [isOpen, setIsOpen] = useState(false)
  const [weightInput, setWeightInput] = useState("")

  const handleSave = () => {
    const weight = parseFloat(weightInput.replace(',', '.'))
    if (isNaN(weight) || weight <= 0) {
      toast.error("Peso inválido", { description: "Por favor insira um peso válido." })
      return
    }

    createLog({ weight }, {
      onSuccess: async () => {
        await update({ weight })
        toast.success("Peso registrado!")
        setIsOpen(false)
        setWeightInput("")
      },
      onError: (err) => {
        toast.error("Erro ao registrar peso")
        console.error(err)
      }
    })
  }

  // Formatando dados para o gráfico
  const chartData = logs?.map(log => {
    const dateObj = new Date(log.date)
    return {
      date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: log.weight,
      rawDate: dateObj
    }
  }) || []

  // Calcular minY e maxY para dar "zoom" no gráfico (senão fica tudo plano)
  const weights = chartData.map(d => d.weight)
  const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights)) - 2 : 0
  const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights)) + 2 : 100

  // Identifica tendência (ganho/perda)
  let trend = null
  let diff = 0
  if (weights.length >= 2) {
    const first = weights[0]
    const last = weights[weights.length - 1]
    diff = last - first
    if (diff > 0) trend = 'gain'
    else if (diff < 0) trend = 'loss'
    else trend = 'neutral'
  }

  const currentWeight = weights.length > 0 ? weights[weights.length - 1] : "--"

  return (
    <>
      <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border-zinc-800/50 relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
        <div className="absolute -left-12 -top-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-500" />
              Evolução de Peso
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs mt-1">
              Atual: <span className="text-white font-medium">{currentWeight} kg</span>
              {trend && (
                <span className={`ml-2 ${trend === 'loss' ? 'text-emerald-500' : trend === 'gain' ? 'text-orange-500' : 'text-zinc-500'}`}>
                  ({diff > 0 ? '+' : ''}{diff.toFixed(1)}kg)
                </span>
              )}
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1 border-zinc-700 bg-zinc-800" onClick={() => setIsOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Registrar</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis 
                  domain={[minWeight, maxWeight]}
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}kg`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value} kg`, 'Peso']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
              <Scale className="w-8 h-8 mb-2 opacity-20" />
              <p>Nenhum peso registrado ainda.</p>
              <p>Clique em "Registrar" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Peso Hoje</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="weight" className="text-zinc-400">Peso (kg)</Label>
            <Input 
              id="weight"
              type="number"
              step="0.1"
              placeholder="Ex: 75.5"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="bg-zinc-800 border-zinc-700 mt-2 text-lg"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-zinc-700">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending || !weightInput}>
              {isPending ? "Salvando..." : "Salvar Peso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
