"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, CalendarDays, Plus, Image as ImageIcon, Save, Trash2, Edit2, Loader2, Dumbbell, History } from "lucide-react"
import { useWorkouts } from "@/src/hooks/use-workout"
import { useWorkoutExercises, useAddExerciseToWorkout, useLogExercise } from "@/src/hooks/use-exercise"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

const DAYS_MAP = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

export default function WorkoutDetailsPage() {
  const params = useParams()
  const workoutId = params.id as string

  const { data: workouts } = useWorkouts()
  const workout = workouts?.find(w => w.id === workoutId)

  const { data: exercises, isLoading: isLoadingExercises } = useWorkoutExercises(workoutId)
  const { mutateAsync: addExercise, isPending: isAdding } = useAddExerciseToWorkout(workoutId)
  const { mutateAsync: logExercise } = useLogExercise(workoutId)

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", image: "", sets: "", reps: "" })
  const [loggingState, setLoggingState] = useState<Record<string, { weight: string; repsDone: string; isSaving: boolean }>>({})

  const handleAddExercise = async () => {
    if (!formData.name || !formData.sets || !formData.reps) {
      toast.error("Preencha o nome, séries e repetições.")
      return
    }

    try {
      await addExercise({
        name: formData.name,
        image: formData.image,
        sets: Number(formData.sets),
        reps: formData.reps
      })
      toast.success("Exercício adicionado!")
      setIsOpen(false)
      setFormData({ name: "", image: "", sets: "", reps: "" })
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao adicionar.")
    }
  }

  const handleLogChange = (exerciseId: string, field: 'weight' | 'repsDone', value: string) => {
    setLoggingState(prev => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value }
    }))
  }

  const handleSaveLog = async (workoutExerciseId: string) => {
    const state = loggingState[workoutExerciseId]
    if (!state?.weight || !state?.repsDone) {
      toast.error("Preencha peso e repetições executadas.")
      return
    }

    setLoggingState(prev => ({ ...prev, [workoutExerciseId]: { ...prev[workoutExerciseId], isSaving: true } }))
    try {
      await logExercise({
        workoutExerciseId,
        setNumber: 1, // Fallback para a tela antiga
        weight: Number(state.weight),
        repsDone: Number(state.repsDone)
      })
      toast.success("Progresso salvo!")
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao salvar log.")
    } finally {
      setLoggingState(prev => ({ ...prev, [workoutExerciseId]: { ...prev[workoutExerciseId], isSaving: false } }))
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-8 md:pt-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <Link href="/treino" className="mt-1">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-primary font-medium mb-1">
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">
                {workout?.daysOfWeek?.length 
                  ? workout.daysOfWeek.sort().map(d => DAYS_MAP[d]).join(", ") 
                  : "Sem dias definidos"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{workout?.name || "Carregando..."}</h1>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 self-end md:self-auto">
          <Button variant="outline" size="icon" className="bg-transparent border-red-900/50 text-red-400 hover:bg-red-950/80 hover:text-red-300 hover:border-red-800 transition-colors">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Área de Exercícios */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Modo Treino</h2>
          <p className="text-sm text-zinc-400">Anote os pesos do dia para acompanhar sua evolução</p>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={
            <Button className="w-full md:w-auto h-11 px-6 text-base font-medium shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white" />
          }>
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Exercício
          </SheetTrigger>
          <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full overflow-y-auto p-0 flex flex-col">
            <SheetHeader className="px-6 py-6 border-b border-zinc-800/50 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-10">
              <SheetTitle className="text-2xl font-bold text-white tracking-tight">Novo Exercício</SheetTitle>
              <SheetDescription className="text-zinc-400 text-base">
                Preencha os detalhes para adicioná-lo ao treino.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 p-6 flex-1">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-zinc-300">URL da Imagem (Opcional)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="image" 
                    value={formData.image}
                    onChange={e => setFormData(p => ({ ...p, image: e.target.value }))}
                    placeholder="Cole o link da foto do exercício..." 
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Nome do Exercício *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Supino Reto com Barra" 
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets" className="text-zinc-300">Séries *</Label>
                  <Input 
                    id="sets" 
                    type="number"
                    value={formData.sets}
                    onChange={e => setFormData(p => ({ ...p, sets: e.target.value }))}
                    placeholder="Ex: 4" 
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps" className="text-zinc-300">Repetições *</Label>
                  <Input 
                    id="reps" 
                    value={formData.reps}
                    onChange={e => setFormData(p => ({ ...p, reps: e.target.value }))}
                    placeholder="Ex: 10-12" 
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                  />
                </div>
              </div>

              <div className="pt-4 pb-8">
                <Button 
                  onClick={handleAddExercise}
                  disabled={isAdding}
                  className="w-full h-12 text-base font-semibold transition-colors shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Cadastrar Exercício
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Lista */}
      {isLoadingExercises ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : !exercises || exercises.length === 0 ? (
        <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center mt-8">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">Nenhum exercício cadastrado</h3>
          <p className="text-zinc-500 max-w-sm">
            Clique no botão "Adicionar Exercício" acima para começar a montar o seu treino.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((item) => {
            const lastLog = item.logs?.[0]
            const state = loggingState[item.id] || { weight: "", repsDone: "", isSaving: false }

            return (
              <Card key={item.id} className="bg-zinc-900 border-zinc-800 p-4 sm:p-5 flex flex-col gap-4">
                {/* Top: Info */}
                <div className="flex items-start gap-4">
                  {item.exercise.imageUrl ? (
                    <img src={item.exercise.imageUrl} alt={item.exercise.name} className="w-16 h-16 rounded-lg object-cover bg-zinc-800 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-1">{item.exercise.name}</h3>
                    <div className="text-zinc-400 text-sm flex items-center gap-2">
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-medium">Meta: {item.sets}x {item.reps}</span>
                    </div>

                    {lastLog && (
                      <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
                        <History className="w-3 h-3" />
                        Último treino: {lastLog.weight}kg, {lastLog.repsDone} reps
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
