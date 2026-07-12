import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Dumbbell, ChevronRight } from "lucide-react"

export function TreinoList() {
  const allWorkouts = [
    { id: 1, title: "Treino A - Peito e Tríceps", exercisesCount: 6, lastDone: "Segunda-feira" },
    { id: 2, title: "Treino B - Costas e Bíceps", exercisesCount: 7, lastDone: "Terça-feira" },
    { id: 3, title: "Treino C - Pernas e Abdômen", exercisesCount: 5, lastDone: "Há 1 semana" },
    { id: 4, title: "Treino D - Ombros", exercisesCount: 5, lastDone: "Nunca realizado" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Meus Treinos</h1>
          <p className="text-zinc-400 text-sm">Gerencie suas rotinas de exercícios criadas</p>
        </div>
        <Link href="/treino/new" className="w-full sm:w-auto">
          <Button className="w-full h-11 px-6 text-base font-medium shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Novo Treino
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {allWorkouts.map((workout) => (
          <Link key={workout.id} href={`/treino/${workout.id}`} className="group block">
            <Card className="bg-zinc-900 border-zinc-800 group-hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{workout.title}</h3>
                      <p className="text-sm text-zinc-400">{workout.exercisesCount} exercícios</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800/50">
                  <div className="text-xs text-zinc-500">
                    Último treino: <span className="text-zinc-300">{workout.lastDone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
