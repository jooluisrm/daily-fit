"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"

const WEEK_DAYS = [
  { id: "dom", label: "DOM" },
  { id: "seg", label: "SEG" },
  { id: "ter", label: "TER" },
  { id: "qua", label: "QUA" },
  { id: "qui", label: "QUI" },
  { id: "sex", label: "SEX" },
  { id: "sab", label: "SÁB" },
]

export default function NewWorkoutPage() {
  const router = useRouter()
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    )
  }

  const handleCreate = () => {
    // Navigate to the newly created workout page (mock ID: 1)
    router.push("/treino/1")
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full pt-8 md:pt-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/treino">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Novo Treino</h1>
          <p className="text-sm text-zinc-400">Configure as informações base da sua nova rotina.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-8">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-zinc-300">Nome do Treino</Label>
          <Input
            id="name"
            placeholder="Ex: Treino A - Peito e Tríceps"
            className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-primary h-11"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-zinc-300">Dias da Semana</Label>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map(day => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`flex-1 min-w-[3.5rem] h-11 rounded-lg text-sm font-semibold transition-all ${selectedDays.includes(day.id)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">Selecione os dias em que este treino será realizado.</p>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-zinc-800/50">
          <Link href="/treino" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-11 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
              Cancelar
            </Button>
          </Link>
          <Button onClick={handleCreate} className="w-full sm:w-auto h-11 text-base font-medium transition-colors shadow-lg shadow-primary/20">
            <Save className="w-4 h-4 mr-2" />
            Criar Treino
          </Button>
        </div>
      </div>
    </div>
  )
}
