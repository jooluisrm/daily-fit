import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Clock, Flame } from "lucide-react"

export function TodayWorkoutCard() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          Treino de Hoje
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Peito, Ombro e Tríceps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-1 text-sm text-zinc-300 bg-zinc-800 px-2 py-1 rounded-md">
            <Clock className="w-4 h-4 text-zinc-400" />
            60 min
          </div>
          <div className="flex items-center gap-1 text-sm text-zinc-300 bg-zinc-800 px-2 py-1 rounded-md">
            <Flame className="w-4 h-4 text-zinc-400" />
            350 kcal
          </div>
        </div>
        <Button className="w-full text-base font-medium">
          Iniciar Treino
        </Button>
      </CardContent>
    </Card>
  )
}
