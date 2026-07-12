"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, CalendarDays, Plus, Image as ImageIcon, Save, Trash2, Edit2 } from "lucide-react"

export default function WorkoutDetailsPage() {
  const [exercises, setExercises] = useState<any[]>([])

  // Mock data for the created workout
  const workout = {
    id: 1,
    title: "Treino A - Peito e Tríceps",
    days: ["SEG", "QUI"],
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-8 md:pt-8 animate-in fade-in duration-300">
      {/* Header com botão voltar e ações */}
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
              <span className="text-sm">{workout.days.join(", ")}</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{workout.title}</h1>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 self-end md:self-auto">
          <Button variant="outline" size="icon" className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent border-red-900/50 text-red-400 hover:bg-red-950/80 hover:text-red-300 hover:border-red-800 transition-colors">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Área de Exercícios */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Exercícios Cadastrados</h2>
          <p className="text-sm text-zinc-400">Gerencie a lista de exercícios desta rotina</p>
        </div>
        
        <Sheet>
          <SheetTrigger render={
            <Button className="w-full md:w-auto h-11 px-6 text-base font-medium shadow-lg shadow-primary/20" />
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
                <Label htmlFor="image" className="text-zinc-300">URL da Imagem</Label>
                <div className="flex gap-2">
                  <Input 
                    id="image" 
                    placeholder="Cole o link da foto do exercício..." 
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                  />
                  <Button variant="outline" size="icon" className="shrink-0 h-11 w-11 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Nome do Exercício</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Supino Reto com Barra" 
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets" className="text-zinc-300">Séries (Sets)</Label>
                  <Input 
                    id="sets" 
                    type="number"
                    placeholder="Ex: 4" 
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps" className="text-zinc-300">Repetições</Label>
                  <Input 
                    id="reps" 
                    placeholder="Ex: 10-12" 
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-11"
                  />
                </div>
              </div>

              <div className="pt-4 pb-8">
                <Button className="w-full h-12 text-base font-semibold transition-colors shadow-lg shadow-primary/20">
                  <Save className="w-5 h-5 mr-2" />
                  Cadastrar Exercício
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Lista Vazia ou Preenchida */}
      {exercises.length === 0 ? (
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
        <div className="space-y-3">
          {/* Aqui mapearíamos os exercícios cadastrados posteriormente */}
        </div>
      )}
    </div>
  )
}
