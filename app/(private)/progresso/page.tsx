import { Metadata } from "next"
import { ProgressDashboard } from "@/src/components/progresso/ProgressDashboard"

export const metadata: Metadata = {
  title: "Progresso | Daily Fit",
  description: "Acompanhe sua evolução nos treinos, cardio e hidratação.",
}

export default function ProgressoPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8 md:pt-8">
      <ProgressDashboard />
    </div>
  )
}
