import { Metadata } from "next"
import { ExerciseDashboard } from "@/src/components/progresso/exercicio/ExerciseDashboard"

export const metadata: Metadata = {
  title: "Análise do Exercício | Daily Fit",
  description: "Acompanhe o progresso detalhado de um exercício específico.",
}

// Next.js 15 async params
export default async function SpecificExercisePage({ params }: { params: Promise<{ workoutId: string, exerciseId: string }> }) {
  const { workoutId, exerciseId } = await params

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8 md:pt-8">
      <ExerciseDashboard workoutId={workoutId} exerciseId={exerciseId} />
    </div>
  )
}
