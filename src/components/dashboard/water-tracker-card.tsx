import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplet, Plus } from "lucide-react"

export function WaterTrackerCard() {
  const current = 1250
  const goal = 3000
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-500" />
          Hidratação
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" className="stroke-zinc-800 fill-none" strokeWidth="12" />
            <circle 
              cx="64" cy="64" r="56" 
              className="stroke-blue-500 fill-none transition-all duration-1000 ease-out" 
              strokeWidth="12" 
              strokeDasharray="351.85" 
              strokeDashoffset={351.85 - (351.85 * percentage) / 100} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{current}</span>
            <span className="text-xs text-zinc-400">/ {goal} ml</span>
          </div>
        </div>
        <div className="flex gap-2 w-full mt-2">
          <Button variant="outline" className="flex-1 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 text-white">
            <Plus className="w-4 h-4 mr-1" /> 250ml
          </Button>
          <Button variant="outline" className="flex-1 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 text-white">
            <Plus className="w-4 h-4 mr-1" /> 500ml
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
