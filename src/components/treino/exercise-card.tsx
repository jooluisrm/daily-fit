"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dumbbell, ChevronDown, ChevronUp, Save, TrendingUp } from "lucide-react"
import Image from "next/image"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ExerciseProps {
  exercise: {
    id: number
    name: string
    sets: number
    reps: string
    image: string
  }
}

// Mock de dados para o gráfico (Histórico de treinos)
const mockHistoryData: Record<number, any[]> = {
  0: [ // Média (Average)
    { date: "14/06", weight: 40 },
    { date: "21/06", weight: 42 },
    { date: "28/06", weight: 45 },
    { date: "05/07", weight: 46 },
  ],
  1: [ // Série 1
    { date: "14/06", weight: 40 },
    { date: "21/06", weight: 45 },
    { date: "28/06", weight: 50 },
    { date: "05/07", weight: 50 },
  ],
  2: [ // Série 2
    { date: "14/06", weight: 40 },
    { date: "21/06", weight: 40 },
    { date: "28/06", weight: 45 },
    { date: "05/07", weight: 50 },
  ],
  3: [ // Série 3
    { date: "14/06", weight: 40 },
    { date: "21/06", weight: 40 },
    { date: "28/06", weight: 40 },
    { date: "05/07", weight: 45 },
  ],
  4: [ // Série 4
    { date: "14/06", weight: 40 },
    { date: "21/06", weight: 40 },
    { date: "28/06", weight: 40 },
    { date: "05/07", weight: 40 },
  ],
}

const chartConfig = {
  weight: {
    label: "Peso (kg)",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ExerciseCard({ exercise }: ExerciseProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSet, setSelectedSet] = useState<number>(0) // 0 = Média geral, 1 a N = Séries
  const [currentWeightInput, setCurrentWeightInput] = useState("")

  const chartData = mockHistoryData[selectedSet] || mockHistoryData[0]
  
  // Array para criar os botões das séries dinamicamente baseado no total de séries do exercício
  const setsArray = Array.from({ length: exercise.sets }, (_, i) => i + 1)
  
  // Pegar o último peso da série selecionada (se não for a média)
  const lastWeight = selectedSet > 0 ? chartData[chartData.length - 1].weight : null

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
      <CardContent className="p-0">
        
        {/* Cabeçalho do Exercício (Sempre visível) */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-zinc-800">
            <Image 
              src={exercise.image} 
              alt={exercise.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center relative">
            <h3 className="text-lg font-semibold text-white mb-2 pr-8">{exercise.name}</h3>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1 rounded-md">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="font-medium text-zinc-300">{exercise.sets} séries</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1 rounded-md">
                <span className="font-medium text-zinc-300">{exercise.reps} reps</span>
              </div>
            </div>
            
            {/* Ícone de Expansão */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
              {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </div>
        </div>

        {/* Área Expandida (Estatísticas e Inputs) */}
        {isExpanded && (
          <div className="border-t border-zinc-800 bg-zinc-950/50 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
            
            {/* Título do Gráfico */}
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h4 className="text-white font-medium">
                {selectedSet === 0 ? "Média de Peso (Histórico)" : `Histórico - Série ${selectedSet}`}
              </h4>
            </div>

            {/* Gráfico */}
            <div className="h-48 w-full mb-6">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ChartContainer>
            </div>

            {/* Abas das Séries */}
            <div className="flex w-full bg-zinc-900 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar border border-zinc-800">
              <button
                onClick={() => setSelectedSet(0)}
                className={`flex-1 min-w-[80px] py-2.5 px-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  selectedSet === 0 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Média
              </button>
              {setsArray.map((setNum) => (
                <button
                  key={setNum}
                  onClick={() => setSelectedSet(setNum)}
                  className={`flex-1 min-w-[80px] py-2.5 px-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                    selectedSet === setNum 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  Série {setNum}
                </button>
              ))}
            </div>

            {/* Área de Input (Apenas visível se uma série específica estiver selecionada) */}
            {selectedSet > 0 && (
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Último peso usado nesta série:</p>
                    <p className="text-xl font-bold text-white">{lastWeight} kg</p>
                  </div>
                  
                  <div className="flex items-end gap-2 w-full sm:w-auto">
                    <div className="space-y-1 flex-1 sm:w-32">
                      <label className="text-xs text-zinc-400">Peso hoje (kg)</label>
                      <Input 
                        type="number" 
                        placeholder="Ex: 50" 
                        value={currentWeightInput}
                        onChange={(e) => setCurrentWeightInput(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-primary h-10"
                      />
                    </div>
                    <Button className="h-10 px-4" disabled={!currentWeightInput}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Dica para selecionar série */}
            {selectedSet === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4 bg-zinc-900 rounded-lg border border-zinc-800/50">
                Selecione uma série acima para registrar o peso do treino de hoje.
              </p>
            )}
            
          </div>
        )}
      </CardContent>
    </Card>
  )
}
