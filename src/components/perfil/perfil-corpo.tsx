"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Scale, Save, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useUpdateProfile } from "@/src/hooks/use-user"
import { toast } from "sonner"

export function PerfilCorpo() {
  const { data: session, update } = useSession()
  const user = session?.user as any

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()

  const [gender, setGender] = useState<string>("")
  const [age, setAge] = useState<number | "">("")
  const [height, setHeight] = useState<number | "">("")
  const [weight, setWeight] = useState<number | "">("")

  // Atualiza os states assim que a sessão carrega
  useEffect(() => {
    if (user) {
      if (user.gender) setGender(user.gender)
      if (user.age) setAge(user.age)
      if (user.height) setHeight(user.height)
      if (user.weight) setWeight(user.weight)
    }
  }, [user])

  // Flag global se tudo está vazio
  const isEmpty = !user?.age && !user?.height && !user?.weight && !user?.gender;

  // Se a pessoa já preencheu os campos, não pintamos de vermelho enquanto digita
  // Só pintamos de vermelho se o perfil no geral estiver incompleto e o campo estiver vazio
  const isProfileComplete = user?.isProfileComplete;
  
  const isGenderMissing = !isProfileComplete && !gender;
  const isAgeMissing = !isProfileComplete && !age;
  const isHeightMissing = !isProfileComplete && !height;
  const isWeightMissing = !isProfileComplete && !weight;

  // Cálculo da TMB (Mifflin-St Jeor)
  const calculateTMB = () => {
    if (!age || !height || !weight) return 0
    let tmb = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age)
    if (gender === "male") {
      tmb += 5
    } else if (gender === "female") {
      tmb -= 161
    }
    return Math.round(tmb)
  }

  const tmb = calculateTMB()

  const handleSave = async () => {
    if (!age || !height || !weight || !gender) {
      toast.error("Preencha todos os campos obrigatórios para salvar.");
      return;
    }

    try {
      await updateProfile({
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        gender
      })

      // Atualiza o JWT do NextAuth em memória
      await update({
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        gender,
        isProfileComplete: !!(user?.firstName && age && height && weight && gender)
      })

      toast.success("Medidas salvas com sucesso!")
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar as medidas.")
      console.error(error)
    }
  }

  const isSaveDisabled = 
    isPending || 
    !age || 
    !height || 
    !weight || 
    !gender || 
    (age === (user?.age || "") && 
     height === (user?.height || "") && 
     weight === (user?.weight || "") && 
     gender === (user?.gender || ""));

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
          <Label className={isGenderMissing ? "text-red-400" : "text-zinc-300"}>Sexo Biológico *</Label>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setGender("male")}
              className={`flex-1 h-12 text-base font-medium transition-all border ${gender === "male" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : isGenderMissing ? "bg-red-500/10 border-red-500 text-red-400 hover:text-red-300 hover:bg-red-500/20" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
            >
              Masculino
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setGender("female")}
              className={`flex-1 h-12 text-base font-medium transition-all border ${gender === "female" ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : isGenderMissing ? "bg-red-500/10 border-red-500 text-red-400 hover:text-red-300 hover:bg-red-500/20" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
            >
              Feminino
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age" className={isAgeMissing ? "text-red-400" : "text-zinc-300"}>Idade *</Label>
            <Input 
              id="age" 
              type="number"
              value={age || ""}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="Ex: 25"
              className={`bg-zinc-900 text-white focus-visible:ring-primary h-12 ${isAgeMissing ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-800"}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className={isHeightMissing ? "text-red-400" : "text-zinc-300"}>Altura (cm) *</Label>
            <Input 
              id="height" 
              type="number"
              value={height || ""}
              onChange={(e) => setHeight(Number(e.target.value))}
              placeholder="Ex: 175"
              className={`bg-zinc-900 text-white focus-visible:ring-primary h-12 ${isHeightMissing ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-800"}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className={isWeightMissing ? "text-red-400" : "text-zinc-300"}>Peso Atual (kg) *</Label>
            <Input 
              id="weight" 
              type="number"
              value={weight || ""}
              onChange={(e) => setWeight(Number(e.target.value))}
              placeholder="Ex: 75.5"
              className={`bg-zinc-900 text-white focus-visible:ring-primary h-12 ${isWeightMissing ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-800"}`}
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaveDisabled}
          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar Medidas
        </Button>
      </div>
    </div>
  )
}
