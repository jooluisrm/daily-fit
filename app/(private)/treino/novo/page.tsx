"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useCreateWorkout, useWorkouts } from "@/src/hooks/use-workout"
import { toast } from "sonner"

const DAYS_OF_WEEK = [
  { id: 0, label: "DOM" },
  { id: 1, label: "SEG" },
  { id: 2, label: "TER" },
  { id: 3, label: "QUA" },
  { id: 4, label: "QUI" },
  { id: 5, label: "SEX" },
  { id: 6, label: "SÁB" },
]

export default function NovoTreinoPage() {
  const router = useRouter()
  const { data: workouts } = useWorkouts()
  const { mutateAsync: createWorkout, isPending } = useCreateWorkout()

  const [name, setName] = useState("")
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  // Dias já alocados em outros treinos
  const disabledDays = workouts?.flatMap(w => w.daysOfWeek) || []

  const toggleDay = (dayId: number) => {
    if (disabledDays.includes(dayId)) return;
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Por favor, digite um nome para o treino.")
      return
    }

    try {
      await createWorkout({ name, daysOfWeek: selectedDays })
      toast.success("Treino criado com sucesso!")
      router.push("/treino")
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Ocorreu um erro ao criar o treino.")
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-8 md:pt-8 animate-in fade-in duration-300">
      
      {/* Header com estilo premium */}
      <div className="mb-8 sm:mb-12 bg-zinc-900/40 p-5 sm:p-8 rounded-2xl border border-zinc-800/50 flex justify-between items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/treino?tab=list")}
            className="text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Novo Treino</h1>
            <p className="text-sm text-zinc-400 mt-1">Configure as informações base da sua nova rotina.</p>
          </div>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-8">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-zinc-300 font-medium">Nome do Treino</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Treino A - Peito e Tríceps"
            className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-primary h-12"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-zinc-300 font-medium">Dias da Semana</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day.id)
              const isDisabled = disabledDays.includes(day.id)

              return (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  disabled={isDisabled}
                  title={isDisabled ? "Você já possui um treino neste dia" : ""}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${isSelected
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : isDisabled
                        ? "bg-zinc-900/50 text-zinc-600 border-zinc-800/50 cursor-not-allowed"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-800"
                    }`}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
          <p className="text-sm text-zinc-500 pt-1">Selecione os dias em que este treino será realizado.</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={() => router.push("/treino")}
            disabled={isPending}
            className="text-zinc-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isPending || !name.trim()}
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Criar Treino
          </Button>
        </div>
      </Card>
    </div>
  )
}
