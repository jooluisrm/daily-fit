import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

export function CaloriesCard() {
  const current = 1450
  const goal = 2400
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Calorias
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center gap-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{current}</span>
              <span className="text-sm text-zinc-400">consumidas</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-medium text-white">{goal}</span>
              <span className="text-sm text-zinc-400">meta diária</span>
            </div>
          </div>
          
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-1000 ease-out" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1 p-2 bg-zinc-800/50 rounded-lg">
            <span className="text-xs text-zinc-400">Carboidratos</span>
            <span className="text-sm font-medium text-white">120g <span className="text-xs text-zinc-500 font-normal">/ 250g</span></span>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-zinc-800/50 rounded-lg">
            <span className="text-xs text-zinc-400">Proteínas</span>
            <span className="text-sm font-medium text-white">85g <span className="text-xs text-zinc-500 font-normal">/ 160g</span></span>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-zinc-800/50 rounded-lg">
            <span className="text-xs text-zinc-400">Gorduras</span>
            <span className="text-sm font-medium text-white">40g <span className="text-xs text-zinc-500 font-normal">/ 70g</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
