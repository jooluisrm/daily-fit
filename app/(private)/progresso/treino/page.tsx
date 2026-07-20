import { Metadata } from "next"
import { WorkoutList } from "@/src/components/progresso/treino/WorkoutList"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Selecionar Treino | Daily Fit",
  description: "Selecione um treino para analisar seu progresso.",
}

export default function SelectWorkoutPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8 md:pt-8 flex flex-col gap-6">
      <Link href="/progresso" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Progresso Geral
      </Link>
      
      <WorkoutList />
    </div>
  )
}
