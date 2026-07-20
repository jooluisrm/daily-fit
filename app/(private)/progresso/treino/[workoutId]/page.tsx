import { Metadata } from "next"
import { SpecificWorkoutDashboard } from "@/src/components/progresso/treino/SpecificWorkoutDashboard"

export const metadata: Metadata = {
  title: "Análise do Treino | Daily Fit",
  description: "Acompanhe o progresso específico deste treino.",
}

// Next.js 15 async params
export default async function SpecificWorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8 md:pt-8">
      <SpecificWorkoutDashboard workoutId={workoutId} />
    </div>
  )
}
