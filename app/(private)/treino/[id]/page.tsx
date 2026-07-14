"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, CalendarDays, Plus, Image as ImageIcon, Save, Trash2, Edit2, Loader2, Dumbbell, History, Pen, MoreVertical, PowerOff, Power, Search, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { useWorkouts, useUpdateWorkout } from "@/src/hooks/use-workout"
import { useWorkoutExercises, useAddExerciseToWorkout, useLogExercise, useCatalogExercises, useUpdateWorkoutExercise, useReorderWorkoutExercises } from "@/src/hooks/use-exercise"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

const DAYS_MAP = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

export default function WorkoutDetailsPage() {
  const params = useParams()
  const workoutId = params.id as string

  const { data: workouts } = useWorkouts()
  const workout = workouts?.find(w => w.id === workoutId)

  const { data: catalogExercises } = useCatalogExercises()
  const { data: exercises, isLoading: isLoadingExercises } = useWorkoutExercises(workoutId)
  const { mutateAsync: addExercise, isPending: isAdding } = useAddExerciseToWorkout(workoutId)
  const { mutateAsync: logExercise } = useLogExercise(workoutId)
  const { mutateAsync: updateExercise, isPending: isUpdatingExercise } = useUpdateWorkoutExercise(workoutId)
  const { mutateAsync: reorderExercises } = useReorderWorkoutExercises(workoutId)

  const [exerciseEditModal, setExerciseEditModal] = useState<{
    isOpen: boolean;
    workoutExerciseId: string | null;
    form: { name: string; imageUrl: string; sets: string; reps: string };
  }>({
    isOpen: false,
    workoutExerciseId: null,
    form: { name: "", imageUrl: "", sets: "", reps: "" }
  })
  const { mutateAsync: updateWorkout, isPending: isUpdating } = useUpdateWorkout(workoutId)

  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", image: "", sets: "", reps: "" })
  const [editData, setEditData] = useState<{ name: string, daysOfWeek: number[] }>({ name: "", daysOfWeek: [] })
  const [loggingState, setLoggingState] = useState<Record<string, { weight: string; repsDone: string; isSaving: boolean }>>({})
  const [catalogSearch, setCatalogSearch] = useState("")

  const [orderedExercises, setOrderedExercises] = useState(exercises || [])

  useEffect(() => {
    if (exercises) {
      setOrderedExercises(exercises)
    }
  }, [exercises])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(orderedExercises)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setOrderedExercises(items)

    try {
      await reorderExercises(items.map(item => item.id))
    } catch (error) {
      toast.error("Erro ao salvar ordem.")
      setOrderedExercises(exercises || []) // revert on error
    }
  }

  // Carregar dados iniciais no modal de edição
  const handleOpenEdit = () => {
    if (workout) {
      setEditData({ name: workout.name, daysOfWeek: workout.daysOfWeek })
      setIsEditOpen(true)
    }
  }

  const handleUpdateWorkout = async () => {
    if (!editData.name) {
      toast.error("Preencha o nome do treino.")
      return
    }

    try {
      await updateWorkout(editData)
      toast.success("Treino atualizado!")
      setIsEditOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao atualizar treino.")
    }
  }

  // Dias já alocados em outros treinos ativos (ignorando este)
  const disabledDays = workouts
    ?.filter(w => w.id !== workoutId && w.isActive)
    ?.flatMap(w => w.daysOfWeek) || []

  const toggleDay = (day: number) => {
    if (disabledDays.includes(day)) return;
    setEditData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }))
  }

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

  const handleToggleWorkoutActive = async () => {
    try {
      await updateWorkout({ isActive: !workout?.isActive })
      toast.success(workout?.isActive ? "Treino desativado!" : "Treino reativado!")
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao alterar status.")
    }
  }

  const handleSelectCatalog = (value: string | null) => {
    if (!value) return;
    const selected = catalogExercises?.find(e => e.name === value)
    if (selected) {
      setFormData(prev => ({
        ...prev,
        name: selected.name,
        image: selected.imageUrl || ""
      }))
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
    } catch (error) {
      toast.error("Erro ao salvar.")
    } finally {
      setLoggingState(prev => ({ ...prev, [workoutExerciseId]: { ...prev[workoutExerciseId], isSaving: false } }))
    }
  }

  const handleOpenExerciseEdit = (item: any) => {
    setExerciseEditModal({
      isOpen: true,
      workoutExerciseId: item.id,
      form: {
        name: item.exercise.name,
        imageUrl: item.exercise.imageUrl || "",
        sets: String(item.sets),
        reps: item.reps
      }
    })
  }

  const handleSaveExerciseEdit = async () => {
    if (!exerciseEditModal.workoutExerciseId) return
    const { name, sets, reps, imageUrl } = exerciseEditModal.form

    if (!name || !sets || !reps) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }

    try {
      await updateExercise({
        workoutExerciseId: exerciseEditModal.workoutExerciseId,
        data: { name, imageUrl, sets: Number(sets), reps }
      })
      toast.success("Exercício atualizado!")
      setExerciseEditModal(prev => ({ ...prev, isOpen: false }))
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao atualizar.")
    }
  }

  const handleToggleExerciseActive = async (item: any) => {
    try {
      await updateExercise({
        workoutExerciseId: item.id,
        data: { isActive: !item.isActive }
      })
      toast.success(item.isActive ? "Exercício desativado." : "Exercício reativado!")
    } catch (error) {
      toast.error("Erro ao alterar status.")
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-8 md:pt-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className={`mb-8 sm:mb-12 bg-zinc-900/40 p-5 sm:p-8 rounded-2xl border border-zinc-800/50 flex justify-between items-center gap-6 shadow-sm relative overflow-hidden transition-all ${!workout?.isActive ? 'opacity-70 grayscale' : ''}`}>

        {/* Elemento decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <Link href="/treino?tab=list">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              {workout?.name}
              {!workout?.isActive && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2.5 py-1 rounded-md font-semibold border border-red-500/30 uppercase tracking-wider">
                  Inativo
                </span>
              )}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary/70" />
              <span>
                {(workout?.daysOfWeek?.length ?? 0) > 0
                  ? workout?.daysOfWeek?.map((d: number) => DAYS_MAP[d]).join(", ")
                  : "Nenhum dia configurado"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="icon" onClick={handleOpenEdit} className="bg-transparent transition-colors cursor-pointer">
                  <Pen className="w-4 h-4" />
                </Button>
              }
            />
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Editar Treino</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Altere o nome ou os dias da semana para este treino.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-zinc-300">Nome do Treino *</Label>
                  <Input
                    id="edit-name"
                    value={editData.name}
                    onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Treino A - Peito e Tríceps"
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {DAYS_MAP.map((day, index) => {
                      const isSelected = editData.daysOfWeek.includes(index)
                      const isDisabled = disabledDays.includes(index)
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(index)}
                          disabled={isDisabled}
                          title={isDisabled ? "Você já possui um treino neste dia" : ""}
                          className={`w-11 h-11 rounded-lg text-xs font-semibold transition-all ${isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : isDisabled
                              ? "bg-zinc-900/50 text-zinc-600 border border-zinc-800/50 cursor-not-allowed"
                              : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
                            }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleUpdateWorkout}
                  disabled={isUpdating}
                  className="w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex gap-2 shrink-0 self-end md:self-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleWorkoutActive}
              disabled={isUpdating}
              title={workout?.isActive ? "Desativar Treino" : "Reativar Treino"}
              className={`bg-transparent transition-colors cursor-pointer ${workout?.isActive ? 'border-red-900/50 text-red-400 hover:bg-red-950/80 hover:text-red-300 hover:border-red-800' : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-800'}`}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (workout?.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />)}
            </Button>
          </div>
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
          <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-lg w-full overflow-y-auto p-0 flex flex-col">
            <SheetHeader className="px-6 py-6 border-b border-zinc-800/50 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-10">
              <SheetTitle className="text-2xl font-bold text-white tracking-tight">Novo Exercício</SheetTitle>
              <SheetDescription className="text-zinc-400 text-base">
                Preencha os detalhes para adicioná-lo ao treino.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 p-6 flex-1">

              {catalogExercises && (
                (() => {
                  // Filtra os exercícios que já estão no treino atual
                  const currentExerciseNames = exercises?.map(we => we.exercise.name) || []
                  const availableExercises = catalogExercises.filter(ex => !currentExerciseNames.includes(ex.name))

                  if (availableExercises.length === 0) return null;

                  const filteredExercises = availableExercises.filter(ex => ex.name.toLowerCase().includes(catalogSearch.toLowerCase()))

                  return (
                    <div className="space-y-4 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800/50">
                      <div>
                        <Label className="text-zinc-300 font-semibold text-sm">Adicionar do Catálogo</Label>
                        <p className="text-xs text-zinc-500 mb-1 mt-1">Pesquise e selecione um exercício para preencher automaticamente.</p>
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <Input
                          placeholder="Buscar exercício..."
                          value={catalogSearch}
                          onChange={e => setCatalogSearch(e.target.value)}
                          className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus-visible:ring-primary h-10"
                        />
                      </div>

                      <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredExercises.length === 0 ? (
                          <div className="text-center py-6 text-zinc-500 text-sm">Nenhum exercício encontrado.</div>
                        ) : (
                          filteredExercises.map(ex => (
                            <div
                              key={ex.id}
                              onClick={() => handleSelectCatalog(ex.name)}
                              className="flex items-center gap-4 p-3 rounded-xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-800/80 cursor-pointer transition-colors group"
                            >
                              {ex.imageUrl ? (
                                <img src={ex.imageUrl} alt={ex.name} className="w-20 h-20 rounded-lg object-cover bg-zinc-800 shadow-sm shrink-0" />
                              ) : (
                                <div className="w-20 h-20 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600 shadow-sm shrink-0">
                                  <ImageIcon className="w-8 h-8" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{ex.name}</p>
                              </div>
                              <Plus className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })()
              )}

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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="exercises-list">
            {(provided) => (
              <div
                className="space-y-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {orderedExercises.map((item, index) => {
                  const lastLog = item.logs?.[0]

                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                          className={`bg-zinc-900 border-zinc-800 p-4 sm:p-5 gap-4 relative transition-colors ${!item.isActive ? 'opacity-50 grayscale' : ''} ${snapshot.isDragging ? 'shadow-2xl shadow-primary/20 border-primary/50 z-50 ring-1 ring-primary/50' : ''}`}
                        >
                          {/* Menu de Ações (3 pontinhos) */}

                          <div className="flex justify-between items-center gap-3 sm:gap-4">
                            {/* Top: Info */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className=" shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {item.exercise.imageUrl ? (
                                <img src={item.exercise.imageUrl} alt={item.exercise.name} className="w-24 h-24 rounded-lg object-cover bg-zinc-800 shrink-0" />
                              ) : (
                                <div className="w-24 h-24 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                  <Dumbbell className="w-10 h-10 text-zinc-600" />
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
                            <DropdownMenu>
                              <DropdownMenuTrigger render={
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white w-8 h-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              } />
                              <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-100 w-48">
                                <DropdownMenuItem onClick={() => handleOpenExerciseEdit(item)} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 py-2.5">
                                  <Edit2 className="w-4 h-4 mr-2 text-zinc-400" />
                                  <span>Editar Exercício</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleExerciseActive(item)} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 py-2.5">
                                  {item.isActive ? (
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
                        </Card>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Modal de Edição de Exercício */}
      <Dialog open={exerciseEditModal.isOpen} onOpenChange={(open) => setExerciseEditModal(p => ({ ...p, isOpen: open }))}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Editar Exercício</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Altere os detalhes do exercício para este treino.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ex-image" className="text-zinc-300">URL da Imagem (Opcional)</Label>
              <Input
                id="edit-ex-image"
                value={exerciseEditModal.form.imageUrl}
                onChange={e => setExerciseEditModal(p => ({ ...p, form: { ...p.form, imageUrl: e.target.value } }))}
                placeholder="Link da imagem..."
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ex-name" className="text-zinc-300">Nome do Exercício *</Label>
              <Input
                id="edit-ex-name"
                value={exerciseEditModal.form.name}
                onChange={e => setExerciseEditModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))}
                placeholder="Ex: Supino Reto"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ex-sets" className="text-zinc-300">Séries *</Label>
                <Input
                  id="edit-ex-sets"
                  type="number"
                  value={exerciseEditModal.form.sets}
                  onChange={e => setExerciseEditModal(p => ({ ...p, form: { ...p.form, sets: e.target.value } }))}
                  placeholder="Ex: 4"
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ex-reps" className="text-zinc-300">Repetições *</Label>
                <Input
                  id="edit-ex-reps"
                  value={exerciseEditModal.form.reps}
                  onChange={e => setExerciseEditModal(p => ({ ...p, form: { ...p.form, reps: e.target.value } }))}
                  placeholder="Ex: 10-12"
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveExerciseEdit}
              disabled={isUpdatingExercise}
              className="w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              {isUpdatingExercise ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
