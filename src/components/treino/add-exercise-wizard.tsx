import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Image as ImageIcon, Plus, ArrowLeft, Loader2, Dumbbell, Save, X, Filter } from "lucide-react"

interface CatalogExercise {
  id: string
  name: string
  imageUrl?: string | null
  muscleGroup?: string | null
}

interface AddExerciseWizardProps {
  isOpen: boolean
  onClose: () => void
  catalogExercises: CatalogExercise[] | undefined
  isLoadingCatalog?: boolean
  currentExercises: { exercise: { name: string } }[] | undefined
  onAdd: (data: { name: string; image: string; sets: string; reps: string; weightType: string }) => Promise<void>
  isAdding: boolean
  defaultSets?: string
  defaultReps?: string
}

export function AddExerciseWizard({
  isOpen,
  onClose,
  catalogExercises,
  isLoadingCatalog,
  currentExercises,
  onAdd,
  isAdding,
  defaultSets = "4",
  defaultReps = "10-12"
}: AddExerciseWizardProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [catalogSearch, setCatalogSearch] = useState("")
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [displayCount, setDisplayCount] = useState(20)
  
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    sets: defaultSets,
    reps: defaultReps,
    weightType: "TOTAL"
  })

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setCatalogSearch("")
      setSelectedMuscle(null)
      setExpandedImage(null)
      setShowFilters(false)
      setDisplayCount(20)
      setFormData({
        name: "",
        image: "",
        sets: defaultSets,
        reps: defaultReps,
        weightType: "TOTAL"
      })
    }
  }, [isOpen, defaultSets, defaultReps])

  useEffect(() => {
    setDisplayCount(20)
  }, [catalogSearch, selectedMuscle])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setDisplayCount(prev => prev + 20)
    }
  }

  const handleSelectCatalog = (ex: CatalogExercise) => {
    setFormData(prev => ({
      ...prev,
      name: ex.name,
      image: ex.imageUrl || ""
    }))
    setStep(2)
  }

  const handleCustomExercise = () => {
    setFormData(prev => ({
      ...prev,
      name: catalogSearch || "",
      image: ""
    }))
    setStep(2)
  }

  const handleSubmit = async () => {
    await onAdd(formData)
  }

  const currentExerciseNames = currentExercises?.map(we => we.exercise.name) || []
  const availableExercises = catalogExercises?.filter(ex => !currentExerciseNames.includes(ex.name)) || []
  
  const muscleGroups = Array.from(new Set(
    (catalogExercises || [])
      .map(ex => ex.muscleGroup)
      .filter(Boolean)
  )).sort() as string[]

  let filteredExercises = availableExercises
  if (selectedMuscle) {
    filteredExercises = filteredExercises.filter(ex => ex.muscleGroup === selectedMuscle)
  }
  if (catalogSearch) {
    filteredExercises = filteredExercises.filter(ex => ex.name.toLowerCase().includes(catalogSearch.toLowerCase()))
  }

  const displayedExercises = filteredExercises.slice(0, displayCount)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-2xl w-full h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden">
        {step === 1 ? (
          <>
            <DialogHeader className="px-6 py-6 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl shrink-0">
              <DialogTitle className="text-2xl font-bold text-white tracking-tight">Buscar Exercício</DialogTitle>
              <DialogDescription className="text-zinc-400 text-base">
                Selecione um exercício do catálogo ou crie o seu.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 sm:p-6 border-b border-zinc-800/50 bg-zinc-950/80 shrink-0 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Qual exercício você quer adicionar?"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="pl-12 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-14 text-lg rounded-xl"
                    autoFocus
                  />
                </div>
                {muscleGroups.length > 0 && (
                  <Button 
                    variant="outline" 
                    className={`h-14 px-4 rounded-xl border-zinc-800 transition-colors ${showFilters || selectedMuscle ? 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 hover:text-primary' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              {showFilters && muscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <button
                    onClick={() => { setSelectedMuscle(null); setShowFilters(false); }}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedMuscle === null 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Todos
                  </button>
                  {muscleGroups.map(m => (
                    <button
                      key={m}
                      onClick={() => { setSelectedMuscle(m); setShowFilters(false); }}
                      className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                        selectedMuscle === m 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
              {/* Show active filter pill when filters are collapsed */}
              {!showFilters && selectedMuscle && (
                <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                  <span className="text-sm text-zinc-500">Filtro:</span>
                  <button
                    onClick={() => setSelectedMuscle(null)}
                    className="flex items-center gap-1 shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 capitalize"
                  >
                    {selectedMuscle}
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar" onScroll={handleScroll}>

              {catalogSearch.length > 0 && !filteredExercises.find(e => e.name.toLowerCase() === catalogSearch.toLowerCase()) && (
                <button
                  onClick={handleCustomExercise}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/50 bg-primary/10 hover:bg-primary/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-primary group-hover:text-primary-foreground transition-colors">Criar "{catalogSearch}"</p>
                      <p className="text-sm text-primary/70">Adicionar como exercício personalizado</p>
                    </div>
                  </div>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isLoadingCatalog ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/50">
                      <div className="w-16 h-16 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : filteredExercises.length === 0 ? (
                  !catalogSearch ? (
                    <div className="col-span-1 sm:col-span-2 text-center py-12 text-zinc-500">
                      <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      Comece a digitar para buscar exercícios.
                    </div>
                  ) : null
                ) : (
                  displayedExercises.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectCatalog(ex)}
                      className="flex items-center gap-4 p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-left group"
                    >
                      {ex.imageUrl ? (
                        <div 
                          className="relative group/img shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedImage(ex.imageUrl as string);
                          }}
                        >
                          <img src={ex.imageUrl} alt={ex.name} className="w-16 h-16 rounded-lg object-cover bg-zinc-800 shadow-sm" />
                          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity cursor-zoom-in">
                            <Search className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600 shadow-sm shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{ex.name}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              {!isLoadingCatalog && displayedExercises.length < filteredExercises.length && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="px-4 py-4 sm:px-6 sm:py-6 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl shrink-0 flex flex-row items-center gap-4 space-y-0">
              <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="shrink-0 text-zinc-400 hover:text-white rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">Configurar Exercício</DialogTitle>
                <DialogDescription className="text-zinc-400 text-sm sm:text-base">
                  Defina as séries, repetições e o tipo de peso.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-6">
                
                {/* Cabeçalho do exercício selecionado */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                   {formData.image ? (
                     <img src={formData.image} alt={formData.name} className="w-20 h-20 rounded-xl object-cover bg-zinc-950 shadow-sm" />
                   ) : (
                     <div className="w-20 h-20 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-600 shadow-sm">
                       <Dumbbell className="w-8 h-8" />
                     </div>
                   )}
                   <div>
                     <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Selecionado</p>
                     <h3 className="text-lg sm:text-xl font-bold text-white">{formData.name || "Exercício Personalizado"}</h3>
                   </div>
                </div>

                <div className="space-y-6 p-1">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-300">Nome do Exercício *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Supino Reto com Barra"
                      className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-zinc-300">Tipo de Peso *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, weightType: "TOTAL" }))}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.weightType === "TOTAL"
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                        }`}
                      >
                        Peso Total
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, weightType: "PER_SIDE" }))}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all text-center leading-tight ${
                          formData.weightType === "PER_SIDE"
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                        }`}
                      >
                        Peso por Lado
                        <span className="text-[10px] opacity-70 font-normal mt-0.5">(Halteres, Polia dupla)</span>
                      </button>
                    </div>
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
                        className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12 text-base text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reps" className="text-zinc-300">Repetições *</Label>
                      <Input
                        id="reps"
                        value={formData.reps}
                        onChange={e => setFormData(p => ({ ...p, reps: e.target.value }))}
                        placeholder="Ex: 10-12"
                        className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12 text-base text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="image" className="text-zinc-500 text-sm">URL da Imagem (Opcional)</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={e => setFormData(p => ({ ...p, image: e.target.value }))}
                      placeholder="Cole o link da foto do exercício..."
                      className="bg-zinc-900/50 border-zinc-800/50 text-zinc-300 focus-visible:ring-primary h-10 text-sm"
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl shrink-0 mt-auto">
              <Button
                onClick={handleSubmit}
                disabled={isAdding || !formData.name || !formData.sets || !formData.reps}
                className="w-full h-14 text-lg font-bold transition-all shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white active:scale-[0.98]"
              >
                {isAdding ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Save className="w-6 h-6 mr-2" />}
                Adicionar ao Treino
              </Button>
            </div>
          </>
        )}
      </DialogContent>
      
      {/* Image Preview Overlay */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center">
            <button 
              className="absolute -top-12 sm:-top-4 sm:-right-12 bg-zinc-800/80 hover:bg-zinc-700 p-2 rounded-full text-white transition-colors"
              onClick={() => setExpandedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={expandedImage} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </Dialog>
  )
}
