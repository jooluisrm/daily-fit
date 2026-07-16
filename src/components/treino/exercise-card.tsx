"use client"

import { useState, useEffect, useRef, UIEvent, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dumbbell, ChevronDown, ChevronUp, Save, TrendingUp, Loader2, MoreVertical, Edit2, PowerOff, Power, List, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useLogExercise, useUpdateWorkoutExercise } from "@/src/hooks/use-exercise"
import { useWorkoutProgressStore } from "@/src/store/use-workout-progress-store"
import { cn } from "@/lib/utils"

interface ExerciseProps {
  workoutExercise: any
  index?: number
  isCompleted?: boolean
  onSetComplete?: () => void
}

const chartConfig = {
  weight: {
    label: "Peso (kg)",
    color: "var(--primary)",
  }
} satisfies ChartConfig

export function ExerciseCard({ workoutExercise, index, isCompleted, onSetComplete }: ExerciseProps) {
  const workoutId = workoutExercise.workoutId
  const progressState = useWorkoutProgressStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSet, setSelectedSet] = useState<number>(0) // 0 = Média geral, 1 a N = Séries
  const [activeView, setActiveView] = useState<'chart' | 'list'>('list')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentWeightInput, setCurrentWeightInput] = useState("")
  const [currentRepsInput, setCurrentRepsInput] = useState("")

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", imageUrl: "", sets: "", reps: "" })

  const { mutateAsync: logExercise, isPending: isSaving } = useLogExercise(workoutId)
  const { mutateAsync: updateExercise, isPending: isUpdating } = useUpdateWorkoutExercise(workoutId)

  // Extrair os dados reais do banco
  const exerciseData = workoutExercise.exercise
  const sets = workoutExercise.sets
  const reps = workoutExercise.reps

  const todayLogsFull = useMemo(() => {
    const todayStrFull = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return workoutExercise.logs?.filter((l: any) => {
      const logDate = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDate === todayStrFull
    }) || []
  }, [workoutExercise.logs])

  const completedSetsCount = useMemo(() => {
    let count = 0
    for (let s = 1; s <= sets; s++) {
      if (todayLogsFull.some((l: any) => l.setNumber === s)) {
        count++
      }
    }
    return count
  }, [sets, todayLogsFull])

  const todayStrFull = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const isFullyCompleted = completedSetsCount === sets
  const isActiveExercise = mounted && progressState.workoutId === workoutId && progressState.date === todayStrFull && progressState.currentIndex === index

  // Array para criar os botões das séries dinamicamente baseado no total de séries do exercício
  const setsArray = Array.from({ length: sets }, (_, i) => i + 1)

  // Montar o histórico agrupado a partir dos logs
  const historyData: Record<number, any[]> = { 0: [] }
  setsArray.forEach(setNum => { historyData[setNum] = [] })

  if (workoutExercise.logs) {
    const sortedLogs = [...workoutExercise.logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sortedLogs.forEach((log: any) => {
      const dateStr = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (historyData[log.setNumber]) {
        historyData[log.setNumber].push({ date: dateStr, weight: log.weight, repsDone: log.repsDone })
      }
    })

    const logsByDate = sortedLogs.reduce((acc: any, log: any) => {
      const dateStr = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (!acc[dateStr]) acc[dateStr] = { totalWeight: 0, totalReps: 0, count: 0 }
      acc[dateStr].totalWeight += log.weight
      acc[dateStr].totalReps += log.repsDone
      acc[dateStr].count += 1
      return acc
    }, {})

    historyData[0] = Object.entries(logsByDate).map(([date, data]: any) => ({
      date,
      weight: Math.round((data.totalWeight / data.count) * 10) / 10,
      repsDone: Math.round((data.totalReps / data.count) * 10) / 10
    }))
  }

  const chartData = historyData[selectedSet] || []

  const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const logOfToday = chartData.find((log: any) => log.date === todayStr)

  const lastLog = chartData.length > 0 ? chartData[chartData.length - 1] : null
  const lastWeight = lastLog ? lastLog.weight : 0

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newView = scrollLeft > width / 2 ? 'chart' : 'list'; // chart is now on the right
    if (newView !== activeView) {
      setActiveView(newView);
    }
  };

  const scrollToView = (view: 'list' | 'chart') => {
    setActiveView(view);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: view === 'list' ? 0 : width, // list is 0, chart is width
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (selectedSet > 0) {
      if (logOfToday) {
        setCurrentWeightInput(String(logOfToday.weight))
        setCurrentRepsInput(String(logOfToday.repsDone))
      } else {
        setCurrentWeightInput("")
        setCurrentRepsInput("")
      }
    }
  }, [selectedSet, logOfToday?.weight, logOfToday?.repsDone])

  const handleSave = async () => {
    if (!currentWeightInput || !currentRepsInput || selectedSet === 0) return

    try {
      await logExercise({
        workoutExerciseId: workoutExercise.id,
        setNumber: selectedSet,
        weight: Number(currentWeightInput),
        repsDone: Number(currentRepsInput)
      })
      
      if (onSetComplete) {
        onSetComplete()
      }
      
      // Auto-advance if not the last set
      if (selectedSet < sets) {
        setTimeout(() => setSelectedSet(selectedSet + 1), 500)
      }
    } catch (error) {
      console.error("Erro ao salvar série.", error)
    }
  }

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditForm({
      name: exerciseData.name,
      imageUrl: exerciseData.imageUrl || "",
      sets: String(sets),
      reps: reps
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.sets || !editForm.reps) {
      return
    }
    try {
      await updateExercise({
        workoutExerciseId: workoutExercise.id,
        data: {
          name: editForm.name,
          imageUrl: editForm.imageUrl,
          sets: Number(editForm.sets),
          reps: editForm.reps
        }
      })
      setIsEditModalOpen(false)
    } catch (error: any) {
      console.error("Erro ao atualizar exercício.", error)
    }
  }

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateExercise({
        workoutExerciseId: workoutExercise.id,
        data: { isActive: !workoutExercise.isActive }
      })
    } catch (error) {
      console.error("Erro ao alterar status do exercício.", error)
    }
  }

  return (
    <Card className={cn(
      "p-0 bg-zinc-900 border overflow-hidden hover:border-zinc-700 transition-colors",
      !workoutExercise.isActive ? 'opacity-50 grayscale border-zinc-800' : 
      isFullyCompleted ? 'border-emerald-500/50' :
      isActiveExercise ? 'border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-zinc-800'
    )}>
      <CardContent className="p-0 border-0">

        {/* Cabeçalho do Exercício (Sempre visível) */}
        <div
          className="relative flex items-center cursor-pointer min-h-[150px] sm:min-h-[160px] overflow-hidden"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Background Image com Overlay */}
          {exerciseData.imageUrl ? (
            <>
              <img
                src={exerciseData.imageUrl}
                alt={exerciseData.name}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-60 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-end pr-10 opacity-20">
              <Dumbbell className="w-24 h-24 text-zinc-800" />
            </div>
          )}

          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-3 pr-8 line-clamp-2 drop-shadow-lg">{exerciseData.name}</h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 bg-zinc-950/60 backdrop-blur-md border border-zinc-800/80 shadow-sm px-3 py-1.5 rounded-lg">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="font-semibold text-zinc-200">{sets} séries</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950/60 backdrop-blur-md border border-zinc-800/80 shadow-sm px-3 py-1.5 rounded-lg">
                <span className="font-semibold text-zinc-200">{reps} reps</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3">
              {Array.from({ length: sets }).map((_, i) => {
                const s = i + 1
                const isSetCompleted = todayLogsFull.some((l: any) => l.setNumber === s)
                const isSetActive = isActiveExercise && progressState.currentSet === s

                return (
                  <div 
                    key={s} 
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      isSetCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                      isSetActive ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)] animate-pulse scale-125" :
                      "bg-zinc-700"
                    )} 
                  />
                )
              })}
            </div>

            {/* Ícone de Expansão */}
            <div className="absolute right-12 sm:right-16 top-1/2 -translate-y-1/2 text-zinc-300">
              {isExpanded ? <ChevronUp className="w-6 h-6 drop-shadow-lg" /> : <ChevronDown className="w-6 h-6 drop-shadow-lg" />}
            </div>

            {/* Menu de Ações */}
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                } />
                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-100 w-48">
                  <DropdownMenuItem onClick={handleOpenEdit} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 py-2.5">
                    <Edit2 className="w-4 h-4 mr-2 text-zinc-400" />
                    <span>Editar Exercício</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleActive} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 py-2.5">
                    {workoutExercise.isActive ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-2 text-red-400" />
                        <span className="text-red-400">Desativar</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2 text-emerald-400" />
                        <span className="text-emerald-400">Reativar</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Área Expandida (Estatísticas e Inputs) */}
        {isExpanded && (
          <div className="border-t border-zinc-800 bg-zinc-950/50 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">

            {/* Título e Controles de Visualização */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="text-white font-medium">
                  {selectedSet === 0 ? "Média de Peso (Histórico)" : `Histórico - Série ${selectedSet}`}
                </h4>
              </div>
              <div className="flex gap-1 bg-zinc-900 p-1 rounded-full border border-zinc-800">
                <button
                  onClick={() => scrollToView('list')}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${activeView === 'list' ? 'bg-primary text-primary-foreground' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollToView('chart')}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${activeView === 'chart' ? 'bg-primary text-primary-foreground' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Container Swipeable */}
            <div className="mb-6 relative">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex w-full snap-x snap-mandatory overflow-x-auto hide-scrollbar"
              >
                {/* Visualização 1: Lista */}
                <div className="w-full flex-shrink-0 snap-center px-1">
                  <div className="h-48 w-full overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                    {chartData.length > 0 ? (
                      [...chartData].reverse().map((log: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 relative">
                          <div className="flex items-center gap-3">
                            <div className="bg-zinc-800 rounded-md p-2 text-zinc-400">
                              <Dumbbell className="w-4 h-4" />
                            </div>
                            <span className="text-zinc-300 text-sm font-medium">{log.date}</span>
                            {index === 0 && (
                              <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
                                Último
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-white font-bold">{log.weight} kg</span>
                              <span className="text-zinc-500 text-xs ml-2">x {log.repsDone} reps</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-500 text-sm bg-zinc-900/30 rounded-lg border border-zinc-800/50 border-dashed">
                        Nenhum dado registrado para esta série ainda.
                      </div>
                    )}
                  </div>
                </div>

                {/* Visualização 2: Gráfico */}
                <div className="w-full flex-shrink-0 snap-center px-1">
                  <div className="h-48 w-full">
                    {chartData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-full w-full">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-500 text-sm bg-zinc-900/30 rounded-lg border border-zinc-800/50 border-dashed">
                        Nenhum dado registrado para esta série ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-3">
                <button onClick={() => scrollToView('list')} className={`w-1.5 h-1.5 rounded-full transition-all ${activeView === 'list' ? 'bg-primary w-3' : 'bg-zinc-700'}`} aria-label="Ver lista" />
                <button onClick={() => scrollToView('chart')} className={`w-1.5 h-1.5 rounded-full transition-all ${activeView === 'chart' ? 'bg-primary w-3' : 'bg-zinc-700'}`} aria-label="Ver gráfico" />
              </div>
            </div>

            {/* Abas das Séries */}
            <div className="flex w-full bg-zinc-900 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar border border-zinc-800">
              <button
                onClick={() => setSelectedSet(0)}
                className={`flex-1 min-w-[80px] py-2.5 px-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${selectedSet === 0
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
              >
                Média
              </button>
              {setsArray.map((setNum) => {
                const isSetDone = chartData && historyData[setNum]?.some((log: any) => log.date === todayStr);
                return (
                  <button
                    key={setNum}
                    onClick={() => setSelectedSet(setNum)}
                    className={`flex-1 min-w-[80px] py-2.5 px-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${selectedSet === setNum
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isSetDone 
                        ? "text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800/50" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      }`}
                  >
                    Série {setNum}
                    {isSetDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                )
              })}
            </div>

            {/* Área de Input (Apenas visível se uma série específica estiver selecionada) */}
            {selectedSet > 0 && (
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Último peso nesta série:</p>
                    <p className="text-xl font-bold text-white">{lastWeight ? `${lastWeight} kg` : "-"}</p>
                    {lastLog && (
                      <p className="text-xs text-zinc-500 mt-1">{lastLog.repsDone} reps</p>
                    )}
                  </div>

                  <div className="flex items-end gap-2 w-full sm:w-auto flex-wrap">
                    <div className="space-y-1 flex-1 min-w-[80px]">
                      <label className="text-xs text-zinc-400">Peso hoje (kg)</label>
                      <Input
                        type="number"
                        placeholder={lastWeight ? String(lastWeight) : "0"}
                        value={currentWeightInput}
                        onChange={(e) => setCurrentWeightInput(e.target.value)}
                        disabled={isCompleted}
                        className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-primary h-10 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[80px]">
                      <label className="text-xs text-zinc-400">Reps feitas</label>
                      <Input
                        type="number"
                        placeholder="Ex: 10"
                        value={currentRepsInput}
                        onChange={(e) => setCurrentRepsInput(e.target.value)}
                        disabled={isCompleted}
                        className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-primary h-10 disabled:opacity-50"
                      />
                    </div>
                    <Button
                      onClick={handleSave}
                      className="h-10 px-4 bg-primary hover:bg-primary/90 text-white w-full sm:w-auto disabled:opacity-50"
                      disabled={!currentWeightInput || !currentRepsInput || isSaving || isCompleted}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {isSaving ? "Salvando..." : (logOfToday ? "Atualizar" : "Salvar")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Dica para selecionar série */}
            {selectedSet === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4 bg-zinc-900 rounded-lg border border-zinc-800/50">
                Selecione uma série acima para registrar o peso e reps do treino de hoje.
              </p>
            )}

          </div>
        )}
      </CardContent>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Editar Exercício</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Altere os detalhes do exercício para este treino.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-image" className="text-zinc-300">URL da Imagem (Opcional)</Label>
              <Input
                id="edit-image"
                value={editForm.imageUrl}
                onChange={e => setEditForm(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="Link da imagem..."
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-zinc-300">Nome do Exercício *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Supino Reto"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sets" className="text-zinc-300">Séries *</Label>
                <Input
                  id="edit-sets"
                  type="number"
                  value={editForm.sets}
                  onChange={e => setEditForm(p => ({ ...p, sets: e.target.value }))}
                  placeholder="Ex: 4"
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reps" className="text-zinc-300">Repetições *</Label>
                <Input
                  id="edit-reps"
                  value={editForm.reps}
                  onChange={e => setEditForm(p => ({ ...p, reps: e.target.value }))}
                  placeholder="Ex: 10-12"
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
