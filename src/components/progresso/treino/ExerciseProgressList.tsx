"use client"

import Link from "next/link"
import { ChevronRight, Activity } from "lucide-react"
import { motion } from "framer-motion"

import { useQuery } from "@tanstack/react-query"
import { ExerciseAPI } from "@/src/services/api/exercise.api"
import { Skeleton } from "@/components/ui/skeleton"

export function ExerciseProgressList({ workoutId }: { workoutId: string }) {
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['workout-exercises', workoutId],
    queryFn: () => ExerciseAPI.getWorkoutExercises(workoutId),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 animate-in fade-in duration-500">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[76px] rounded-xl bg-zinc-900/50" />
        ))}
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="text-zinc-500 text-sm py-4">
        Nenhum exercício cadastrado neste treino.
      </div>
    )
  }
  // In a real app, use workoutId to fetch the correct exercises.
  
  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500">
      {exercises.map((workoutExercise, index) => {
        let lastVolume = 0;
        if (workoutExercise.logs && workoutExercise.logs.length > 0) {
          // Os logs já vêm ordenados por data desc da API (o mais recente primeiro)
          // Pegar a data do log mais recente
          const mostRecentDateStr = new Date(workoutExercise.logs[0].date).toLocaleDateString();
          
          // Filtrar os logs apenas desse dia e somar o volume
          workoutExercise.logs
            .filter(log => new Date(log.date).toLocaleDateString() === mostRecentDateStr)
            .forEach(log => {
              lastVolume += log.weight * log.repsDone;
            });
        }

        return (
          <Link href={`/progresso/treino/${workoutId}/${workoutExercise.exerciseId}`} key={workoutExercise.id}>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 hover:border-zinc-700/50 transition-all shadow-sm group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white group-hover:text-primary transition-colors">{workoutExercise.exercise.name}</h4>
                  <p className="text-xs text-zinc-400">
                    {lastVolume > 0 ? `Último volume: ${lastVolume} kg` : "Nenhum volume registrado ainda"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-zinc-500 group-hover:text-primary transition-colors relative z-10">
                <span>Analisar Evolução</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}
