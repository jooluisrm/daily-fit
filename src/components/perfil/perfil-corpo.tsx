"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Scale, Save } from "lucide-react"

export function PerfilCorpo() {
  const [gender, setGender] = useState<string>("male")
  const [age, setAge] = useState<number>(25)
  const [height, setHeight] = useState<number>(175)
  const [weight, setWeight] = useState<number>(75)

  // Cálculo da TMB (Mifflin-St Jeor)
  const calculateTMB = () => {
    if (!age || !height || !weight) return 0
    let tmb = 10 * weight + 6.25 * height - 5 * age
    if (gender === "male") {
      tmb += 5
    } else {
      tmb -= 161
    }
    return Math.round(tmb)
  }

  const tmb = calculateTMB()

  return (
    <div className="space-y-8">
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="bg-primary/10 p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Scale className="w-8 h-8" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-zinc-300 font-medium mb-1">Sua Taxa Metabólica Basal (TMB)</h3>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-4xl font-bold text-white">{tmb}</span>
              <span className="text-primary font-medium">kcal / dia</span>
            </div>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">
              Essa é a quantidade estimada de calorias que seu corpo queima em repouso.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-zinc-300">Sexo Biológico</Label>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setGender("male")}
              className={`flex-1 h-12 text-base font-medium transition-all border ${gender === "male" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
            >
              Masculino
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setGender("female")}
              className={`flex-1 h-12 text-base font-medium transition-all border ${gender === "female" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
            >
              Feminino
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-zinc-300">Idade</Label>
            <Input 
              id="age" 
              type="number"
              value={age || ""}
              onChange={(e) => setAge(Number(e.target.value))}
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="text-zinc-300">Altura (cm)</Label>
            <Input 
              id="height" 
              type="number"
              value={height || ""}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-zinc-300">Peso Atual (kg)</Label>
            <Input 
              id="weight" 
              type="number"
              value={weight || ""}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20">
          <Save className="w-5 h-5 mr-2" />
          Salvar Medidas
        </Button>
      </div>
    </div>
  )
}
