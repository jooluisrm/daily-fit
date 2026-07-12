"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, CalendarDays, Save, Activity } from "lucide-react"
import { ExerciseCard } from "@/src/components/treino/exercise-card"

export function TreinoToday() {
  const [cardioIntensity, setCardioIntensity] = useState<string>("moderado")
  const [cardioTime, setCardioTime] = useState<string>("")

  const workout = {
    day: "Quarta-feira",
    title: "Treino C - Pernas e Abdômen",
    estimatedTime: "55 min",
    exercises: [
      {
        id: 1,
        name: "Agachamento Livre",
        sets: 4,
        reps: "10-12",
        image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&q=80"
      },
      {
        id: 2,
        name: "Leg Press 45º",
        sets: 4,
        reps: "12",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"
      },
      {
        id: 3,
        name: "Cadeira Extensora",
        sets: 3,
        reps: "15",
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80"
      }
    ]
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header do Treino */}
      <div>
        <div className="flex items-center gap-2 text-primary font-medium mb-2">
          <CalendarDays className="w-5 h-5" />
          <span>{workout.day}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              {workout.title}
            </h1>
            <p className="text-zinc-400">
              Duração estimada: {workout.estimatedTime}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Exercícios */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Exercícios ({workout.exercises.length})</h2>

        {workout.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {/* Sessão de Cardio */}
      <div className="pt-8 pb-4 border-t border-zinc-800/50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Cardio</h2>
            <p className="text-sm text-zinc-400">Registre sua atividade cardiovascular hoje.</p>
          </div>
        </div>

        <div className="space-y-6 bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
          <div className="space-y-3">
            <Label className="text-zinc-300">Intensidade</Label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setCardioIntensity("leve")}
                className={`flex-1 h-11 text-sm font-medium transition-all border ${cardioIntensity === "leve" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
              >
                Leve
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCardioIntensity("moderado")}
                className={`flex-1 h-11 text-sm font-medium transition-all border ${cardioIntensity === "moderado" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
              >
                Moderado
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCardioIntensity("intenso")}
                className={`flex-1 h-11 text-sm font-medium transition-all border ${cardioIntensity === "intenso" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
              >
                Intenso
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="cardio-time" className="text-zinc-300">Duração (minutos)</Label>
            <Input
              id="cardio-time"
              type="number"
              placeholder="Ex: 20"
              value={cardioTime}
              onChange={(e) => setCardioTime(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20">
              <Save className="w-5 h-5 mr-2" />
              Salvar Cardio
            </Button>
            <Button variant="ghost" className="w-full h-12 text-base font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 hover:text-white hover:bg-zinc-800">
              Não fiz cardio hoje
            </Button>
          </div>
        </div>

        <Button className="w-full md:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Finalizar Treino
        </Button>
      </div>
    </div>
  )
}
