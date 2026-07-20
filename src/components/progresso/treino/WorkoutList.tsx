"use client"

import Link from "next/link"
import { Dumbbell, Calendar, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

import { useQuery } from "@tanstack/react-query"
import { WorkoutAPI } from "@/src/services/api/workout.api"
import { Skeleton } from "@/components/ui/skeleton"

const daysMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WorkoutList() {
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: WorkoutAPI.getWorkouts,
  })
  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white">Análise por Treino</h1>
        <p className="text-sm text-zinc-400">Selecione um treino para ver o progresso detalhado de cada exercício.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-zinc-900/50" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          Você ainda não possui treinos cadastrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((workout, index) => {
            const daysStr = workout.daysOfWeek.map(d => daysMap[d]).join(", ");
            return (
              <Link href={`/progresso/treino/${workout.id}`} key={workout.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex flex-col gap-4 p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 hover:border-zinc-700/50 transition-all shadow-sm group relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <div className="flex justify-between items-start relative z-10">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{workout.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {daysStr || "Sem dias definidos"}</span>
                      {workout.workoutLogs && workout.workoutLogs.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{workout.workoutLogs.length} execuções</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
